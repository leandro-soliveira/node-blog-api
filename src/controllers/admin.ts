import { RequestHandler, Response } from "express";
import { ExtenedRequest } from "../types/extended-request";
import z from "zod";
import { createPost, createPostSlug, handleCover } from "../services/post";
import { getUserById } from "../services/user";
import { coverToUrl } from "../utils/cover-to-url";

export const addPost = async (request: ExtenedRequest, response: Response) => {
    if (!request.user) return;

    const schema = z.object({
        title: z
            .string()
            .trim()
            .min(5, "Título deve ter pelo menos 5 caracteres")
            .max(120, "Título muito longo"),
        tags: z.string().trim(),
        body: z.string().trim().min(10, "O conteúdo deve ter pelo menos 10 caraceteres")
    });

    const data = schema.safeParse(request.body);
    if (!data.success) {
        const errors = data.error.issues.map(issue => ({
            field: issue.path[0],
            message: issue.message
        }));
        return response.status(400).json({ errors });
    }

    if (!request.file) {
        response.status(400).json({ error: 'Imagem é obrigatória' });
        return;
    }

    // --Lidar com o arquivo
    const coverName = await handleCover(request.file);
    if (!coverName) {
        response.status(400).json({ error: 'Imagem não permitida/enviada' });
        return;
    }
    // --Criar o slug do post
    const slug = await createPostSlug(data.data.title);

    // --Criar o post
    const newPost = await createPost({
        authorId: request.user.id,
        slug,
        title: data.data.title,
        tags: data.data.tags,
        body: data.data.body,
        cover: coverName
    })

    // --Pegar informações do autor
    const author = await getUserById(newPost.authorId);

    // --Faser retorno segundo o plano
    response.status(201).json({
        post: {
            id: newPost.id,
            slud: newPost.slug,
            title: newPost.title,
            createdAt: newPost.createdAt,
            cover: coverToUrl(newPost.cover),
            tags: newPost.tags,
            authorName: author?.name
        }
    })
};

export const getPosts: RequestHandler = async (request, response) => {
    return response.status(501).json({ message: "Not implemented yet" });
};

export const getPost: RequestHandler = async (request, response) => {
    return response.status(501).json({ message: "Not implemented yet" });
};

export const editPost: RequestHandler = async (request, response) => {
    return response.status(501).json({ message: "Not implemented yet" });
};

export const removePost: RequestHandler = async (request, response) => {
    return response.status(501).json({ message: "Not implemented yet" });
};