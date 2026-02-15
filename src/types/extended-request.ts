import { Request } from "express";
import { User } from "../libs/generated/prisma/client";

type UserWithoutPassword = Omit<User, "password">
export type ExtenedRequest = Request & {
    user?: UserWithoutPassword;
}