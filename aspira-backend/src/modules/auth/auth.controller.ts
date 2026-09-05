import { Request, Response, NextFunction } from "express";
import { signupSchema, loginSchema, googleAuthSchema } from "./auth.schema";
import { loginUser, refreshTokens, signupUser, logoutUser, loginWithGoogle } from "./auth.service";
import { AppError } from "../../utils/AppError";


export const signupController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const parsed = signupSchema.safeParse(req.body);


        if (!parsed.success) {
            const errors = parsed.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            return res.status(400).json({
                message: "Validation failed",
                errors,
            });
        }

        const { user, accessToken, refreshToken } = await signupUser(parsed.data);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 2 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            message: "Account created successfully",
            user,
            accessToken,
        });

    } catch (err) {
        next(err);
    }
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Validate
        const parsed = loginSchema.safeParse(req.body);

        if (!parsed.success) {
            const errors = parsed.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            return res.status(400).json({
                message: "Validation failed",
                errors,
            });
        }

        // 2. Call the service
        const { accessToken, refreshToken } = await loginUser(parsed.data);

        // 3. Set refreshToken as an httpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days, in ms
        });

        // 4. Send back accessToken + user — NOT refreshToken
        return res.status(200).json({
            message: "Login successful",
            accessToken,

        });

    } catch (error) {
        next(error);
    }
};


export const refreshController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incomingToken = req.cookies.refreshToken;

    if (!incomingToken) {
      return next(new AppError("No refresh token provided", 401));
    }

    const { accessToken, refreshToken } = await refreshTokens(incomingToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

export const logoutController = async (req: Request, res: Response) => {
  const incomingToken = req.cookies?.refreshToken;

  if (incomingToken) {
    await logoutUser(incomingToken);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

export const googleLoginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = googleAuthSchema.safeParse(req.body);

        if (!parsed.success) {
            const errors = parsed.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            return res.status(400).json({
                message: "Validation failed",
                errors,
            });
        }

        const { user, accessToken, refreshToken } = await loginWithGoogle(parsed.data.idToken);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 2 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Login successful",
            user,
            accessToken,
        });

    } catch (error) {
        next(error);
    }
};