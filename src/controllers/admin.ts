import { RequestHandler, Response } from "express";
import { ExtenedRequest } from "../types/extended-request";
import z from "zod";
import { createPost, createPostSlug, deletePost, getAllPosts, getPostBySlug, handleCover, updatePost } from "../services/post";
import { getUserById } from "../services/user";
import { coverToUrl } from "../utils/cover-to-url";


export const getPosts = async (request: ExtenedRequest, response: Response) => {
    let page = 1;

    if (request.query.page) {
        const parsedPage = parseInt(request.query.page as string);

        if (isNaN(parsedPage) || parsedPage <= 0) {
            return response.status(400).json({ error: "Página inexistente" });
        };

        page = parsedPage;
    };

    let posts = await getAllPosts(page);

    const postsToReturn = posts.map(post => ({
        id: post.id,
        status: post.status,
        title: post.title,
        createdAt: post.createdAt,
        cover: coverToUrl(post.cover),
        authorName: post.author?.name,
        tags: post.tags,
        slug: post.slug
    }));

    response.status(200).json({ posts: postsToReturn, page });

};

export const getPost = async (request: ExtenedRequest, response: Response) => {
    const { slug } = request.params;

    if (typeof slug !== "string") {
        return response.status(400).json({ error: "Slug inválido" });
    };

    const post = await getPostBySlug(slug);

    if (!post) {
        return response.status(404).json({ error: "Post não encontrado" });
    };

    return response.status(200).json({
        post: {
            id: post.id,
            status: post.status,
            title: post.title,
            createdAt: post.createdAt,
            cover: coverToUrl(post.cover),
            authorName: post.author?.name,
            tags: post.tags,
            body: post.body,
            slug: post.slug
        }
    });

};

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

export const editPost = async (request: ExtenedRequest, response: Response) => {
    const { slug } = request.params;

    if (typeof slug !== "string") {
        return response.status(400).json({ error: "Slug inválido" });
    };

    const schema = z.object({
        status: z.enum(['PUBLISHED', 'DRAFT']).optional(),
        title: z
            .string()
            .trim()
            .min(5, "Título deve ter pelo menos 5 caracteres")
            .max(120, "Título muito longo")
            .optional(),
        tags: z.string().trim().optional(),
        body: z.string().trim().min(10, "O conteúdo deve ter pelo menos 10 caraceteres").optional()
    });

    const data = schema.safeParse(request.body);

    if (!data.success) {
        const erros = data.error.issues.map(issue => ({
            field: issue.path[0],
            message: issue.message
        }));
        return response.status(400).json({ erros });
    };

    const hasBodyData = Object.keys(data.data).length > 0;
    const hasFile = !!request.file;

    if (!hasBodyData && !hasFile) {
        return response.status(400).json({
            error: "Nenhum dado enviado para atualização"
        });
    };

    const post = await getPostBySlug(slug);

    if (!post) {
        return response.status(404).json({ error: 'Post não encontrado' })
    };

    let coverName: string | false = false;
    if (request.file) {
        coverName = await handleCover(request.file);
        if (!coverName) {
            return response.status(400).json({ error: 'Arquivo inválido' });
        }
    };

    const updatedPost = await updatePost(slug, {
        updatedAt: new Date(),
        status: data.data.status ?? undefined,
        title: data.data.title ?? undefined,
        tags: data.data.tags ?? undefined,
        body: data.data.body ?? undefined,
        cover: coverName ? coverName : undefined
    });

    const author = await getUserById(updatedPost.authorId);

    response.status(200).json({
        post: {
            id: updatedPost.id,
            status: updatedPost.status,
            title: updatedPost.title,
            createdAt: updatedPost.createdAt,
            cover: coverToUrl(updatedPost.cover),
            tags: updatedPost.tags,
            authorName: author?.name
        }
    });

};

export const removePost = async (request: ExtenedRequest, response: Response) => {
    const { slug } = request.params;

    if (typeof slug !== "string") {
        return response.status(400).json({ error: "Slug inválido" });
    };

    const post = await getPostBySlug(slug);
    if (!post) {
        return response.status(404).json({ error: "Post não encontrado" });
    };

    await deletePost(post.slug);

    return response.status(204).send();
};