import {Injectable} from '@nestjs/common';
import {User} from './user.model';
import {InjectModel} from '@nestjs/sequelize';
import {CreateUserDto} from './dto/create.user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User
    ) {
    }


    findOne(filter: {
        where: { id?: string, username?: string; email?: string }
    }): Promise<User> {
        return this.userModel.findOne({...filter})
    }

    async create(createUserDto: CreateUserDto): Promise<User | { warningMessage: string }> {
        const user = new User()
        const existingByUserName = await this.findOne({where: {username: createUserDto.username}})
        const existingByEmail = await this.findOne({where: {email: createUserDto.email}})

        if (existingByUserName) {
            return {warningMessage: 'Пользователь с таким именем существует'}
        }
        if (existingByEmail) {
            return {warningMessage: 'Пользователь с таким email существует'}
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

        user.username = createUserDto.username
        user.email = createUserDto.email
        user.password = hashedPassword

        return user.save()

    }
}
