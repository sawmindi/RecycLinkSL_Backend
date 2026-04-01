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
            .select({ password_hash: 0 });
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
        address: string,
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
                address: address,
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
        address: string,
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
            address,
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
        let user = await User.findByIdAndUpdate(id, { $set: data }, { new: true }).select({ password_hash: 0 });
        return user;
    }

    /** List all users for admin panel (exclude password). */
    export async function getUsersForAdmin(): Promise<any[]> {
        const list = await User.find({}).select("-password_hash").sort({ createdAt: -1 }).lean();
        return (list as any[]).map((u) => ({
            id: u._id?.toString(),
            full_name: u.full_name,
            email: u.email ?? null,
            mobile_number: u.mobile_number || "",
            area: u.area || "",
            role: u.role || "",
            is_active: u.is_active !== false,
            joined_date: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        }));
    }

    export async function deleteUser(id: Types.ObjectId | string): Promise<void> {
        if (!Util.isObjectId(String(id))) throw new ApplicationError("Invalid user id");
        const result = await User.findByIdAndDelete(id);
        if (!result) throw new ApplicationError("User not found");
    }

}
