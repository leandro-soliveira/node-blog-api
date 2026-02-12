import { Router } from 'express';
import * as adminController from '../controllers/admin';

export const adminRoutes = Router();

adminRoutes.post('/posts', adminController.addPost); // ainda não implementado
adminRoutes.get('/posts', adminController.getPosts); // ainda não implementado
adminRoutes.get('/posts/:slug', adminController.getPost); // ainda não implementado
adminRoutes.put('/posts/:slug', adminController.editPost); // ainda não implementado
adminRoutes.delete('/posts/:slug', adminController.removePost); // ainda não implementado