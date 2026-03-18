import * as mongoose from "mongoose";
import { Types } from "mongoose";

export interface DSchedule {
  _id?: Types.ObjectId;
  collector_id?: Types.ObjectId;
  date: Date;
  time: string;
  capacity_kg?: number;
  area: string;
  items?: string;
  status?: string;
}

export type ISchedule = DSchedule & mongoose.Document;

