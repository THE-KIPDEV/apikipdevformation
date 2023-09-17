import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import AuthService from '@services/auth.service';

class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const signUpUserData: User = await this.authService.signup(userData);

      res.status(201).json({ data: signUpUserData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public editProfil = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const signUpUserData: User = await this.authService.editProfil(userData, req.user);

      res.status(201).json({ data: signUpUserData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;

      const deleteAccountData: User = await this.authService.deleteAccount(userData, req.user);

      res.status(201).json({ data: deleteAccountData, message: 'delete' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const { cookie, findUser, tokenData } = await this.authService.login(userData);
      delete findUser.password;

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: { user: findUser, token: tokenData }, message: 'Successfully login' });
    } catch (error) {
      next(error);
    }
  };

  public validateAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = req.body;
      const response = await this.authService.validateAccount(userData);

      res.status(200).json({ message: 'ACCOUNT_VALIDATED' });
    } catch (error) {
      next(error);
    }
  };

  public resendEmailValidation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = req.body;
      const { token } = await this.authService.resendEmailValidation(userData);

      res.status(200).json({ message: 'EMAIL_SENT' });
    } catch (error) {
      next(error);
    }
  };

  public forgetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        query: { from },
      } = req;
      const userData: CreateUserDto = req.body;
      const { token } = await this.authService.forgetPassword(userData, from);

      res.status(200).json({ message: 'EMAIL_SENT' });
    } catch (error) {
      next(error);
    }
  };

  public createNewPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const { token } = await this.authService.createNewPassword(userData);

      res.status(200).json({ message: 'PASSWORD_CHANGED' });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.user;
      const logOutUserData: User = await this.authService.logout(userData);
      delete logOutUserData.password;

      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      res.status(200).json({ data: logOutUserData, message: 'Successfully logout' });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
