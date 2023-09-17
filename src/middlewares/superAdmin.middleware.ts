import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { Users } from '@models/users.model';

const superAdminMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (Authorization) {
      const secretKey: string = SECRET_KEY;

      const verificationResponse = (await verify(Authorization, secretKey)) as DataStoredInToken;

      const userId = verificationResponse.id;
      const findUser: User = await Users.query().findById(userId);

      if (findUser) {
        req.user = findUser;

        if (findUser.role_name != 'SUPER_ADMIN') {
          throw new HttpException(401, 'ONLY_SUPER_ADMIN');
        }

        next();
      } else {
        next(new HttpException(401, 'TOKEN_FALSE'));
      }
    } else {
      next(new HttpException(404, 'NO_TOKEN'));
    }
  } catch (error) {
    next(new HttpException(401, 'AUTHENTIFICATION_FAILED'));
  }
};

export default superAdminMiddleware;
