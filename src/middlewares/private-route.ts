import { NextFunction, Request, Response } from "express";
import { veryfyRequest } from "../services/auth";
import { ExtenedRequest } from "../types/extended-request";

export const privateRoute = async (request: ExtenedRequest, response: Response, next: NextFunction) => {
    const user = await veryfyRequest(request);
    if (!user) {
        response.status(401).json({ error: 'Acesso negado' });
        return;
    };

    request.user = user;

    next();
};