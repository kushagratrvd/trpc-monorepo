import type { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

export function rateLimiter(options: { windowMs: number; max: number; message?: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (
      req.headers["x-forwarded-for"] as string ||
      req.socket.remoteAddress ||
      "unknown"
    ).split(",")[0]?.trim() || "unknown";

    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();

    let record = store.get(key);

    if (!record || now > record.resetAt) {
      record = {
        count: 0,
        resetAt: now + options.windowMs,
      };
    }

    record.count++;
    store.set(key, record);

    res.setHeader("X-RateLimit-Limit", options.max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, options.max - record.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetAt / 1000));

    if (record.count > options.max) {
      res.status(429).json({
        error: {
          code: "TOO_MANY_REQUESTS",
          message: options.message || "Too many requests, please try again later.",
        },
      });
      return;
    }

    next();
  };
}
