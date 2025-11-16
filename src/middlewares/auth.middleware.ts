import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import type { Role } from "@/config/constants/roles.constant";

import { STATUS_CODES } from "@/config/constants/status-codes.constant";
import logger from "@/config/logger";
import { SERVICES } from "@/config/service.config";
import env from "@/config/validate-env";
import { matchPath } from "@/utils/match-path";

type JWTPayload = {
  sub: string;
  email: string;
  role: Role;
  exp: number;
};

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const matchedService = SERVICES.find(service =>
    req.path.startsWith(service.path),
  );

  if (!matchedService)
    return next();

  const isPublic = matchedService.publicRoutes.some(
    (route) => {
      return route.method === req.method && matchPath(route.path, req.path);
    },
  );

  if (isPublic)
    return next();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      message: "Missing or invalid Authorization header",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.PUBLIC_KEY, {
      algorithms: ["RS256"],
    }) as JWTPayload;

    req.headers["x-user-id"] = decoded.sub as string;
    req.headers["x-user-email"] = decoded.email as string;
    req.headers["x-user-role"] = decoded.role as string;

    next();
  }
  catch (err) {
    logger.warn(`JWT verification failed: ${err}`);
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      message: "Invalid or expired token",
    });
  }
}
