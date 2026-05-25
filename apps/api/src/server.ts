import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";
import cookieParser from 'cookie-parser'
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env";

export const app = express();
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Formz OpenAPI",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true
  }),
);

app.use(cookieParser())

app.use(helmet());

// Rate limit authentication routes (strict: 10 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many authentication attempts, please try again in 15 minutes."
    }
  }
});

app.use("/api/authentication/createUserWithEmailAndPassword", authLimiter);
app.use("/api/authentication/signInUserWithEmailAndPassword", authLimiter);
app.use("/trpc/createUserWithEmailAndPassword", authLimiter);
app.use("/trpc/signInUserWithEmailAndPassword", authLimiter);

// Rate limit public submissions (medium: 30 submissions per hour per IP)
const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many form submissions, please try again in an hour."
    }
  }
});

app.use("/api/form/submitForm", submissionLimiter);
app.use("/trpc/submitForm", submissionLimiter);

app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ message: "Formz is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "Formz server is healthy", healthy: true });
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
