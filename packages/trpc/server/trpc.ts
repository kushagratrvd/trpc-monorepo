import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import { ZodError } from "zod";
import { ApiError } from "@repo/services/errors";

import { createContext } from "./context";
import { getAuthenticationCookie } from "./utils/cookie";
import { userService } from "./services";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({
    errorFormatter({ shape, error }) {
      const cause = error.cause;

      // 1. Zod Validation Error
      if (cause instanceof ZodError) {
        return {
          ...shape,
          message: "Validation failed",
          data: {
            ...shape.data,
            code: "VALIDATION_FAILED",
            statusCode: 400,
            details: cause.flatten().fieldErrors,
          }
        };
      }

      // 2. Custom ApiError (Safer fallback for cross-package class prototypes)
      const isApiError = cause instanceof ApiError || (
        cause &&
        typeof cause === "object" &&
        "statusCode" in cause &&
        "code" in cause &&
        typeof (cause as any).statusCode === "number" &&
        typeof (cause as any).code === "string"
      );

      if (isApiError) {
        const apiError = cause as any;
        return {
          ...shape,
          message: apiError.message,
          data: {
            ...shape.data,
            code: apiError.code,
            statusCode: apiError.statusCode,
            details: apiError.details,
          }
        };
      }

      // 3. Fallback unhandled errors
      return {
        ...shape,
        message: process.env.NODE_ENV === "production" ? "An unexpected server error occurred" : error.message,
        data: {
          ...shape.data,
          code: "INTERNAL_SERVER_ERROR",
          statusCode: 500,
        }
      };
    }
  });

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

export const authenticatedProcedure = tRPCContext.procedure.use(async options => {
  const { ctx } = options
  const userToken = getAuthenticationCookie(ctx)
  if (!userToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User is not logged in",
      cause: ApiError.unauthorized("User is not logged in", "UNAUTHORIZED")
    });
  }

  try {
    const { id } = await userService.verifyAndDecodeUserToken(userToken)
    return options.next({
      ctx: {
        ...ctx, 
        user: { id }
      }
    })
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
      cause: error
    });
  }
})
