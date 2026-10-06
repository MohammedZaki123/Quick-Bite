import express from 'express';
import {routes} from './routes';
import {correlationId} from "./lib/correlationID/correlationID";
import {errorHandler} from "./lib/error/errorHandler";
import cors from "cors";
import cookieParser from "cookie-parser";
import {env} from "./lib/config/env";
import helmet from "helmet";

export function createApp() {
    const app = express();
    app.use(helmet());
    app.use(cors({origin: env.cors.origins, credentials: true}))
    app.set('query parser','extended');
    // app.use(express.json({
    //     verify: (req, _res, buf) => {
    //         (req as any).rawBody = buf;
    //     }
    // }));
    app.use(express.json());
    app.use(cookieParser());
    app.use(correlationId);
    app.use('/api', routes);
    app.use(errorHandler)
    return app;
}