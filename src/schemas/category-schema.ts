import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { ICategory } from "../models/category-model";

const schemaOptions: mongoose.SchemaOptions = {
  _id: true,
  id: false,
  timestamps: true,
  skipVersioning: { key: true },
  strict: false,
};

export const categorySchema = new mongoose.Schema(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    unit: {
      type: Schema.Types.String,
      required: true,
    },
    description: {
      type: Schema.Types.String,
      required: false,
    },
    is_active: {
      type: Schema.Types.Boolean,
      required: false,
      default: true,
    },
  },
  schemaOptions
);

const Category = mongoose.model<ICategory>("Category", categorySchema);
export default Category;

