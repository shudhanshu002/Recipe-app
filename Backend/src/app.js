import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import './config/passport.js';

import rootRouter from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

const allowedOrigins = [
  'http://localhost:3000', // Local Development
  'http://localhost:5173',
  process.env.CLIENT_URL, // Main Production URL (set in Render)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin is in our explicit allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ✅ SPECIAL FIX: Allow ANY Vercel Preview Deployment
      // This regex allows any URL ending in .vercel.app
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Otherwise block
      const msg =
        'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    },
    credentials: true, // Allow cookies to be sent
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  })
);

// Security Middlewares
app.use(helmet()); // Secure HTTP headers

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter); // Apply rate limiting to API routes

// middlewares
app.use(express.json({ limit: '50mb' })); // Changed from 5gb to prevent memory exhaustion
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(passport.initialize());

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

app.use('/api/v1', rootRouter);

app.use(errorHandler);

export default app;
