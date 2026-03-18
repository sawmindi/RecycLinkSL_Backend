import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { IPriceManagement } from "../models/price-management-model";

const schemaOptions: mongoose.SchemaOptions = {
  _id: true,
  id: false,
  timestamps: true,
  skipVersioning: { key: true },
  strict: false,
};

export const priceManagementSchema = new mongoose.Schema(
  {
    category_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    name: {
      type: Schema.Types.String,
      required: true,
    },
    current_price: {
      type: Schema.Types.Number,
      required: true,
    },
    previous_price: {
      type: Schema.Types.Number,
      required: false,
    },
    last_updated: {
      type: Schema.Types.Date,
      required: false,
    },
    status: {
      type: Schema.Types.String,
      required: false,
    },
  },
  schemaOptions
);

const PriceManagement = mongoose.model<IPriceManagement>(
  "PriceManagement",
  priceManagementSchema
);
export default PriceManagement;

