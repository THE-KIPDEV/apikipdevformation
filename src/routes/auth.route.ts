import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';
import validationMiddleware from '@middlewares/validation.middleware';

class AuthRoute implements Routes {
  public path = '/';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}signup`, validationMiddleware(CreateUserDto, 'body'), this.authController.signUp);
    this.router.put(`${this.path}edit-profil`, authMiddleware, validationMiddleware(CreateUserDto, 'body', true), this.authController.editProfil);
    this.router.post(`${this.path}login`, this.authController.logIn);
    this.router.post(`${this.path}forget-password`, this.authController.forgetPassword);
    this.router.post(`${this.path}create-new-password`, this.authController.createNewPassword);
    this.router.post(`${this.path}logout`, authMiddleware, this.authController.logOut);
    this.router.post(`${this.path}resend-email-validation`, this.authController.resendEmailValidation);
    this.router.post(`${this.path}validate-account`, this.authController.validateAccount);
    this.router.delete(
      `${this.path}delete-account`,
      authMiddleware,
      validationMiddleware(CreateUserDto, 'body', true),
      authMiddleware,
      this.authController.deleteAccount,
    );
  }
}

export default AuthRoute;
