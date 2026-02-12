import { RequestHandler } from "express";
import z from "zod";
import { createdUser } from "../services/user";
import { createToken } from "../services/auth";

export const signup: RequestHandler = async (request, response) => {
    const schema = z.object({
        name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres"),
        email: z.email("Email inválido").trim().toLowerCase(),
        password: z.string()
            .min(6, "Senha deve ter no minimo 6 caracteres")
            .regex(/[A-Z]/, "Senha deve ter pelo menos uma letra maiúscula")
            .regex(/[0-9]/, "Senha deve ter pelo menos um número")
    });

    const data = schema.safeParse(request.body);

    if (!data.success) {
        const errors = data.error.issues.map(issue => ({
            field: issue.path[0],
            message: issue.message
        }))
        return response.status(400).json({ errors });

    }

    const newUser = await createdUser(data.data)
    if (!newUser) {
        response.json({ error: 'Erro ao criar usuário' });
        return;
    }

    const token = createToken(newUser);

    response.status(201).json({
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        },
        token
    })
};

export const signin: RequestHandler = async (request, response) => {
    return response.status(501).json({ message: "Not implemented yet" });
};

export const validete: RequestHandler = async (request, response) => {
    return response.status(501).json({ message: "Not implemented yet" });
};