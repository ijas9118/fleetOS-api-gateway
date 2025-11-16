import type { Application } from "express";
import type { Options } from "http-proxy-middleware";

import { createProxyMiddleware } from "http-proxy-middleware";

import type { ServiceConfig } from "./service.config";

import { STATUS_CODES } from "./constants/status-codes.constant";
import logger from "./logger.js";
import { SERVICES } from "./service.config";

class ServiceProxy {
  public static createProxyOptions(service: ServiceConfig): Options {
    return {
      target: service.url,
      changeOrigin: true,
      pathRewrite: service.pathRewrite,
      logger,
      on: {
        error: ServiceProxy.handleProxyError,
        proxyReq: ServiceProxy.handleProxyRequest,
        proxyRes: ServiceProxy.handleProxyResponse,
      },
    };
  }

  private static handleProxyRequest(proxyReq: any, req: any, _res: any) {
    const rewrittenPath = proxyReq.path;

    logger.info(
      `[ProxyReq] ${req.method} ${req.originalUrl} -> ${proxyReq.protocol}//${proxyReq.host}${rewrittenPath}`,
    );
  }

  private static handleProxyResponse(proxyRes: any, req: any, _res: any) {
    logger.info(
      `[ProxyRes] ${req.method} ${req.originalUrl} <- ${proxyRes.statusCode}`,
    );
  }

  private static handleProxyError(err: Error, req: any, res: any): void {
    logger.error(`Proxy error for ${req.path}:`, err);

    const errorResponse = {
      message: "Service unavailable",
      status: STATUS_CODES.SERVICE_UNAVAILABLE,
      timestamp: new Date().toISOString(),
    };

    res
      .status(STATUS_CODES.SERVICE_UNAVAILABLE)
      .setHeader("Content-Type", "application/json")
      .end(JSON.stringify(errorResponse));
  }

  public static setupProxy(app: Application): void {
    SERVICES.forEach((service) => {
      const proxyOptions = ServiceProxy.createProxyOptions(service);
      app.use(service.path, createProxyMiddleware(proxyOptions));
      logger.info(`Configured proxy for ${service.name} at ${service.path}`);
    });
  }
}

export function proxyServices(app: Application): void {
  ServiceProxy.setupProxy(app);
}
