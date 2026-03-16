import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { IPickupRequest } from "../models/pickup-request-model";

const schemaOptions: mongoose.SchemaOptions = {
  _id: true,
  id: false,
  timestamps: true,
  skipVersioning: { key: true },
  strict: false,
};

export const pickupRequestSchema = new mongoose.Schema(
  {
    item_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    item_name: {
      type: Schema.Types.String,
      required: true,
    },
    rough_weight: {
      type: Schema.Types.Number,
      required: true,
    },
    priority: {
      type: Schema.Types.String,
      required: true,
    },
    estimated_earnings: {
      type: Schema.Types.Number,
      required: false,
    },
    status: {
      type: Schema.Types.String,
      required: false,
    },
    created_at: {
      type: Schema.Types.Date,
      required: false,
    },
  },
  schemaOptions
);

const PickupRequest = mongoose.model<IPickupRequest>(
  "PickupRequest",
  pickupRequestSchema
);
export default PickupRequest;

