import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import morgan from 'morgan';
import { env } from './config/env.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendSuccess } from './utils/apiResponse.js';
import authRouter from './routes/auth.routes.js';
import publicRouter from './routes/public.routes.js';
import meRouter from './routes/me.routes.js';
import taskRouter from './routes/task.routes.js';
import mediaRouter from './routes/media.routes.js';
import teamRouter from './routes/team.routes.js';
import eventRouter from './routes/event.routes.js';
import topicRouter from './routes/topic.routes.js';
import articleRouter from './routes/article.routes.js';
import videoRouter from './routes/video.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import contactRouter from './routes/contact.routes.js';
import auditRouter from './routes/audit.routes.js';
import settingsRouter from './routes/settings.routes.js';
import { checkMaintenance } from './middleware/maintenance.js';
import { getSitemap, getRobotsTxt } from './controllers/public.controller.js';
import './models/index.js';

const app: Express = express();


// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// HTTP request logger in development
if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// General rate limiter
app.use(generalLimiter);

// API Root endpoint (serves styled HTML for browser visitors, JSON envelope for API clients)
app.get('/', (req: Request, res: Response) => {
  if (req.accepts('html') && !req.query.format) {
    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Qindil API — Service Operational</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0a0a0a;
      color: #F5F1EA;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background-image: radial-gradient(circle at 50% 20%, rgba(201, 160, 107, 0.08) 0%, transparent 60%);
    }
    .card {
      background-color: #141414;
      border: 1px solid #262626;
      border-radius: 16px;
      max-width: 520px;
      width: 100%;
      padding: 2.5rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      text-align: center;
    }
    .emblem-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: rgba(201, 160, 107, 0.1);
      border: 1px solid rgba(201, 160, 107, 0.25);
      margin-bottom: 1.5rem;
    }
    .emblem-wrapper svg {
      width: 36px;
      height: 36px;
      fill: #C9A06B;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #F5F1EA;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }
    p.subtitle {
      font-size: 0.875rem;
      color: #A8A29E;
      margin-bottom: 1.5rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(22, 163, 74, 0.12);
      border: 1px solid rgba(22, 163, 74, 0.3);
      color: #4ADE80;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 9999px;
      margin-bottom: 2rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #22C55E;
      box-shadow: 0 0 10px #22C55E;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
      100% { opacity: 1; transform: scale(1); }
    }
    .json-box {
      background-color: #0d0d0d;
      border: 1px solid #262626;
      border-radius: 10px;
      padding: 1.25rem;
      text-align: left;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8125rem;
      color: #A8A29E;
      margin-bottom: 2rem;
      overflow-x: auto;
    }
    .json-key { color: #C9A06B; }
    .json-string { color: #4ADE80; }
    .json-boolean { color: #60A5FA; }
    .json-null { color: #F43F5E; }
    .btn-group {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn-primary {
      background-color: #C9A06B;
      color: #0a0a0a;
    }
    .btn-primary:hover {
      background-color: #DDB588;
    }
    .btn-secondary {
      background-color: #1a1a1a;
      color: #F5F1EA;
      border: 1px solid #262626;
    }
    .btn-secondary:hover {
      border-color: #C9A06B;
      color: #C9A06B;
    }
    footer {
      margin-top: 2rem;
      font-size: 0.75rem;
      color: #78716C;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="emblem-wrapper">
      <svg viewBox="0 0 100 100">
        <path d="M50 10 L75 25 L75 60 L50 90 L25 60 L25 25 Z" fill="none" stroke="#C9A06B" stroke-width="4" />
        <path d="M50 25 L65 35 L65 55 L50 75 L35 55 L35 35 Z" fill="#C9A06B" />
      </svg>
    </div>
    <h1>Qindil API Services</h1>
    <p class="subtitle">Islamic Apologetics & Intellectual Research Platform</p>

    <div class="badge">
      <span class="pulse-dot"></span>
      Operational
    </div>

    <div class="json-box">
      <pre><code>{
  <span class="json-key">"success"</span>: <span class="json-boolean">true</span>,
  <span class="json-key">"data"</span>: {
    <span class="json-key">"service"</span>: <span class="json-string">"Qindil API"</span>,
    <span class="json-key">"status"</span>: <span class="json-string">"operational"</span>,
    <span class="json-key">"docs"</span>: <span class="json-null">null</span>
  }
}</code></pre>
    </div>

    <div class="btn-group">
      <a href="https://qindilapologetics.com" class="btn btn-primary">Main Platform</a>
      <a href="/api/v1/health" class="btn btn-secondary">Health Status</a>
    </div>

    <footer>
      © Qindil Platform • All Rights Reserved
    </footer>
  </div>
</body>
</html>`;
    return res.type('html').send(htmlTemplate);
  }

  return sendSuccess(res, {
    service: 'Qindil API',
    status: 'operational',
    docs: null,
  });
});

// Health check endpoint
app.get('/api/v1/health', (_req: Request, res: Response) => {
  sendSuccess(res, { status: 'ok' });
});

// Domain root SEO endpoints
// Domain root SEO endpoints
app.get('/sitemap.xml', getSitemap);
app.get('/robots.txt', getRobotsTxt);

// Maintenance mode check middleware (intercepts public routes when maintenance mode is active)
app.use(checkMaintenance);

// Public routes (no auth required)
app.use('/api/v1/public', publicRouter);

// Authentication routes
app.use('/api/v1/auth', authRouter);

// Personal user routes (protected)
app.use('/api/v1/me', meRouter);

// Task routes (protected, admin ranks)
app.use('/api/v1/tasks', taskRouter);

// Media routes (protected, admin ranks)
app.use('/api/v1/media', mediaRouter);

// Team management routes (protected, superAdmin only)
app.use('/api/v1/team', teamRouter);

// Event / Calendar routes (protected, admin ranks)
app.use('/api/v1/events', eventRouter);

// Topic management routes (protected, superAdmin only)
app.use('/api/v1/topics', topicRouter);

// Article authoring & draft routes (protected, admin ranks)
app.use('/api/v1/articles', articleRouter);

// Video production board routes (protected, admin ranks)
app.use('/api/v1/videos', videoRouter);

// System analytics routes (protected, superAdmin only)
app.use('/api/v1/analytics', analyticsRouter);

// Contact messages inbox routes (protected, superAdmin only)
app.use('/api/v1/contact-messages', contactRouter);

// System audit log routes (protected, superAdmin only)
app.use('/api/v1/audit-log', auditRouter);

// Site settings routes (public read, superAdmin write)
app.use('/api/v1/settings', settingsRouter);

// 404 handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);


export default app;
