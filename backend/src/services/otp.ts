import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const hashOtp = async (otp: string): Promise<string> => {
  const salt = await bcrypt.genSalt(6);
  return bcrypt.hash(otp, salt);
};

export const compareOtp = async (otp: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(otp, hash);
};
