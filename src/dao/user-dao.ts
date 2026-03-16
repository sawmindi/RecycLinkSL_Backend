import { AppLogger } from "../common/logging";
import { DUser, IUser, UserRole } from "../models/user-model";
import User from "../schemas/user-schema";
import { StringOrObjectId, Util } from "../common/util";
import { ApplicationError } from "../common/application-error";
import { Types } from "mongoose";
export namespace UserDao {

    export async function getUserByEmail(email: string): Promise<IUser | null> {
        let user = await User.findOne({
            email: { $regex: `^${email}`, $options: "i" },
        });
        AppLogger.info(`Found user for email, userID: ${user?._id}`);
        return user;
    }

    export async function getUserById(id: StringOrObjectId): Promise<IUser> {
        let user: IUser = await User.findById(id)
            .select({ password: 0 });
        if (!user) {
            throw new ApplicationError("User not found for Id: " + id);
        }

        AppLogger.info(`Got user for id, userID: ${user._id}`);
        user.lastLogin = new Date();
        await user.save();
        return user;
    }


    export async function signUpWithEmail(
        full_name: string,
        username: string,
        mobile_number: string,
        email: string,
        area: string,
        role: UserRole,
        password_hash: string,
        is_active?: boolean,

    ): Promise<IUser> {
        try {
            let userDetails: DUser = null;

            userDetails = {
                full_name: full_name,
                username: username,
                email: email,
                mobile_number: mobile_number,
                area: area,
                password_hash: password_hash,
                role: role,
                is_active: is_active
            };

            console.log("userDetails",userDetails)
            const user = new User(userDetails);

            const newUser = await user.save();

            return newUser;
        } catch (error) {
            console.error("Error saving user:", error);
            throw error;
        }
    }


    export async function getUserByPhoneNumber(mobileNumber: string): Promise<IUser | null> {
        const user = await User.findOne({
            mobile_number: mobileNumber,
        });
        AppLogger.info(`Found user for mobile number, userID: ${user?._id}`);
        return user;
    }

    export async function signUpWithPhoneNumber(
        full_name: string,
        username: string,
        mobile_number: string,
        email: string,
        area: string,
        role: UserRole,
        password_hash: string,
        is_active: boolean = true,
    ): Promise<IUser> {
        const userDetails: DUser = {
            full_name,
            username,
            email,
            mobile_number,
            area,
            password_hash,
            role,
            is_active,
        };

        try {
            const user = new User(userDetails);
            const newUser = await user.save();
            return newUser;
        } catch (err) {
            AppLogger.error(`User registration failed: ${err}`);
            throw err;
        }
    }


    export async function updateUser(id: Types.ObjectId, data: Partial<DUser>): Promise<IUser> {
        let user = await User.findByIdAndUpdate(id, { $set: data }, { new: true }).select({ password: 0 });
        return user;
    }

}
