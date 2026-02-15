import bcrypt from 'bcryptjs';
import { prisma } from '../libs/prisma';

type CreatedUserProps = {
    name: string;
    email: string;
    password: string;
}

export const createdUser = async ({ name, email, password }: CreatedUserProps) => {
    email = email.toLowerCase();

    const user = await prisma.user.findFirst({
        where: { email }
    });

    if (user) return false;

    const newPassword = bcrypt.hashSync(password, 10);

    return await prisma.user.create({
        data: { name, email, password: newPassword }
    });
};

type VeryfyUserProps = {
    email: string;
    password: string;
}

export const veryfyUser = async ({ email, password }: VeryfyUserProps) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) return false;
    if (!bcrypt.compareSync(password, user.password)) return false;

    return user;
}

export const getUserById = async (id: number) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            status: true
        }
    });
}