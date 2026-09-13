import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

import { env } from '../config/env.js';
import { UserModel } from '../models/User.model.js';
import { RefreshTokenModel } from '../models/RefreshToken.model.js';
import { IRole, RoleModel } from '../models/Role.model.js';
import { ApiError } from '../utils/apiError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateOtp, hashOtp, compareOtp } from '../services/otp.js';
import { sendOtpEmail } from '../services/email/index.js';
import { resolvePermissions } from '../utils/resolvePermissions.js';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  domain: env.COOKIE_DOMAIN && env.COOKIE_DOMAIN !== 'localhost' ? env.COOKIE_DOMAIN : undefined,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
});

const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  domain: env.COOKIE_DOMAIN && env.COOKIE_DOMAIN !== 'localhost' ? env.COOKIE_DOMAIN : undefined,
});

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const sanitizeUser = (user: any) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  delete obj.otpHash;
  delete obj.otpExpiresAt;
  return obj;
};

// @desc    Register a new local user
// @route   POST /api/v1/auth/register
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, avatarUrl } = req.body;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists', 'EMAIL_IN_USE');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Ensure default user role exists
  let userRole = await RoleModel.findOne({ name: { $regex: /^user$/i } });
  if (!userRole) {
    try {
      userRole = await RoleModel.create({ name: 'user', permissions: ['read:articles', 'bookmark:articles'] });
    } catch {
      // Role creation fallback if concurrent
      userRole = await RoleModel.findOne({ name: { $regex: /^user$/i } });
    }
  }
  const roles = userRole ? [userRole._id] : [];

  const user = await UserModel.create({
    name,
    email,
    passwordHash,
    avatarUrl: avatarUrl || undefined,
    roles,
    authProvider: 'local',
    emailVerified: false,
    otpHash,
    otpExpiresAt,
  });

  try {
    await sendOtpEmail(email, otp, 'verification');
  } catch (emailError) {
    console.error('[AUTH] Non-fatal error sending verification email:', emailError);
  }

  sendSuccess(
    res,
    {
      user: sanitizeUser(user),
      message: 'Registration successful. Verification OTP sent to email.',
    },
    undefined,
    201
  );
});

// @desc    Verify OTP for email registration or reset
// @route   POST /api/v1/auth/verify-otp
export const verifyOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user || !user.otpHash || !user.otpExpiresAt) {
    throw ApiError.badRequest('Invalid request or OTP expired', 'INVALID_OTP');
  }

  if (user.otpExpiresAt < new Date()) {
    throw ApiError.badRequest('OTP has expired', 'OTP_EXPIRED');
  }

  const isMatch = await compareOtp(otp, user.otpHash);
  if (!isMatch) {
    throw ApiError.badRequest('Invalid OTP code', 'INVALID_OTP');
  }

  user.emailVerified = true;
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  const populatedUser = await UserModel.findById(user._id).populate('roles');
  const roleNames = populatedUser?.roles
    ? populatedUser.roles.map((r: any) => (r as IRole).name || r.toString())
    : ['user'];
  const accessToken = signAccessToken({ userId: user._id.toString(), roles: roleNames });
  const rawRefreshToken = signRefreshToken({ userId: user._id.toString() });

  const tokenHash = hashToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await RefreshTokenModel.create({
    user: user._id,
    tokenHash,
    expiresAt,
  });

  res.cookie('refreshToken', rawRefreshToken, getCookieOptions());

  sendSuccess(res, {
    message: 'Email verified successfully.',
    accessToken,
    user: sanitizeUser(populatedUser || user),
  });
});

// @desc    Login with local credentials
// @route   POST /api/v1/auth/login
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email }).populate('roles');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (!user.passwordHash) {
    throw ApiError.badRequest(
      'This account was created with Google. Please log in using Google.',
      'USE_GOOGLE_AUTH'
    );
  }

  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordMatch) {
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (!user.emailVerified) {
    throw ApiError.badRequest(
      'Please verify your email address before logging in.',
      'EMAIL_NOT_VERIFIED'
    );
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('Account has been deactivated.', 'ACCOUNT_DEACTIVATED');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const roleNames = user.roles.map((r: any) => (r as IRole).name || r.toString());
  const accessToken = signAccessToken({ userId: user._id.toString(), roles: roleNames });
  const rawRefreshToken = signRefreshToken({ userId: user._id.toString() });

  const tokenHash = hashToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await RefreshTokenModel.create({
    user: user._id,
    tokenHash,
    expiresAt,
  });

  res.cookie('refreshToken', rawRefreshToken, getCookieOptions());

  sendSuccess(res, {
    accessToken,
    user: sanitizeUser(user),
  });
});

