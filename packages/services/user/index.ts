import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { db, eq, and, or, gt, lt, isNull, isNotNull, sql } from "@repo/database";
import { usersTable, sessionsTable } from "@repo/database/schema";
import { env } from "../env";
import * as JWT from "jsonwebtoken";
import { googleOAuth2Client } from "../clients/google-oauth";
import { type CreateUserWithEmailAndPasswordInputType, createUserWithEmailAndPasswordInput, signInUserWithEmailAndPasswordInput, type signInUserWithEmailAndPasswordInputType, GetAuthenticationMethodOutputSchema} from "./model";
import { ApiError } from "../errors";

interface AccessTokenPayload {
  id: string;
  type: "access";
}

class UserService {

  private async getUserByEmail(email: string){
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email))
    if(!result || result.length === 0) return null;
    return result[0];
  }

  public async generateUserTokens(userId: string) {
    const user = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.id, userId)).then(res => res[0]);
    if (!user) throw ApiError.unauthorized("User not found", "USER_NOT_FOUND");

    const accessToken = JWT.sign(
      { id: userId, type: "access" },
      env.JWT_SECRET,
      { expiresIn: "15m" } // 15 minutes
    );

    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(sessionsTable).values({
      userId,
      refreshTokenHash,
      expiresAt
    });

    return { accessToken, refreshToken };
  }

  public async verifyUserToken(token: string): Promise<AccessTokenPayload> {
    try {
      const verificationResult = JWT.verify(token, env.JWT_SECRET, {
        algorithms: ["HS256"],
      }) as AccessTokenPayload;

      if (verificationResult.type !== "access") {
        throw new Error("Invalid token type");
      }

      return verificationResult;
    } catch (error) {
      throw ApiError.unauthorized("Invalid token", "INVALID_TOKEN");
    }
  }

  public async refreshUserSession(payload: { refreshToken: string }) {
    const refreshTokenHash = crypto.createHash('sha256').update(payload.refreshToken).digest('hex');

    const session = await db.select()
      .from(sessionsTable)
      .where(and(
        eq(sessionsTable.refreshTokenHash, refreshTokenHash),
        isNull(sessionsTable.revokedAt),
        gt(sessionsTable.expiresAt, new Date())
      ))
      .then(res => res[0]);

    if (!session) {
      throw ApiError.unauthorized("Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }

    // Revoke old session
    await db.update(sessionsTable)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(sessionsTable.id, session.id));

    // Delete expired or revoked sessions for this user to keep table size clean
    await db.delete(sessionsTable)
      .where(and(
        eq(sessionsTable.userId, session.userId),
        or(
          isNotNull(sessionsTable.revokedAt),
          lt(sessionsTable.expiresAt, new Date())
        )
      ));

    return this.generateUserTokens(session.userId);
  }

  public async invalidateUserSessions(userId: string) {
    // Increment the user's tokenVersion to instantly invalidate all access tokens
    await db.update(usersTable)
      .set({ tokenVersion: sql`${usersTable.tokenVersion} + 1` })
      .where(eq(usersTable.id, userId));
      
    // Revoke all sessions
    await db.update(sessionsTable)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(sessionsTable.userId, userId));
  }

  public async invalidateSessionByRefreshToken(refreshToken: string) {
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const session = await db.select({ userId: sessionsTable.userId })
      .from(sessionsTable)
      .where(and(
        eq(sessionsTable.refreshTokenHash, refreshTokenHash),
        isNull(sessionsTable.revokedAt)
      ))
      .then(res => res[0]);

    if (!session) {
      throw ApiError.unauthorized("Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }

    await this.invalidateUserSessions(session.userId);
  }

  public async getUserInfoById(id: string){
    const user = await db.select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      email: usersTable.email,
      profileImageUrl: usersTable.profileImageUrl,
    }).from(usersTable).where(eq(usersTable.id, id))

    if(!user || user.length === 0) throw ApiError.notFound(`User with id ${id} does not exist`, "USER_NOT_FOUND");
    return user[0]!;
  }


  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType){
    const { fullName, email, password } = await createUserWithEmailAndPasswordInput.parseAsync(payload)

    const existingUserWithEmail = await this.getUserByEmail(email);
    if (existingUserWithEmail) {
      throw ApiError.conflict("An account with this email address already exists", "EMAIL_ALREADY_EXISTS");
    }

    const hash = await bcrypt.hash(password, 12);

    const userInsertResult = await db.insert(usersTable).values({ email, fullName, password: hash, salt: null }).returning({ 
      id: usersTable.id
    })

    if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id) {
      throw ApiError.internal("Failed to register account due to an internal system error", "REGISTRATION_FAILED");
    }

    const userId = userInsertResult[0].id
    const tokens = await this.generateUserTokens(userId)

    return {
      id: userId, 
      ...tokens
    }
  }

  public async signInUserWithEmailAndPassword(payload: signInUserWithEmailAndPasswordInputType){
    const { email, password } = await signInUserWithEmailAndPasswordInput.parseAsync(payload)

    const existingUser = await this.getUserByEmail(email);
    if (!existingUser || !existingUser.password) {
      throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if(!isMatch) {
      throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const tokens = await this.generateUserTokens(existingUser.id)

    return {
      id: existingUser.id, 
      ...tokens
    }
  }

  public async signInWithGoogle(code: string) {
    try {
      const { tokens } = await googleOAuth2Client.getToken(code);
      const ticket = await googleOAuth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: env.GOOGLE_OAUTH_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        throw ApiError.unauthorized("Invalid Google token payload", "INVALID_GOOGLE_TOKEN");
      }

      const { email, name, picture } = payload;
      let user = await this.getUserByEmail(email);

      if (!user) {
        const userInsertResult = await db.insert(usersTable).values({ 
          email, 
          fullName: name || email.split("@")[0] || "User", 
          profileImageUrl: picture || null,
          password: null,
          salt: null,
        }).returning({ id: usersTable.id });

        if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id) {
          throw ApiError.internal("Failed to register account via Google", "REGISTRATION_FAILED");
        }
        user = userInsertResult[0] as any;
      } else {
        // User exists, update profile picture if missing
        if (picture && !user.profileImageUrl) {
          await db.update(usersTable).set({ profileImageUrl: picture }).where(eq(usersTable.id, user.id));
        }
      }

      if (!user) throw ApiError.internal("User not found or created", "GOOGLE_AUTH_FAILED");
      const userId = user.id;
      const userTokens = await this.generateUserTokens(userId);

      return {
        id: userId,
        ...userTokens
      };
    } catch (error) {
      console.error("Google signIn Error:", error);
      throw ApiError.unauthorized("Failed to authenticate with Google", "GOOGLE_AUTH_FAILED");
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
