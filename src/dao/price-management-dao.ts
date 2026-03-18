import { Types } from "mongoose";
import { IPriceManagement } from "../models/price-management-model";
import PriceManagement from "../schemas/price-management-schema";
import Category from "../schemas/category-schema";
import { ApplicationError } from "../common/application-error";
import { Util } from "../common/util";

export namespace PriceManagementDao {
  export async function findAll(): Promise<any[]> {
    const list = await PriceManagement.find({})
      .populate("category_id", "name")
      .sort({ last_updated: -1 })
      .lean();
    return (list as any[]).map((item) => ({
      id: item._id?.toString(),
      item_name: item.name,
      category_name: item.category_id?.name,
      category_id: item.category_id?._id?.toString(),
      current_price: item.current_price,
      previous_price: item.previous_price ?? null,
      last_updated: item.last_updated
        ? new Date(item.last_updated).toISOString()
        : new Date().toISOString(),
      status: item.status || "active",
    }));
  }

  export async function findById(id: Types.ObjectId | string): Promise<IPriceManagement | null> {
    if (!Util.isObjectId(String(id))) return null;
    const doc = await PriceManagement.findById(id).lean();
    return doc as unknown as IPriceManagement | null;
  }

  export async function create(data: {
    category_id: Types.ObjectId;
    name: string;
    current_price: number;
  }): Promise<any> {
    const doc = new PriceManagement({
      ...data,
      last_updated: new Date(),
      status: "active",
    });
    await doc.save();
    const populated = await PriceManagement.findById(doc._id)
      .populate("category_id", "name")
      .lean();
    const item = populated as any;
    return {
      id: item._id?.toString(),
      item_name: item.name,
      category_name: item.category_id?.name,
      category_id: item.category_id?._id?.toString(),
      current_price: item.current_price,
      previous_price: item.previous_price ?? null,
      last_updated: item.last_updated ? new Date(item.last_updated).toISOString() : new Date().toISOString(),
      status: item.status,
    };
  }

  export async function update(
    id: Types.ObjectId | string,
    data: Partial<{ category_id: Types.ObjectId; name: string; current_price: number; status: string }>
  ): Promise<any | null> {
    if (!Util.isObjectId(String(id))) throw new ApplicationError("Invalid item id");
    const existing = await PriceManagement.findById(id).lean();
    if (!existing) return null;
    const set: any = { ...data, last_updated: new Date() };
    if (data.current_price != null && (existing as any).current_price !== data.current_price) {
      set.previous_price = (existing as any).current_price;
    }
    const doc = await PriceManagement.findByIdAndUpdate(id, { $set: set }, { new: true })
      .populate("category_id", "name")
      .lean();
    const item = doc as any;
    return item
      ? {
          id: item._id?.toString(),
          item_name: item.name,
          category_name: item.category_id?.name,
          category_id: item.category_id?._id?.toString(),
          current_price: item.current_price,
          previous_price: item.previous_price ?? null,
          last_updated: item.last_updated ? new Date(item.last_updated).toISOString() : new Date().toISOString(),
          status: item.status,
        }
      : null;
  }

  export async function remove(id: Types.ObjectId | string): Promise<void> {
    if (!Util.isObjectId(String(id))) throw new ApplicationError("Invalid item id");
    const result = await PriceManagement.findByIdAndDelete(id);
    if (!result) throw new ApplicationError("Item not found");
  }
}
