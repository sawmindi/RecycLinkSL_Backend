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
      required: true,
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
      required: true,
    },
    area: {
      type: Schema.Types.String,
      required: true,
    },
  },
  schemaOptions
);

const Schedule = mongoose.model<ISchedule>("Schedule", scheduleSchema);
export default Schedule;

