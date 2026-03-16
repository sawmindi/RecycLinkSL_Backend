import * as mongoose from "mongoose";
import { Types } from "mongoose";

export interface DAuditLog {
  _id?: Types.ObjectId;
  user_id?: Types.ObjectId;
  action: string;
  entity_type?: string;
  entity_id?: Types.ObjectId;
  timestamp?: Date;
}

export type IAuditLog = DAuditLog & mongoose.Document;

