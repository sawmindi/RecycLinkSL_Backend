import * as mongoose from "mongoose";
import { Types } from "mongoose";

export interface DCollectorAssignment {
  _id?: Types.ObjectId;
  collector_id: Types.ObjectId;
  category_id: Types.ObjectId;
  area: string;
  assigned_date?: Date;
  status?: string;
}

export type ICollectorAssignment = DCollectorAssignment & mongoose.Document;

