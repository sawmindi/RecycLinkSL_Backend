import * as mongoose from "mongoose";
import { Types } from "mongoose";

export interface DNotification {
  _id?: Types.ObjectId;
  user_id: Types.ObjectId;
  message: string;
  channel?: string;
  action?: string;
  status?: string;
  sent_at?: Date;
}

export type INotification = DNotification & mongoose.Document;

