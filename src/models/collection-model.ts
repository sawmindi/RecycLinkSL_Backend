import * as mongoose from "mongoose";
import { Types } from "mongoose";

export interface DCollection {
  _id?: Types.ObjectId;
  request_id: Types.ObjectId;
  actual_weight?: number;
  final_price?: number;
  collected_at?: Date;
}

export type ICollection = DCollection & mongoose.Document;

