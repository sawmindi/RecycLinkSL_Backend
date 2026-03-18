import { Types } from "mongoose";
import { ICollectorAssignment } from "../models/collector-assignment-model";
import CollectorAssignment from "../schemas/collector-assignment-schema";
import User from "../schemas/user-schema";
import Category from "../schemas/category-schema";
import { ApplicationError } from "../common/application-error";
import { Util } from "../common/util";

export namespace CollectorAssignmentDao {
  export async function findAll(): Promise<any[]> {
    const list = await CollectorAssignment.find({})
      .populate("collector_id", "full_name")
      .populate("category_id", "name")
      .sort({ assigned_date: -1 })
      .lean();
    return (list as any[]).map((a) => ({
      id: a._id?.toString(),
      collector_name: a.collector_id?.full_name || "—",
      category_name: a.category_id?.name || "—",
      area: a.area,
      assigned_date: a.assigned_date
        ? new Date(a.assigned_date).toISOString().split("T")[0]
        : "",
      status: a.status || "active",
    }));
  }

  export async function create(data: {
    collector_id: Types.ObjectId;
    category_id: Types.ObjectId;
    area: string;
  }): Promise<any> {
    const doc = new CollectorAssignment({
      ...data,
      assigned_date: new Date(),
      status: "active",
    });
    await doc.save();
    const populated = await CollectorAssignment.findById(doc._id)
      .populate("collector_id", "full_name")
      .populate("category_id", "name")
      .lean();
    const a = populated as any;
    return {
      id: a._id?.toString(),
      collector_name: a.collector_id?.full_name,
      category_name: a.category_id?.name,
      area: a.area,
      assigned_date: a.assigned_date ? new Date(a.assigned_date).toISOString().split("T")[0] : "",
      status: a.status,
    };
  }

  export async function remove(id: Types.ObjectId | string): Promise<void> {
    if (!Util.isObjectId(String(id))) throw new ApplicationError("Invalid assignment id");
    const result = await CollectorAssignment.findByIdAndDelete(id);
    if (!result) throw new ApplicationError("Assignment not found");
  }
}
