import * as mongoose from "mongoose";
import { Types } from "mongoose";

export interface DUpload {
  userId?: Types.ObjectId;
  shopId?:Types.ObjectId;
  inventoryId?:Types.ObjectId;
  type: string;
  path: string;
  originalName?: string;
  name?: string;
  extension?: string;
  isUrl?: boolean;
  fileSize?: number;
  category?: string;
  title?: string;
  signRequired?: boolean;
  url?: string;
  templateCategoryId?: Types.ObjectId;
}

export type IUpload = DUpload & mongoose.Document;
