import * as mongoose from "mongoose";
import { Types } from "mongoose";

export interface DCategory {
  _id?: Types.ObjectId;
  name: string;
  unit: string;
  description?: string;
  is_active?: boolean;
}

export type ICategory = DCategory & mongoose.Document;

