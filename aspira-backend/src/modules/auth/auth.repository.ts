import prisma from "../../config/db";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const createUser = async (data: {
  email: string;
  passwordHash?: string;
  name: string;
  googleId?: string;
}) => {
  return prisma.user.create({ data });
};

export const linkGoogleId = async (userId: string, googleId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { googleId },
  });
}
export const saveRefreshToken = async (data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) => {
  return prisma.refreshToken.create({ data });
};

// auth.repository.ts (add these two, keep existing ones)

export const findRefreshTokensByUserId = async (userId: string) => {
  return prisma.refreshToken.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() }, // ignore already-expired rows
    },
  });
};

export const deleteRefreshTokenById = async (id: string) => {
  return prisma.refreshToken.delete({ where: { id } });
};

export async function findUserByGoogleId(googleId: string) {
  return prisma.user.findUnique({ where: { googleId } });
}