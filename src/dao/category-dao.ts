import { Types } from "mongoose";
import { ICategory } from "../models/category-model";
import Category from "../schemas/category-schema";
import { ApplicationError } from "../common/application-error";
import { Util } from "../common/util";

export namespace CategoryDao {
  export async function findAll(): Promise<ICategory[]> {
    const list = await Category.find({}).lean();
    return list as unknown as ICategory[];
  }

  export async function findById(id: Types.ObjectId | string): Promise<ICategory | null> {
    if (!Util.isObjectId(String(id))) return null;
    const doc = await Category.findById(id).lean();
    return doc as unknown as ICategory | null;
  }

  export async function create(data: {
    name: string;
    unit: string;
    description?: string;
    is_active?: boolean;
  }): Promise<ICategory> {
    const doc = new Category(data);
    await doc.save();
    return doc as ICategory;
  }

  export async function update(
    id: Types.ObjectId | string,
    data: Partial<{ name: string; unit: string; description: string; is_active: boolean }>
  ): Promise<ICategory | null> {
    if (!Util.isObjectId(String(id))) throw new ApplicationError("Invalid category id");
    const doc = await Category.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    return doc as unknown as ICategory | null;
  }

  export async function remove(id: Types.ObjectId | string): Promise<void> {
    if (!Util.isObjectId(String(id))) throw new ApplicationError("Invalid category id");
    const result = await Category.findByIdAndDelete(id);
    if (!result) throw new ApplicationError("Category not found");
  }
}
