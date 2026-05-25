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

      // 2. Custom ApiError
      if (cause instanceof ApiError) {
        return {
          ...shape,
          message: cause.message,
          data: {
            ...shape.data,
            code: cause.code,
            statusCode: cause.statusCode,
            details: cause.details,
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
  if(!userToken) {
    throw ApiError.unauthorized("User is not logged in", "UNAUTHORIZED");
  }

  const { id } = await userService.verifyAndDecodeUserToken(userToken)

  return options.next({
    ctx: {
      ...ctx, 
      user: { id }
    }
  })
})
