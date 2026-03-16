import * as mongoose from "mongoose";
import { UserRole } from "../models/user-model";
import User, { UserSchemaOptions } from "./user-schema";
import { IAdmin } from "../models/admin-model";

export const Admin = User.discriminator<IAdmin>("Admin", new mongoose.Schema({}, UserSchemaOptions), UserRole.ADMIN);

export default Admin;
