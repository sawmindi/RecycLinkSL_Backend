import * as mongoose from "mongoose";
import { Schema } from "mongoose";

export const FirebaseTokenSchema = new mongoose.Schema(
  {
    firebaseToken: {
      type: Schema.Types.String,
      required: false,
      default: null,
    },
    createdDate: {
      type: Schema.Types.Number,
      required: true,
      default: null,
    },
    lastUsed: {
      type: Schema.Types.Number,
      required: true,
      default: null,
    },
  },

  { _id: false }
);
