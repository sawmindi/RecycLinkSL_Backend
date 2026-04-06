import { Types } from "mongoose";
import { ISchedule } from "../models/schedule-model";
import Schedule from "../schemas/schedule-schema";
import { ApplicationError } from "../common/application-error";
import { Util } from "../common/util";

export namespace ScheduleDao {
  export async function findAll(): Promise<any[]> {
    const list = await Schedule.find({})
      .populate("collector_id", "full_name")
      .sort({ date: -1, time: 1 })
      .lean();
    return (list as any[]).map((s) => ({
      id: (s._id || s.id)?.toString(),
      area: s.area,
      schedule_date: s.date ? new Date(s.date).toISOString().split("T")[0] : "",
      schedule_time: s.time || "",
      items: s.items || "",
      collector_name: s.collector_id?.full_name || null,
      status: s.status || "pending",
    }));
  }

  export async function findById(id: Types.ObjectId | string): Promise<ISchedule | null> {
    if (!Util.isObjectId(String(id))) return null;
    const doc = await Schedule.findById(id).lean();
    return doc as unknown as ISchedule | null;
  }

  function toResponse(s: any): any {
    return {
      id: (s._id || s.id)?.toString(),
      area: s.area,
      schedule_date: s.date ? new Date(s.date).toISOString().split("T")[0] : "",
      schedule_time: s.time || "",
      items: s.items || "",
      collector_name: s.collector_id?.full_name || null,
      status: s.status || "pending",
    };
  }

  export async function create(data: {
    area: string;
    schedule_date: string;
    schedule_time: string;
    items?: string;
    collector_id?: Types.ObjectId;
    status?: string;
  }): Promise<any> {
    const doc = new Schedule({
      area: data.area,
      date: data.schedule_date ? new Date(data.schedule_date) : new Date(),
      time: data.schedule_time,
      items: data.items,
      collector_id: data.collector_id,
      status: data.status || "pending",
    });
    await doc.save();
    const populated = await Schedule.findById(doc._id).populate("collector_id", "full_name").lean();
    return toResponse(populated);
  }

  export async function update(
    id: Types.ObjectId | string,
    data: Partial<{
      area: string;
      schedule_date: string;
      schedule_time: string;
      items: string;
      collector_id: Types.ObjectId;
      status: string;
    }>
  ): Promise<any | null> {
    if (!Util.isObjectId(String(id))) throw new ApplicationError("Invalid schedule id");
    const set: any = {};
    if (data.area != null) set.area = data.area;
    if (data.schedule_date != null) set.date = new Date(data.schedule_date);
    if (data.schedule_time != null) set.time = data.schedule_time;
    if (data.items != null) set.items = data.items;
    if (data.collector_id != null) set.collector_id = data.collector_id;
    if (data.status != null) set.status = data.status;
    const doc = await Schedule.findByIdAndUpdate(id, { $set: set }, { new: true })
      .populate("collector_id", "full_name")
      .lean();
    return doc ? toResponse(doc) : null;
  }

  export async function remove(id: Types.ObjectId | string): Promise<void> {
    if (!Util.isObjectId(String(id))) throw new ApplicationError("Invalid schedule id");
    const result = await Schedule.findByIdAndDelete(id);
    if (!result) throw new ApplicationError("Schedule not found");
  }
}
