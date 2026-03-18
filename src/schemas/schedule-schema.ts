import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { ISchedule } from "../models/schedule-model";

const schemaOptions: mongoose.SchemaOptions = {
  _id: true,
  id: false,
  timestamps: true,
  skipVersioning: { key: true },
  strict: false,
};

export const scheduleSchema = new mongoose.Schema(
  {
    collector_id: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    date: {
      type: Schema.Types.Date,
      required: true,
    },
    time: {
      type: Schema.Types.String,
      required: true,
    },
    capacity_kg: {
      type: Schema.Types.Number,
      required: false,
      default: 0,
    },
    area: {
      type: Schema.Types.String,
      required: true,
    },
    items: {
      type: Schema.Types.String,
      required: false,
    },
    status: {
      type: Schema.Types.String,
      required: false,
      default: "pending",
    },
  },
  schemaOptions
);

const Schedule = mongoose.model<ISchedule>("Schedule", scheduleSchema);
export default Schedule;

