import { z } from "zod";

export const getAuthenticationMethodOutputSchema = z.object({
  provider: z.enum(["GOOGLE_OAUTH"]),
  displayName: z.string().optional(),
  displayText: z.string().optional(),
  authUrl: z.string(),
});

export const createUserWithEmailAndPasswordInput = z.object({
  fullName: z.string().describe('Full name of the user'),
  email: z.email().describe('email address of the user'),
  password: z.string().describe('password of the user')
})

export const generateUserTokenPayload = z.object({
  id: z.string().describe("uuid of the user"),
})

export type CreateUserWithEmailAndPasswordInputType = z.infer<typeof createUserWithEmailAndPasswordInput>

export type GetAuthenticationMethodOutputSchema = z.infer<
  typeof getAuthenticationMethodOutputSchema
>;

export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>

export const signInUserWithEmailAndPasswordInput = z.object({
  email: z.email().describe('email of the user'),
  password: z.string().describe('password of the user')
})

export type signInUserWithEmailAndPasswordInputType = z.infer<typeof signInUserWithEmailAndPasswordInput>