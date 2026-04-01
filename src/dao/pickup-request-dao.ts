import { Types } from "mongoose";
import { IPickupRequest } from "../models/pickup-request-model";
import PickupRequest from "../schemas/pickup-request-schema";
import Collection from "../schemas/collection-schema";
import { ApplicationError } from "../common/application-error";
import { Util } from "../common/util";

export namespace PickupRequestDao {
  export async function findAllForAdmin(): Promise<any[]> {
    const list = await PickupRequest.find({})
      .populate("user_id", "full_name area address")
      .populate("item_id", "name category_id")
      .populate("assigned_collector_id", "full_name")
      .sort({ created_at: -1 })
      .lean();

    const requestIds = (list as any[]).map((pr) => pr._id).filter(Boolean);
    const collections = requestIds.length
      ? await Collection.find({ request_id: { $in: requestIds } }).lean()
      : [];
    const collectionByRequestId = new Map<string, any>();
    for (const c of collections as any[]) {
      const key = c.request_id?.toString();
      if (key) collectionByRequestId.set(key, c);
    }

    const Category = (await import("../schemas/category-schema")).default;
    const result = [];
    for (const pr of list as any[]) {
      let category_name: string | undefined;
      if (pr.item_id?.category_id) {
        const cat = await Category.findById(pr.item_id.category_id).lean();
        category_name = (cat as any)?.name;
      }
      const prId = pr._id?.toString();
      const coll = prId ? collectionByRequestId.get(prId) : undefined;

      result.push({
        _id: prId,
        id: prId,
        citizen_name: pr.user_id?.full_name || "—",
        citizen_area: pr.user_id?.area || "—",
        citizen_address: pr.user_id?.address || pr.user_id?.area || "—",
        item_name: pr.item_name,
        category_name,
        rough_weight: pr.rough_weight,
        priority: pr.priority,
        estimated_earnings: pr.estimated_earnings ?? 0,
        status: pr.status || "pending",
        assigned_collector: pr.assigned_collector_id?.full_name,
        created_at: pr.created_at ? new Date(pr.created_at).toISOString() : new Date().toISOString(),
        actual_weight: coll?.actual_weight ?? null,
        final_price: coll?.final_price ?? null,
        collection_id: coll?._id?.toString() ?? null,
      });
    }
    return result;
  }

  export async function findById(id: Types.ObjectId | string): Promise<IPickupRequest | null> {
    if (!Util.isObjectId(String(id))) return null;
    const doc = await PickupRequest.findById(id).lean();
    return doc as unknown as IPickupRequest | null;
  }

  export async function updateStatus(id: Types.ObjectId | string, status: string): Promise<void> {
    if (!Util.isObjectId(String(id))) throw new ApplicationError("Invalid pickup request id");
    const doc = await PickupRequest.findByIdAndUpdate(id, { $set: { status } });
    if (!doc) throw new ApplicationError("Pickup request not found");
  }

  export async function assignCollector(
    id: Types.ObjectId | string,
    collector_id: Types.ObjectId
  ): Promise<void> {
    if (!Util.isObjectId(String(id))) throw new ApplicationError("Invalid pickup request id");
    const doc = await PickupRequest.findByIdAndUpdate(id, {
      $set: { assigned_collector_id: collector_id },
    });
    if (!doc) throw new ApplicationError("Pickup request not found");
  }
}
