import { randomBytes, createHmac } from "node:crypto"
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/schema";
import { env } from "../env";
import * as JWT from "jsonwebtoken";
import { googleOAuth2Client } from "../clients/google-oauth";
import { type CreateUserWithEmailAndPasswordInputType, createUserWithEmailAndPasswordInput, generateUserTokenPayload, type GenerateUserTokenPayloadType, signInUserWithEmailAndPasswordInput, type signInUserWithEmailAndPasswordInputType, GetAuthenticationMethodOutputSchema} from "./model";

class UserService {

  private async getUserByEmail(email: string){
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email))
    if(!result || result.length === 0) return null;
    return result[0];
  }

  private async generateUserToken(payload: GenerateUserTokenPayloadType){
    const { id } = await generateUserTokenPayload.parseAsync(payload)
    const token = JWT.sign({ id }, env.JWT_SECRET)
    return { token };
  }

  private async verifyUserToken(token: string): Promise<GenerateUserTokenPayloadType>{
    try {
      const verificationResult = JWT.verify(token, env.JWT_SECRET) as GenerateUserTokenPayloadType
      return verificationResult;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  public async getUserInfoById(id: string){
    const user = await db.select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      email: usersTable.email,
      profileImageUrl: usersTable.profileImageUrl,
    }).from(usersTable).where(eq(usersTable.id, id))

    if(!user || user.length === 0) throw new Error(`User with id ${id} does not exist`);
    return user[0]!;
  }

  private async generateHash(salt: string, password: string){
    return createHmac('sha256', salt).update(password).digest('hex')
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType){
    const { fullName, email, password } = await createUserWithEmailAndPasswordInput.parseAsync(payload)

    // Check if user is already existing or not
    const existingUserWithEmail = await this.getUserByEmail(email);
    if (existingUserWithEmail) throw new Error(`User with email ${email} already exists`)

    const salt = randomBytes(16).toString('hex');
    const hash = await this.generateHash(salt, password);

    const userInsertResult = await db.insert(usersTable).values({ email, fullName, password: hash, salt }).returning({ 
      id: usersTable.id
    })

    if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id) throw new Error(`something went wrong`);

    const userId = userInsertResult[0].id
    const { token } = await this.generateUserToken({ id: userId })

    return {
      id: userId, 
      token
    }
  }

  public async signInUserWithEmailAndPassword(payload: signInUserWithEmailAndPasswordInputType){
    const { email, password } = await signInUserWithEmailAndPasswordInput.parseAsync(payload)

    // Check if user is already existing or not
    const existingUser = await this.getUserByEmail(email);
    if (!existingUser) throw new Error(`User with email ${email} does not exist`)

    if(!existingUser.password || !existingUser.salt) throw new Error("Email or Password doesn't match");

    const hash = await this.generateHash(existingUser.salt, password);
    if(hash !== existingUser.password) throw new Error("Invalid email or password");

    const { token } = await this.generateUserToken({ id: existingUser.id })

    return {
      id: existingUser.id, 
      token
    }
  }

  public async verifyAndDecodeUserToken(token: string){
    const { id } = await this.verifyUserToken(token);
    return { id };
  }

  public async getAuthenticationMethods(): Promise<
    ReadonlyArray<GetAuthenticationMethodOutputSchema>
  > {
    const supportedAuthenticationProviders: GetAuthenticationMethodOutputSchema[] = [];

    const isGoogleConfigured = !!(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET);

    if (isGoogleConfigured) {
      const url = googleOAuth2Client.generateAuthUrl();
      supportedAuthenticationProviders.push({
        provider: "GOOGLE_OAUTH",
        displayName: "Google",
        displayText: "Signin with Google",
        authUrl: url,
      });
    }

    return supportedAuthenticationProviders;
  }
}

export default UserService;
