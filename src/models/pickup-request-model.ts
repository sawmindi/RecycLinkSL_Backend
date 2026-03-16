import * as mongoose from "mongoose";
import { Types } from "mongoose";

export interface DPickupRequest {
  _id?: Types.ObjectId;
  item_id: Types.ObjectId;
  item_name: string;
  rough_weight: number;
  priority: string;
  estimated_earnings?: number;
  status?: string;
  created_at?: Date;
}

export type IPickupRequest = DPickupRequest & mongoose.Document;

