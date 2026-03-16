import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { ICollection } from "../models/collection-model";

const schemaOptions: mongoose.SchemaOptions = {
  _id: true,
  id: false,
  timestamps: true,
  skipVersioning: { key: true },
  strict: false,
};

export const collectionSchema = new mongoose.Schema(
  {
    request_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    actual_weight: {
      type: Schema.Types.Number,
      required: false,
    },
    final_price: {
      type: Schema.Types.Number,
      required: false,
    },
    collected_at: {
      type: Schema.Types.Date,
      required: false,
    },
  },
  schemaOptions
);

const Collection = mongoose.model<ICollection>("Collection", collectionSchema);
export default Collection;

