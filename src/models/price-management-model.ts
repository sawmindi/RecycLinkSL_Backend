import * as mongoose from "mongoose";
import { Types } from "mongoose";

export interface DPriceManagement {
  _id?: Types.ObjectId;
  category_id: Types.ObjectId;
  name: string;
  current_price: number;
  previous_price?: number;
  last_updated?: Date;
  status?: string;
}

export type IPriceManagement = DPriceManagement & mongoose.Document;

