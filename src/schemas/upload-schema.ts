import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { IUpload } from "../models/upload-model";

const schemaOptions: mongoose.SchemaOptions = {
  _id: true,
  id: false,
  timestamps: true,
  skipVersioning: {key: true},
  strict: false,
  toJSON: {
    getters: true,
    virtuals: true,
    transform: (doc: any, ret: any) => {
      delete ret.path;
      delete ret.isUrl;
      delete ret.user;
    },
  },
};

const uploadSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      require: false,
    },
    type: {
      type: Schema.Types.String,
      require: true,
    },
    path: {
      type: Schema.Types.String,
      require: true,
    },
    name: {
      type: Schema.Types.String,
      require: false,
    },
    originalName: {
      type: Schema.Types.String,
      require: false,
    },
    extension: {
      type: Schema.Types.String,
      require: false,
    },
    isUrl: {
      type: Schema.Types.Boolean,
      require: false,
      default: false,
    },
    fileSize: {
      type: Schema.Types.Number,
      require: false,
    },
    category: {
      type: Schema.Types.String,
      require: false,
    },
    title: {
      type: Schema.Types.String,
      require: false,
    },
    signRequired: {
      type: Schema.Types.Boolean,
      require: false,
      default: false,
    },
  },
  schemaOptions
);

uploadSchema.virtual("url").get(function () {
  return this.isUrl
  ? this.path
  : 
  process.env.API +
      process.env.FILE_ACCESS_URL +
      "/" +
      this._id +
      "/" +
      this.originalName;
});

uploadSchema.set("toObject", { virtuals: true });
uploadSchema.set("toJSON", { virtuals: true });

const Upload = mongoose.model<IUpload>("Upload", uploadSchema);
export default Upload;
