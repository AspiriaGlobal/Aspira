// auth.service.ts
import { findUserByEmail, createUser, saveRefreshToken, findRefreshTokensByUserId, deleteRefreshTokenById, findUserByGoogleId, linkGoogleId} from "./auth.repository";
import { comparePassword, hashPassword } from "../../utils/hash";
import { AppError } from "../../utils/AppError";
import { SignupInput } from "./auth.schema";
import { generateAccessToken, generateRefreshToken, REFRESH_TOKEN_EXPIRY_MS, verifyRefreshToken} from "../../utils/token";
import { OAuth2Client} from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
async function issueTokens(userId: string) {
  const accessToken = generateAccessToken({ userId });
  const refreshToken = generateRefreshToken({ userId });

  const tokenHash = await hashPassword(refreshToken);
  await saveRefreshToken({
    userId,
    tokenHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });

  return { accessToken, refreshToken };
}

export const signupUser = async (input: SignupInput) => {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await createUser({
    email: input.email,
    passwordHash,
    name: input.name,
  });

  const { accessToken, refreshToken } = await issueTokens(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (data: { email: string; password: string }) => {
  const user = await findUserByEmail(data.email);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

    if (!user.passwordHash) {
    // User exists but has no password set — they signed up via Google only.
    throw new AppError("Invalid email or password", 401);
  }

  const isValid = await comparePassword(data.password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const { accessToken, refreshToken } = await issueTokens(user.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};

export const refreshTokens = async (incomingToken: string) => {
  let payload;
  try {
    payload = verifyRefreshToken(incomingToken);
  } catch {
    // signature invalid or token expired at the JWT level
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const candidates = await findRefreshTokensByUserId(payload.userId);

  let matchedTokenId: string | null = null;
  for (const candidate of candidates) {
    const isMatch = await comparePassword(incomingToken, candidate.tokenHash);
    if (isMatch) {
      matchedTokenId = candidate.id;
      break;
    }
  }

  if (!matchedTokenId) {
    // JWT was valid, but no matching hash in the DB — it's already been
    // rotated out (reused) or was revoked. Treat as a hard failure.
    throw new AppError("Refresh token not recognized", 401);
  }

  // Rotation: destroy the used token before issuing a new one,
  // so it can never be replayed even if it leaks.
  await deleteRefreshTokenById(matchedTokenId);

  const { accessToken, refreshToken } = await issueTokens(payload.userId);

  return { accessToken, refreshToken };
};
export const logoutUser = async (incomingToken: string) => {
  let payload;
  try {
    payload = verifyRefreshToken(incomingToken);
  } catch {
    // Token invalid/expired — nothing to revoke server-side, but that's fine,
    // logout should still succeed from the client's perspective.
    return;
  }

  const candidates = await findRefreshTokensByUserId(payload.userId);

  for (const candidate of candidates) {
    const isMatch = await comparePassword(incomingToken, candidate.tokenHash);
    if (isMatch) {
      await deleteRefreshTokenById(candidate.id);
      break;
    }
  }
};

export const loginWithGoogle = async (idToken: string) => {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError("Invalid Google ID token", 401);
  }

  if (!payload || !payload.email) {
    throw new AppError("Invalid Google ID token", 401);
  }

  const { sub: googleId, email, email_verified, name } = payload;

  // Case 1: already linked — this googleId maps to a known user
  const existingUser = await findUserByGoogleId(googleId);
  if (existingUser) {
    const { accessToken, refreshToken } = await issueTokens(existingUser.id);
    return {
      accessToken,
      refreshToken,
      user: { id: existingUser.id, email: existingUser.email, name: existingUser.name },
    };
  }

  // Case 2: user signed up with email/password before, now using Google for the first time
  const userByEmail = await findUserByEmail(email);
  if (userByEmail) {
    if (!email_verified) {
      throw new AppError("Google email is not verified", 401);
    }
    await linkGoogleId(userByEmail.id, googleId);
    const { accessToken, refreshToken } = await issueTokens(userByEmail.id);
    return {
      accessToken,
      refreshToken,
      user: { id: userByEmail.id, email: userByEmail.email, name: userByEmail.name },
    };
  }

  // Case 3: brand new user — never existed by googleId or email
  const newUser = await createUser({
    email,
    name: name ?? "Google User",
    googleId,
  });
  const { accessToken, refreshToken } = await issueTokens(newUser.id);
  return {
    accessToken,
    refreshToken,
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
  };
};