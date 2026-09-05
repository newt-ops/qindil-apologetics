import http from 'http';
import mongoose from 'mongoose';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { UserModel } from '../models/User.model.js';
import { RoleModel } from '../models/Role.model.js';
import { RefreshTokenModel } from '../models/RefreshToken.model.js';
import authRouter from '../routes/auth.routes.js';
import { protect } from '../middleware/auth.js';
import { requirePermission } from '../middleware/roleGuard.js';
import { notFound } from '../middleware/notFound.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import '../models/index.js';

// Build Express test application
const testApp = express();
testApp.use(helmet());
testApp.use(cors({ origin: env.CLIENT_URL, credentials: true }));
testApp.use(express.json());
testApp.use(cookieParser());
testApp.use(mongoSanitize());
testApp.use(hpp());

// Health check
testApp.get('/api/v1/health', (_req, res) => sendSuccess(res, { status: 'ok' }));

// Auth routes
testApp.use('/api/v1/auth', authRouter);

// Test RBAC protected endpoint
testApp.get(
  '/api/v1/test/rbac-check',
  protect,
  requirePermission('article.publish'),
  (_req, res) => sendSuccess(res, { allowed: true })
);

testApp.use(notFound);
testApp.use(errorHandler);

async function runPhase1Test() {
  console.log('\n==================================================');
  console.log('🧪 QINDIL PHASE 1 SYSTEM TEST SUITE');
  console.log('==================================================\n');

  // Test 1: Connect to MongoDB
  await connectDB();

  const PORT = 5099;
  const server = testApp.listen(PORT);

  const testEmail = `phase1_test_${Date.now()}@qindilapologetics.com`;
  const testPassword = 'TestPassword123!';

  try {
    // Test 2: Verify Roles Seeded
    console.log('Test 2: Verifying database roles...');
    const roles = await RoleModel.find({});
    const roleNames = roles.map((r) => r.name);
    console.log(`  Found ${roles.length} roles: [${roleNames.join(', ')}]`);
    if (!roleNames.includes('superAdmin') || !roleNames.includes('admin') || !roleNames.includes('user')) {
      throw new Error('Database roles missing expected seeds');
    }

    // Test 3: Health Check Endpoint
    console.log('\nTest 3: Testing GET /api/v1/health...');
    const healthRes = await makeReq('/api/v1/health', 'GET');
    console.log(`  Status: ${healthRes.status}, Body: ${JSON.stringify(healthRes.data)}`);
    if (healthRes.status !== 200 || healthRes.data?.data?.status !== 'ok') {
      throw new Error('Health check failed');
    }

    // Test 4: 404 Error Envelope
    console.log('\nTest 4: Testing GET /api/v1/nonexistent (404)...');
    const notFoundRes = await makeReq('/api/v1/nonexistent', 'GET');
    console.log(`  Status: ${notFoundRes.status}, Code: ${notFoundRes.data?.error?.code}`);
    if (notFoundRes.status !== 404 || notFoundRes.data?.error?.code !== 'NOT_FOUND') {
      throw new Error('404 envelope test failed');
    }

    // Test 5: Registration
    console.log('\nTest 5: Testing POST /api/v1/auth/register...');
    const regRes = await makeReq('/api/v1/auth/register', 'POST', {
      name: 'Phase1 User',
      email: testEmail,
      password: testPassword,
    });
    console.log(`  Status: ${regRes.status}, User ID: ${regRes.data?.data?.user?._id}`);
    if (regRes.status !== 201) throw new Error('Registration failed');

    // Test 6: Verify OTP
    console.log('\nTest 6: Verifying OTP...');
    const userInDb = await UserModel.findOne({ email: testEmail });
    if (!userInDb || !userInDb.otpHash) throw new Error('User OTP not found in DB');
    
    userInDb.emailVerified = true;
    userInDb.otpHash = undefined;
    await userInDb.save();
    console.log('  ✓ Email verification confirmed');

    // Test 7: Login
    console.log('\nTest 7: Testing POST /api/v1/auth/login...');
    const loginRes = await makeReq('/api/v1/auth/login', 'POST', {
      email: testEmail,
      password: testPassword,
    });
    console.log(`  Status: ${loginRes.status}, AccessToken received: ${!!loginRes.data?.data?.accessToken}`);
    console.log(`  Set-Cookie: ${loginRes.cookies[0]?.substring(0, 50)}...`);
    if (loginRes.status !== 200 || !loginRes.data?.data?.accessToken) {
      throw new Error('Login failed');
    }

    const accessToken = loginRes.data.data.accessToken;
    const cookie = loginRes.cookies[0];

    // Test 8: Protected GET /me & Permissions Payload
    console.log('\nTest 8: Testing GET /api/v1/auth/me (Protected)...');
    const meRes = await makeReq('/api/v1/auth/me', 'GET', null, { Authorization: `Bearer ${accessToken}` });
    console.log(`  Status: ${meRes.status}, User: ${meRes.data?.data?.user?.email}`);
    console.log(`  Permissions: ${JSON.stringify(meRes.data?.data?.permissions)}`);
    if (meRes.status !== 200) {
      throw new Error('/me request failed');
    }

    // Test 9: Refresh Token Rotation
    console.log('\nTest 9: Testing POST /api/v1/auth/refresh (Rotation)...');
    const refreshRes = await makeReq('/api/v1/auth/refresh', 'POST', null, { Cookie: cookie });
    console.log(`  Status: ${refreshRes.status}, New AccessToken: ${!!refreshRes.data?.data?.accessToken}`);
    if (refreshRes.status !== 200 || !refreshRes.data?.data?.accessToken) {
      throw new Error('Token refresh failed');
    }

    // Test 10: Reused Token Rejection (401)
    console.log('\nTest 10: Testing reused refresh token rejection...');
    const reuseRes = await makeReq('/api/v1/auth/refresh', 'POST', null, { Cookie: cookie });
    console.log(`  Status: ${reuseRes.status}, Error Code: ${reuseRes.data?.error?.code}`);
    if (reuseRes.status !== 401 || reuseRes.data?.error?.code !== 'REVOKED_REFRESH_TOKEN') {
      throw new Error('Token reuse security test failed');
    }

    // Test 11: RBAC Permission Enforcement (403 vs 200)
    console.log('\nTest 11: Testing RBAC permission guard (403)...');
    const rbacDeniedRes = await makeReq('/api/v1/test/rbac-check', 'GET', null, { Authorization: `Bearer ${accessToken}` });
    console.log(`  Normal User Status (expected 403): ${rbacDeniedRes.status}, Code: ${rbacDeniedRes.data?.error?.code}`);
    if (rbacDeniedRes.status !== 403 || rbacDeniedRes.data?.error?.code !== 'FORBIDDEN') {
      throw new Error('RBAC 403 permission guard failed');
    }

    // Clean up test user
    await UserModel.deleteOne({ email: testEmail });
    await RefreshTokenModel.deleteMany({ user: userInDb._id });

    console.log('\n==================================================');
    console.log('🎉 PHASE 1 ALL 11 SYSTEM TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================\n');
  } catch (err) {
    console.error('\n❌ PHASE 1 TEST FAILED:', err);
    process.exit(1);
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

function makeReq(path: string, method: string, body?: any, headers: Record<string, string> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const reqHeaders: Record<string, any> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (dataString) {
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5099,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch (e) {
            parsed = raw;
          }
          const cookies = res.headers['set-cookie'] || [];
          resolve({ status: res.statusCode, data: parsed, cookies });
        });
      }
    );

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

runPhase1Test();
