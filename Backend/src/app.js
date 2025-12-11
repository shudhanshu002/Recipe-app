import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import "./config/passport.js"

import rootRouter from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js'

const app = express();

app.use(
    cors({
        origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
        credentials: true,
    }),
);

//middlewares
app.use(express.json({limit: "5gb"}));
app.use(express.urlencoded({extended: true, limit: "5gb"}));
app.use(express.static('public'));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(passport.initialize());

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

app.use("/api/v1", rootRouter);

app.use(errorHandler)

export default app;