import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { ICollectorAssignment } from "../models/collector-assignment-model";

const schemaOptions: mongoose.SchemaOptions = {
  _id: true,
  id: false,
  timestamps: true,
  skipVersioning: { key: true },
  strict: false,
};

export const collectorAssignmentSchema = new mongoose.Schema(
  {
    collector_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    area: {
      type: Schema.Types.String,
      required: true,
    },
    assigned_date: {
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

const CollectorAssignment = mongoose.model<ICollectorAssignment>(
  "CollectorAssignment",
  collectorAssignmentSchema
);
export default CollectorAssignment;

