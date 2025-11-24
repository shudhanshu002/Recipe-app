import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import rootRouter from './routes/index.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

//middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieParser());
app.use(morgan('dev'));

//health-route
app.get('/', (req,res)=> {
    res.send('Recipe Platform API is running...');
});

app.use("/api/v1", rootRouter);

export default app;