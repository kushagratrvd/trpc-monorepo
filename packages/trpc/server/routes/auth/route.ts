import { z, zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import { TRPCError } from "@trpc/server";
import { getAuthenticationMethodOutputSchema } from "@repo/services/user/model";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createUserWithEmailAndPasswordInputModel, createUserWithEmailAndPasswordOutputModel, getLoggedInUserInfoInputModel, getLoggedInUserInfoOutputModel, signInUserWithEmailAndPasswordInputModel, signInUserWithEmailAndPasswordOutputModel, signInWithGoogleInputModel, signInWithGoogleOutputModel } from "./model";
import { getAuthenticationCookie, getRefreshTokenCookie, setAuthenticationCookies, clearAuthenticationCookies } from "../../utils/cookie";
import { ApiError } from "@repo/services/errors";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({

  createUserWithEmailAndPassword: publicProcedure
    .meta({openapi: {
      method: 'POST',
      path: getPath('/createUserWithEmailAndPassword'),
      tags: TAGS
    }})
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { fullName, email, password } = input
      
      const { id, accessToken, refreshToken } = await userService.createUserWithEmailAndPassword({
        fullName, email, password
      })

      setAuthenticationCookies(ctx, accessToken, refreshToken);

      return {
        id
      }
    }),

  signInUserWithEmailAndPassword: publicProcedure
    .meta({openapi: {
      method: 'POST',
      path: getPath('/signInUserWithEmailAndPassword'),
      tags: TAGS
    }})
    .input(signInUserWithEmailAndPasswordInputModel)
    .output(signInUserWithEmailAndPasswordOutputModel)
    .mutation(async({ input, ctx }) => {
    const { email, password } = input;
      const { id, accessToken, refreshToken } = await userService.signInUserWithEmailAndPassword({
        email, password
      })

      setAuthenticationCookies(ctx, accessToken, refreshToken);

      return {
        id
      }
    }),

  signInWithGoogle: publicProcedure
    .meta({openapi: {
      method: 'POST',
      path: getPath('/signInWithGoogle'),
      tags: TAGS
    }})
    .input(signInWithGoogleInputModel)
    .output(signInWithGoogleOutputModel)
    .mutation(async({ input, ctx }) => {
      const { code } = input;
      const { id, accessToken, refreshToken } = await userService.signInWithGoogle(code);

      setAuthenticationCookies(ctx, accessToken, refreshToken);

      return {
        id
      }
    }),

  signOut: publicProcedure
    .meta({openapi: {
      method: 'POST',
      path: getPath('/signOut'),
      tags: TAGS
    }})
    .input(zodUndefinedModel)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      const accessToken = getAuthenticationCookie(ctx);
      const refreshTokenValue = getRefreshTokenCookie(ctx);

      if (accessToken) {
        try {
          const payload = await userService.verifyAndDecodeUserToken(accessToken);
          await userService.invalidateUserSessions(payload.id);
        } catch {
          // Access token expired — try to find userId via refresh token
          if (refreshTokenValue) {
            try {
              await userService.invalidateSessionByRefreshToken(refreshTokenValue);
            } catch { /* ignore — still clear cookies below */ }
          }
        }
      } else if (refreshTokenValue) {
        // No access token at all, but refresh token exists
        try {
          await userService.invalidateSessionByRefreshToken(refreshTokenValue);
        } catch { /* ignore */ }
      }

      clearAuthenticationCookies(ctx);
      return { success: true };
    }),

  refreshToken: publicProcedure
    .meta({openapi: {
      method: 'POST',
      path: getPath('/refreshToken'),
      tags: TAGS
    }})
    .input(z.object({ refreshToken: z.string().optional() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const token = input.refreshToken || ctx.getCookie('refresh-token');
      if (!token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No refresh token provided"
        });
      }
      
      try {
        const { accessToken, refreshToken } = await userService.refreshUserSession({ refreshToken: token });
        setAuthenticationCookies(ctx, accessToken, refreshToken);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error instanceof Error ? error.message : "Refresh session failed",
          cause: error
        });
      }
    }),

  getLoggedInUserInfo: authenticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/getLoggedInUserInfo"), tags: TAGS, protect: true } })
    .input(getLoggedInUserInfoInputModel)
    .output(getLoggedInUserInfoOutputModel)
    .query(async ({ ctx }) => {

      const { id, email, fullName, profileImageUrl } = await userService.getUserInfoById(ctx.user.id)
      return {
        id, email, fullName, profileImageUrl
      }
    }),

  getSupportedAuthenticationProviders: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/supported-providers"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.readonly(z.array(getAuthenticationMethodOutputSchema)))
    .query(async () => {
      const supportedMethods = await userService.getAuthenticationMethods();
      return supportedMethods;
    }),
});
