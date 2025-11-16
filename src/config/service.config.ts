import env from "./validate-env";

export interface PublicRoute {
  method: string;
  path: string;
}

export type ServiceConfig = {
  name: string;
  path: string;
  url: string;
  pathRewrite: Record<string, string>;
  publicRoutes: PublicRoute[];
};

export const SERVICES: ServiceConfig[] = [
  {
    name: "auth-service",
    path: "/api/v1/auth/",
    url: env.AUTH_SERVICE,
    pathRewrite: { "^/": "/api/v1/auth/" },
    publicRoutes: [
      { method: "POST", path: "/api/v1/auth/login" },
      { method: "POST", path: "/api/v1/auth/register" },
      { method: "POST", path: "/api/v1/auth/verify-otp" },
      { method: "POST", path: "/api/v1/auth/resend-otp" },
      { method: "POST", path: "/api/v1/auth/refresh" },
    ],
  },
];
