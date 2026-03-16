import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { INotification } from "../models/notification-model";

const schemaOptions: mongoose.SchemaOptions = {
  _id: true,
  id: false,
  timestamps: true,
  skipVersioning: { key: true },
  strict: false,
};

export const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: Schema.Types.String,
      required: true,
    },
    channel: {
      type: Schema.Types.String,
      required: false,
    },
    action: {
      type: Schema.Types.String,
      required: false,
    },
    status: {
      type: Schema.Types.String,
      required: false,
    },
    sent_at: {
      type: Schema.Types.Date,
      required: false,
    },
  },
  schemaOptions
);

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
export default Notification;

