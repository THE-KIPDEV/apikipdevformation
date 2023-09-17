import { hash } from 'bcrypt';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { Users } from '@models/users.model';
import { isEmpty } from '@utils/util';
const converter = require('json-2-csv');
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import MailService from '@services/mail.service';
import { generatePassword } from '@utils/generatePassword';
class UserService {
  public MailService = new MailService();

  public async formatUser(userData) {
    delete userData.password;
    const userDataFormatted = {
      ...userData,
    };
    // for each bar, get the unread message

    return userDataFormatted;
  }

  public async findAllUser(page, perPage, search, orderBy): Promise<User[]> {
    let offset = 0;
    let limit = 20;
    let orderByColumn = 'id';
    let orderBySort = 'desc';
    if (page) {
      offset = (page - 1) * perPage;
    }

    if (perPage) {
      limit = perPage;
    }

    if (!search) {
      search = '';
    }

    if (orderBy && orderBy == 'alphabetic') {
      orderByColumn = 'lastname';
      orderBySort = 'asc';
    }

    if (orderBy && orderBy == 'date') {
      orderByColumn = 'created_at';
      orderBySort = 'desc';
    }

    const users: User[] = await Users.query()
      .select()
      .from('users')
      .limit(limit)
      .offset(offset)
      .where('firstname', 'like', `%${search}%`)
      .orWhere('lastname', 'like', `%${search}%`)
      .orWhere('email', 'like', `%${search}%`)
      .orderBy(orderByColumn, orderBySort);
    return await Promise.all(users.map(async user => this.formatUser(user)));
  }

  public async findAllUserCsv(): Promise<any> {
    const users: User[] = await Users.query().select().from('users');
    const usersMap = await Promise.all(users.map(async user => this.formatUser(user)));
    const uuid = uuidv4();
    const path = `src/public/export/${uuid}.csv`;
    const url = `/export/${uuid}.csv`;
    converter.json2csv(usersMap, (err, csv) => {
      if (err) {
        throw err;
      }

      fs.writeFileSync(path, csv);
    });
    return url;
  }

  public async findUserByIdOrEmail(userId: number, userEmail: string): Promise<User> {
    const findUser: User = await Users.query().select().from('users').where('id', '=', userId).orWhere('email', '=', userEmail).first();
    if (!findUser) throw new HttpException(409, 'USER_NOT_FOUND');

    return this.formatUser(findUser);
  }

  public async findUserById(userId: number): Promise<User> {
    const findUser: User = await Users.query().findById(userId);
    if (!findUser) throw new HttpException(409, 'USER_NOT_FOUND');

    return this.formatUser(findUser);
  }

  public async findUserByEmail(email: string): Promise<User> {
    const findUser: User = await Users.query().select().from('users').where('email', '=', email).first();

    if (!findUser) throw new HttpException(409, 'USER_NOT_FOUND');

    return this.formatUser(findUser);
  }

  public async getUserMe(user: any): Promise<User> {
    // Get unread Messages

    return this.formatUser(user);
  }

  public async createUser(userData: CreateUserDto, userLogged: any): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'EMPTY_DATA');

    const findUser: User = await Users.query().select().from('users').where('email', '=', userData.email).first();
    if (findUser) throw new HttpException(409, 'EMAIL_ALREADY_EXISTS');
    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await Users.query()
      .insert({ ...userData, password: hashedPassword, created_at: new Date(), created_by: userLogged.id })
      .into('users');

    return this.formatUser(createUserData);
  }

  public async updateUser(userId: number, userData: User, userLogged: any): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'EMPTY_DATA');

    const findUser: User[] = await Users.query().select().from('users').where('id', '=', userId);
    if (!findUser) throw new HttpException(409, 'USER_NOT_FOUND');
    if (userData.password) {
      const hashedPassword = await hash(userData.password, 10);

      await Users.query()
        .update({ ...userData, password: hashedPassword, updated_at: new Date(), updated_by: userLogged.id })
        .where('id', '=', userId)
        .into('users');
    } else {
      await Users.query()
        .update({ ...userData, updated_at: new Date(), updated_by: userLogged.id })
        .where('id', '=', userId)
        .into('users');
    }

    const updateUserData: User = await Users.query().select().from('users').where('id', '=', userId).first();
    return this.formatUser(updateUserData);
  }

  public async deleteUser(userId: number): Promise<User> {
    const findUser: User = await Users.query().select().from('users').where('id', '=', userId).first();
    if (!findUser) throw new HttpException(409, 'USER_NOT_FOUND');

    await Users.query().delete().where('id', '=', userId).into('users');
    return this.formatUser(findUser);
  }
}

export default UserService;
