import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import userService from '@services/users.service';

class UsersController {
  public userService = new userService();

  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        query: { page, limit, search, orderBy },
      } = req;

      const findAllUsersData: User[] = await this.userService.findAllUser(page, limit, search, orderBy);

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUserMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = await this.userService.getUserMe(req.user);
      res.setHeader('Cache-Control', "no-store");
      res.status(200).json({ data: userData, message: 'User me' });
    } catch (error) {
      next(error);
    }
  };

  public getUsersCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllUsersData = await this.userService.findAllUserCsv();

      res.status(200).json({ data: findAllUsersData, message: 'exportCsv' });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.params.id);
      const findOneUserData: User = await this.userService.findUserById(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public launchMailsLancement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllUsersData = await this.userService.launchMailsLancement();

      res.status(200).json({ data: findAllUsersData, message: 'mailLancement' });
    } catch (error) {
      next(error);
    }
  };

  public getUserByEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const email = String(req.params.email);
      const findOneUserData: User = await this.userService.findUserByEmail(email);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const createUserData: User = await this.userService.createUser(userData, req.user);

      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.params.id);
      const userData: User = req.body;
      const updateUserData: User = await this.userService.updateUser(userId, userData, req.user);

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.params.id);
      const deleteUserData: User = await this.userService.deleteUser(userId);

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
