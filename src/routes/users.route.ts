import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import superAdminMiddleware from '@/middlewares/superAdmin.middleware';
import authMiddleware from '@/middlewares/auth.middleware';

class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, superAdminMiddleware, this.usersController.getUsers);
    this.router.get(`${this.path}/:id(\\d+)`, superAdminMiddleware, this.usersController.getUserById);
    this.router.post(`${this.path}`, validationMiddleware(CreateUserDto, 'body'), superAdminMiddleware, this.usersController.createUser);
    this.router.put(
      `${this.path}/:id(\\d+)`,
      validationMiddleware(CreateUserDto, 'body', true),
      superAdminMiddleware,
      this.usersController.updateUser,
    );
    this.router.delete(`${this.path}/:id(\\d+)`, superAdminMiddleware, this.usersController.deleteUser); // TODO
    this.router.get(`${this.path}/csv`, superAdminMiddleware, this.usersController.getUsersCsv);
    this.router.get(`${this.path}/me`, authMiddleware, this.usersController.getUserMe);
    this.router.get(`${this.path}/search/:email`, authMiddleware, this.usersController.getUserByEmail);
  }
}

export default UsersRoute;
