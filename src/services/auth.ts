import { Request } from "express";
import { User } from "../libs/generated/prisma/client";
import { createJWT, readJWT } from "../libs/jwt";
import { TokenPayload } from "../types/token-payload";
import { getUserById } from "./user";

export const createToken = (user: User) => {
    return createJWT({ id: user.id })
};

export const veryfyRequest = async (request: Request) => {
    const { authorization } = request.headers

    if (authorization) {
        const authSplit = authorization.split('Bearer ')
        if (authSplit[1]) {
            const payload = readJWT(authSplit[1]);
            if (payload) {
                const userId = (payload as TokenPayload).id;
                const user = await getUserById(userId)
                if (user) return user;
            }
        }
    };

    return false;
}