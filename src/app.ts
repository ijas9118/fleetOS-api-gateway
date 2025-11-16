import type { Application, NextFunction, Request, Response } from "express";

import cors from "cors";
import express from "express";
import helmet from "helmet";

import { STATUS_CODES } from "./config/constants/status-codes.constant";
import logger from "./config/logger";
import { proxyServices } from "./config/service-proxy";
import { authMiddleware } from "./middlewares/auth.middleware";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error-handler.middleware";
import limiter from "./middlewares/rate-limit.middleware";

export default function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(helmet());

  app.use(limiter);

  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  });

  app.use(authMiddleware);

  app.get("/healthz", (_req: Request, res: Response) => {
    res.status(STATUS_CODES.OK).json({ status: "ok" });
  });

  proxyServices(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
