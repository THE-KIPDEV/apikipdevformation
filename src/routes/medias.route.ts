import { Router } from 'express';
import MediasController from '@controllers/medias.controller';
import { CreateMediaDto } from '@dtos/medias.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@/middlewares/auth.middleware';

class MediasRoute implements Routes {
  public path = '/medias';
  public router = Router();
  public mediasController = new MediasController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.mediasController.getMedias);
    this.router.get(`${this.path}/:id(\\d+)`, this.mediasController.getMediaById);
    this.router.post(`${this.path}`, authMiddleware, validationMiddleware(CreateMediaDto, 'body'), this.mediasController.createMedia);
    this.router.put(`${this.path}/:id(\\d+)`, authMiddleware, validationMiddleware(CreateMediaDto, 'body', true), this.mediasController.updateMedia);
    this.router.delete(`${this.path}/:id(\\d+)`, authMiddleware, this.mediasController.deleteMedia);
  }
}

export default MediasRoute;
