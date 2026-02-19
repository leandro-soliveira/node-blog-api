import { RequestHandler } from "express";
import { getPostBySlug, getPublishedPosts } from "../services/post";
import { coverToUrl } from "../utils/cover-to-url";

export const getAllPosts: RequestHandler = async (request, response) => {
    let page = 1;
    if (request.query.page) {
        const parsedPage = parseInt(request.query.page as string);
        if (isNaN(parsedPage) || parsedPage <= 0) {
            return response.status(400).json({ error: "Página inexistente" });
        };
        page = parsedPage;
    };

    const posts = await getPublishedPosts(page);

    const postsToReturn = posts.map(post => ({
        id: post.id,
        title: post.title,
        createdAt: post.createdAt,
        cover: coverToUrl(post.cover),
        authorName: post.author?.name,
        tags: post.tags,
        slug: post.slug
    }));

    return response.status(200).json({ posts: postsToReturn, page });

};

export const getPost: RequestHandler = async (request, response) => {
    const { slug } = request.params;

    if (typeof slug !== "string") {
        return response.status(400).json({ error: "Slug inválido" });
    };

    const post = await getPostBySlug(slug);

    if (!post || (post && post.status !== "PUBLISHED")) {
        return response.status(404).json({ error: "Post não encontrado" });
    };

    return response.status(200).json({
        post: {
            id: post.id,
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

export const getRelatedPosts: RequestHandler = async (request, response) => {
    return response.status(501).json({ message: "Not implemented yet" });
};
