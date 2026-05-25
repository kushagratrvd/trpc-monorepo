import type { CookieOptions, Response, Request } from "express"
import { TRPCContext } from "../context";

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_MONTH = 30 * ONE_DAY;
const ONE_YEAR = 12 * ONE_MONTH;

const defaultCookieOption: CookieOptions = {
    path: "/",
    httpOnly: true, 
    secure: false, 
    sameSite: "strict",
    maxAge: ONE_YEAR,
}

export function createCookieFactory(res: Response){
    return function createCookie(
        name: string,
        value: string,
        opts: CookieOptions = defaultCookieOption
    ) {
        res.cookie(name, value, opts)
    }
}

export function getCookieFactory(req: Request){
    return function getCookie(name: string) {
        return req.cookies?.[name];
    }
}

export function clearCookieFactory(res: Response){
    return function clearCookie(name: string) {
        res.clearCookie(name);
    }
}


// Authentication Cookie

const AUTHENTICATION_COOKIE_NAME = 'access-token'
const REFRESH_TOKEN_COOKIE_NAME = 'refresh-token'

export function setAuthenticationCookies(ctx: TRPCContext, accessToken: string, refreshToken: string){
    const secure = process.env.NODE_ENV === "production";
    
    ctx.createCookie(AUTHENTICATION_COOKIE_NAME, accessToken, {
        path: "/",
        httpOnly: true,
        secure,
        sameSite: "lax",
        maxAge: 15 * ONE_MINUTE,
    });

    ctx.createCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        path: "/",
        httpOnly: true,
        secure,
        sameSite: "lax",
        maxAge: 7 * ONE_DAY,
    });
}

export function getAuthenticationCookie(ctx: TRPCContext){
    return ctx.getCookie(AUTHENTICATION_COOKIE_NAME);
}

export function getRefreshTokenCookie(ctx: TRPCContext){
    return ctx.getCookie(REFRESH_TOKEN_COOKIE_NAME);
}

export function clearAuthenticationCookies(ctx: TRPCContext){
    ctx.clearCookie(AUTHENTICATION_COOKIE_NAME);
    ctx.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
}