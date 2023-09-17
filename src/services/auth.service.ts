import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { Users } from '@models/users.model';
import { isEmpty } from '@utils/util';
import { v4 as uuidv4 } from 'uuid';
import MailService from '@services/mail.service';

class AuthService {
  public MailService = new MailService();

  public async editProfil(userData: User, userLogged: any): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'EMPTY_DATA');

    const findUser: User = await Users.query().select().from('users').where('id', '=', userLogged.id).first();
    if (!findUser) throw new HttpException(409, 'USER_NOT_FOUND');

    if (userData.password) {
      if (userData.password !== userData.password_confirm) throw new HttpException(409, 'PASSWORD_NOT_MATCH');

      const isPasswordMatching: boolean = await compare(userData.old_password, findUser.password);

      if (!isPasswordMatching) {
        throw new HttpException(409, 'WRONG_PASSWORD');
      }

      const hashedPassword = await hash(userData.password, 10);
      delete userData.old_password;
      delete userData.password_confirm;

      await Users.query()
        .update({ ...userData, password: hashedPassword, updated_at: new Date(), updated_by: userLogged.id })
        .where('id', '=', userLogged.id)
        .into('users');
    } else {
      delete userData.password;
      delete userData.password_confirm;
      delete userData.old_password;

      const findUserEmail: Users = await Users.query()
        .select()
        .from('users')
        .where('email', '=', userData.email)
        .where('id', '!=', userLogged.id)
        .first();
      if (findUserEmail) throw new HttpException(409, 'EMAIL_ALREADY_EXIST');

      await Users.query()
        .update({ ...userData, updated_at: new Date(), updated_by: userLogged.id })
        .where('id', '=', userLogged.id)
        .into('users');
    }

    const updateUserData: User = await Users.query().select().from('users').where('id', '=', userLogged.id).first();
    return updateUserData;
  }

  public async deleteAccount(userData: User, userLogged: User): Promise<User> {
    const findUser: User = await Users.query().select().from('users').where('id', '=', userLogged.id).first();
    if (!findUser) throw new HttpException(409, 'USER_NOT_FOUND');

    if (userData.old_password) {
      const isPasswordMatching: boolean = await compare(userData.old_password, findUser.password);

      if (!isPasswordMatching) {
        throw new HttpException(409, 'WRONG_PASSWORD');
      }

      await Users.query().delete().where('id', '=', userLogged.id).into('users');
      return userLogged;
    } else {
      throw new HttpException(409, 'NEED_CURRENT_PASSWORD');
    }
  }

  public async signup(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'EMPTY_DATA');

    if (userData.role_name && userData.role_name !== 'USER') {
      throw new HttpException(400, 'BAD_ROLE');
    }

    if (!userData.password && !userData.password_confirm) {
      throw new HttpException(400, 'EMPTY_PASSWORD');
    } else {
      if (userData.password !== userData.password_confirm) throw new HttpException(409, 'PASSWORD_NOT_MATCH');
    }
    const activateAccountToken = uuidv4();
    delete userData.password_confirm;

    const findUser: Users = await Users.query().select().from('users').where('email', '=', userData.email).first();
    if (findUser) throw new HttpException(409, 'EMAIL_ALREADY_EXIST');

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await Users.query()
      .insert({ ...userData, password: hashedPassword, created_at: new Date(), created_by: 0, active: 0, token: activateAccountToken })
      .into('users')
      .returning('id');

    const link = `${process.env.SITE_URL}/vadidate-account/${activateAccountToken}`;
    const variables = { link: link, firstname: userData.firstname };
    const mailData = {
      email: userData.email,
      subject: 'Bienvenue sur KIPDEV',
      variables,
      templateId: 4150854,
      firstname: userData.firstname,
      lastname: userData.lastname,
    };
    //await this.MailService.send(mailData);

    return createUserData;
  }

  public async resendEmailValidation(userData: CreateUserDto): Promise<any> {
    if (isEmpty(userData)) throw new HttpException(400, 'EMPTY_DATA');

    const findUser: User = await Users.query().select().from('users').where('email', '=', userData.email).first();
    if (!findUser) throw new HttpException(409, 'EMAIL_NOT_FOUND');

    const link = `${process.env.SITE_URL}/vadidate-account/${findUser.token}`;
    const variables = { link: link, firstname: findUser.firstname };
    const mailData = {
      email: findUser.email,
      subject: 'Confirme la création de ton compte KIPDEV',
      variables,
      templateId: 4150854,
      firstname: findUser.firstname,
      lastname: findUser.lastname,
    };
    //await this.MailService.send(mailData);

    return { token: findUser.token };
  }

  public async login(userData: CreateUserDto): Promise<{ cookie: string; findUser: User; tokenData: any }> {
    if (isEmpty(userData)) throw new HttpException(400, 'EMPTY_DATA');

    const findUser: User = await Users.query().select().from('users').where('email', '=', userData.email).first();
    if (!findUser) throw new HttpException(409, 'EMAIL_NOT_FOUND');

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, 'WRONG_PASSWORD');

    if (!findUser.active) {
      throw new HttpException(409, 'ACCOUNT_NOT_ACTIVE');
    }

    findUser.last_connect = new Date();

    await Users.query().update({ last_connect: new Date() }).where('id', '=', findUser.id).into('users');

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);

    return { cookie, findUser, tokenData };
  }

  public async validateAccount(userData: any): Promise<any> {
    if (isEmpty(userData)) throw new HttpException(400, 'EMPTY_DATA');

    const findUser: User = await Users.query().select().from('users').where('token', '=', userData.token).first();
    if (!findUser) throw new HttpException(409, 'TOKEN_WRONG');

    if (findUser.active) {
      throw new HttpException(409, 'ACCOUNT_ALREADY_ACTIVE');
    }

    await Users.query().update({ active: true }).where('token', '=', userData.token).into('users');

    const variables = {};
    const mailData = {
      email: findUser.email,
      subject: `${findUser.firstname}, bienvenue sur KIPDEV !`,
      variables,
      templateId: 4152583,
      firstname: findUser.firstname,
      lastname: findUser.lastname,
    };
    // await this.MailService.send(mailData);

    return true;
  }

  public async forgetPassword(userData: CreateUserDto, from: string): Promise<any> {
    if (isEmpty(userData)) throw new HttpException(400, 'EMPTY_DATA');

    const findUser: User = await Users.query().select().from('users').where('email', '=', userData.email).first();
    if (!findUser) throw new HttpException(409, 'EMAIL_NOT_FOUND');

    if (!findUser.active) {
      throw new HttpException(409, 'ACCOUNT_NOT_ACTIVE');
    }
    const uuid = uuidv4();
    let link;
    if (from == 'front') {
      link = `${process.env.SITE_URL}/reinitialiser-mot-de-passe/${uuid}`;
    } else {
      link = `${process.env.ADMIN_URL}/reset-password/${uuid}`;
    }

    await Users.query().update({ forget_password_token: uuid }).where('id', '=', findUser.id).into('users');
    const variables = { link: link, firstname: findUser.firstname };
    const mailData = {
      email: findUser.email,
      subject: 'Configure ton nouveau mot de passe KIPDEV',
      variables,
      templateId: 4147993,
      firstname: findUser.firstname,
      lastname: findUser.lastname,
    };
    //await this.MailService.send(mailData);

    return { token: uuid };
  }

  public async createNewPassword(userData: any): Promise<any> {
    if (isEmpty(userData.token) && isEmpty(userData.password) && isEmpty(userData.password_confirm)) throw new HttpException(400, 'EMPTY_DATA');

    const findUser: User = await Users.query().select().from('users').where('forget_password_token', '=', userData.token).first();
    if (!findUser) throw new HttpException(409, `TOKEN_NOT_FOUND`);

    if (!findUser.active) {
      throw new HttpException(409, 'ACCOUNT_NOT_ACTIVE');
    }

    if (userData.password !== userData.password_confirm) throw new HttpException(409, 'PASSWORD_NOT_MATCH');

    const hashedPassword = await hash(userData.password, 10);

    await Users.query().update({ password: hashedPassword }).where('id', '=', findUser.id).into('users');

    return { token: hashedPassword };
  }

  public async logout(userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'EMPTY_DATA');

    const findUser: User = await Users.query()
      .select()
      .from('users')
      .where('email', '=', userData.email)
      .andWhere('password', '=', userData.password)
      .first();

    if (!findUser) throw new HttpException(409, 'USER_NOT_FOUND');

    return findUser;
  }

  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user.id };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 86400 * 365;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