// @desc    Login/Register via Google Identity Services
// @route   POST /api/v1/auth/google
export const googleLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
  } catch (err) {
    throw ApiError.unauthorized('Invalid Google ID token', 'INVALID_GOOGLE_TOKEN');
  }

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw ApiError.unauthorized('Google ID token missing email payload', 'INVALID_GOOGLE_TOKEN');
  }

  const { email, name, sub: googleId, picture: avatarUrl } = payload;

  let user = await UserModel.findOne({ $or: [{ googleId }, { email }] }).populate('roles');

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = user.passwordHash ? 'both' : 'google';
    }
    user.emailVerified = true;
    // Set initial Google avatar if user has not set an avatar yet (preserves user updates)
    if (avatarUrl && !user.avatarUrl) {
      user.avatarUrl = avatarUrl;
    }
    if (name && (!user.name || user.name === 'Google User')) {
      user.name = name;
    }
    if (!user.roles || user.roles.length === 0) {
      const userRole = await RoleModel.findOne({ name: 'user' });
      if (userRole) {
        user.roles = [userRole._id as any];
      }
    }
    user.lastLoginAt = new Date();
    await user.save();
    user = await user.populate('roles');
  } else {
    const userRole = await RoleModel.findOne({ name: 'user' });
    const roles = userRole ? [userRole._id] : [];

    user = await UserModel.create({
      name: name || 'Google User',
      email,
      googleId,
      authProvider: 'google',
      avatarUrl: avatarUrl || undefined,
      roles,
      emailVerified: true,
      lastLoginAt: new Date(),
    });
    user = await user.populate('roles');
  }

  const roleNames = user.roles ? user.roles.map((r: any) => (r as IRole).name || r.toString()) : [];
  const accessToken = signAccessToken({ userId: user._id.toString(), roles: roleNames });
  const rawRefreshToken = signRefreshToken({ userId: user._id.toString() });

  const tokenHash = hashToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await RefreshTokenModel.create({
    user: user._id,
    tokenHash,
    expiresAt,
  });

  res.cookie('refreshToken', rawRefreshToken, getCookieOptions());

  sendSuccess(res, {
    accessToken,
    user: sanitizeUser(user),
  });
});

// @desc    Refresh access token & rotate refresh token
// @route   POST /api/v1/auth/refresh
export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const rawToken = req.cookies?.refreshToken;
  if (!rawToken) {
    throw ApiError.unauthorized('Refresh token missing', 'NO_REFRESH_TOKEN');
  }

  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch (err) {
    res.clearCookie('refreshToken', getClearCookieOptions());
    throw ApiError.unauthorized('Refresh token expired or invalid', 'INVALID_REFRESH_TOKEN');
  }

  const incomingHash = hashToken(rawToken);
  const storedToken = await RefreshTokenModel.findOne({
    user: payload.userId,
    tokenHash: incomingHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!storedToken) {
    res.clearCookie('refreshToken', getClearCookieOptions());
    throw ApiError.unauthorized('Refresh token revoked or invalid', 'REVOKED_REFRESH_TOKEN');
  }

  // Revoke current refresh token (rotation)
  storedToken.revokedAt = new Date();
  await storedToken.save();

  const user = await UserModel.findById(payload.userId).populate('roles');
  if (!user || !user.isActive) {
    res.clearCookie('refreshToken', getClearCookieOptions());
    throw ApiError.unauthorized('User not found or deactivated', 'USER_DEACTIVATED');
  }

  const roleNames = user.roles.map((r: any) => (r as IRole).name || r.toString());
  const newAccessToken = signAccessToken({ userId: user._id.toString(), roles: roleNames });
  const newRawRefreshToken = signRefreshToken({ userId: user._id.toString() });

  const newTokenHash = hashToken(newRawRefreshToken);
  const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await RefreshTokenModel.create({
    user: user._id,
    tokenHash: newTokenHash,
    expiresAt: newExpiresAt,
  });

  res.cookie('refreshToken', newRawRefreshToken, getCookieOptions());

  sendSuccess(res, {
    accessToken: newAccessToken,
  });
});

// @desc    Logout user and revoke refresh token
// @route   POST /api/v1/auth/logout
export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const rawToken = req.cookies?.refreshToken;
  if (rawToken) {
    const incomingHash = hashToken(rawToken);
    await RefreshTokenModel.findOneAndUpdate(
      { tokenHash: incomingHash, revokedAt: null },
      { revokedAt: new Date() }
    );
  }

  res.clearCookie('refreshToken', getClearCookieOptions());
  sendSuccess(res, { message: 'Logged out successfully' });
});

// @desc    Request password reset OTP
// @route   POST /api/v1/auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    // Return 200 to prevent email enumeration
    sendSuccess(res, { message: 'If an account exists with that email, an OTP has been sent.' });
    return;
  }

  const otp = generateOtp();
  user.otpHash = await hashOtp(otp);
  user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  await sendOtpEmail(email, otp, 'password_reset');

  sendSuccess(res, { message: 'If an account exists with that email, an OTP has been sent.' });
});

// @desc    Reset password using OTP
// @route   POST /api/v1/auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, otp, newPassword } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user || !user.otpHash || !user.otpExpiresAt) {
    throw ApiError.badRequest('Invalid request or OTP expired', 'INVALID_OTP');
  }

  if (user.otpExpiresAt < new Date()) {
    throw ApiError.badRequest('OTP has expired', 'OTP_EXPIRED');
  }

  const isMatch = await compareOtp(otp, user.otpHash);
  if (!isMatch) {
    throw ApiError.badRequest('Invalid OTP code', 'INVALID_OTP');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  // Invalidate all active refresh tokens for user
  await RefreshTokenModel.updateMany(
    { user: user._id, revokedAt: null },
    { revokedAt: new Date() }
  );

  sendSuccess(res, { message: 'Password reset successfully. Please log in with your new password.' });
});

// @desc    Get current logged in user profile
// @route   GET /api/v1/auth/me
export const me = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const permissions = resolvePermissions(req.user!);

  sendSuccess(res, {
    user: sanitizeUser(req.user!),
    permissions,
  });
});
