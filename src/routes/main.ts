import { Router } from 'express';
import * as mainController from '../controllers/main';

export const mainRoutes = Router();

mainRoutes.get('/ping', (request, response) => {
    response.json({ pong: true });
})

mainRoutes.get('/posts', mainController.getAllPosts); // ainda não implementado
mainRoutes.get('/posts/:slug', mainController.getPost); // ainda não implementado
mainRoutes.get('/posts/:slug/related', mainController.getRelatedPosts); // ainda não implementado