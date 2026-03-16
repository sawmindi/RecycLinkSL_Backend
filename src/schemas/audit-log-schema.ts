import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { IAuditLog } from "../models/audit-log-model";

const schemaOptions: mongoose.SchemaOptions = {
  _id: true,
  id: false,
  timestamps: true,
  skipVersioning: { key: true },
  strict: false,
};

export const auditLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    action: {
      type: Schema.Types.String,
      required: true,
    },
    entity_type: {
      type: Schema.Types.String,
      required: false,
    },
    entity_id: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    timestamp: {
      type: Schema.Types.Date,
      required: false,
    },
  },
  schemaOptions
);

const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
export default AuditLog;

