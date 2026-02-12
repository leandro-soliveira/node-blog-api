import { RequestHandler } from "express";

export const getAllPosts: RequestHandler = async (request, response) => {
    return response.status(501).json({ message: "Not implemented yet"});
};

export const getPost: RequestHandler = async (request, response) => {
    return response.status(501).json({ message: "Not implemented yet"});
};

export const getRelatedPosts: RequestHandler = async (request, response) => {
    return response.status(501).json({ message: "Not implemented yet"});
};
