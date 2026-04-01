import { UserDao } from "../dao/user-dao";
import { DUser, UserRole } from "../models/user-model";

export default async function seedUsers() {

    const admin: DUser = {
        full_name: "Admin",
        username: "Admin",
        mobile_number: "0776694735",
        email: "admin@recyclinksl.com",
        area: "Balapitiya",
        role: UserRole.ADMIN,
        password_hash: "recyclinksl2026",
        is_active: true,
    };

    await signUpWithEmail(admin);

    return;
}

async function signUpWithEmail(user: DUser) {
    const existingType = await UserDao.getUserByEmail(user.email);

    if (existingType) {
        return existingType;
    }

    return await UserDao.signUpWithEmail(
        user.full_name,
        user.username,
        user.mobile_number,
        user.email,
        user.area,
        "",
        user.role,
        user.password_hash,
        user.is_active
    );
}