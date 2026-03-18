import * as mongoose from "mongoose";
import { Types } from "mongoose";

export interface DPickupRequest {
  _id?: Types.ObjectId;
  schedule_id?: Types.ObjectId;
  user_id?: Types.ObjectId;
  item_id: Types.ObjectId;
  item_name: string;
  rough_weight: number;
  priority: string;
  estimated_earnings?: number;
  status?: string;
  assigned_collector_id?: Types.ObjectId;
  created_at?: Date;
}

export type IPickupRequest = DPickupRequest & mongoose.Document;

