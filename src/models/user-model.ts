import * as mongoose from "mongoose";
import { Types } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  CITIZEN = "CITIZEN",
  COLLECTOR = "COLLECTOR"
}

export enum Permission { }
interface Common {
  full_name?: string;
  username?: string;
  mobile_number?: string;
  email?: string;
  area?: string;
  address?: string;
  role?: UserRole;
  password_hash?: string;
  is_active?: boolean;
}

export interface DUser extends Common {
  _id?: Types.ObjectId;
}

export interface IUser extends Common, mongoose.Document {
  readonly role?: UserRole;

  lastLogin?: Date;

  createAccessToken(): string;

  comparePassword(password: string): Promise<boolean>;

  compareVerificationCode(verificationCode: string): Promise<boolean>;
}
