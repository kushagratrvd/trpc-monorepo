import { z, zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import { getAuthenticationMethodOutputSchema } from "@repo/services/user/model";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createUserWithEmailAndPasswordInputModel, createUserWithEmailAndPasswordOutputModel, getLoggedInUserInfoInputModel, getLoggedInUserInfoOutputModel, signInUserWithEmailAndPasswordInputModel, signInUserWithEmailAndPasswordOutputModel } from "./model";
import { getAuthenticationCookie, setAuthenticationCookie } from "../../utils/cookie";

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
      
      const { id, token } = await userService.createUserWithEmailAndPassword({
        fullName, email, password
      })

      setAuthenticationCookie(ctx, token);

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
      const { id, token } = await userService.signInUserWithEmailAndPassword({
        email, password
      })

      setAuthenticationCookie(ctx, token);

      return {
        id
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
