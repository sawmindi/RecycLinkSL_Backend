import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Util } from "../common/util";
import User from "../schemas/user-schema";
import PickupRequest from "../schemas/pickup-request-schema";
import { SmsNotify } from "../services/sms-notifications";
import Schedule from "../schemas/schedule-schema";
import PriceManagement from "../schemas/price-management-schema";
import Category from "../schemas/category-schema";
import Collection from "../schemas/collection-schema";
import Notification from "../schemas/notification-schema";
import { Types } from "mongoose";

function getUserId(req: Request): Types.ObjectId {
  const id = (req.user as any)?._id;
  return typeof id === "string" ? new Types.ObjectId(id) : (id as Types.ObjectId);
}

export namespace CitizenEp {
  // Dashboard stats
  export async function getDashboardStats(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const requests = await PickupRequest.find({ user_id: userId }).lean();
      const requestIds = (requests as any[]).map((r) => r._id);
      const collections = await Collection.find({ request_id: { $in: requestIds } }).lean();

      const totalEarnings = (collections as any[]).reduce(
        (sum, c) => sum + (Number((c as any).final_price) || 0),
        0
      );
      const pendingPickups = (requests as any[]).filter(
        (r) => (r as any).status !== "completed"
      ).length;
      const totalWeightKg = (requests as any[]).reduce(
        (sum, r) => sum + (Number((r as any).rough_weight) || 0),
        0
      );

      return res.sendSuccess({
        totalEarnings,
        pendingPickups,
        totalWeightKg,
      });
    } catch (error) {
      return res.sendError(error);
    }
  }

  // Citizen pickup requests
  export async function getPickupRequests(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const list = await PickupRequest.find({ user_id: userId })
        .populate("assigned_collector_id", "full_name")
        .populate("schedule_id")
        .populate("item_id", "name category_id")
        .sort({ created_at: -1 })
        .lean();

      const catIds = Array.from(
        new Set(
          (list as any[])
            .map((r) => r.item_id?.category_id)
            .filter((id) => !!id)
            .map((id) => id.toString())
        )
      );
      const categories = await Category.find({ _id: { $in: catIds } })
        .select("name")
        .lean();
      const catMap = new Map<string, string>();
      (categories as any[]).forEach((c) => catMap.set(c._id.toString(), c.name));

      const result = (list as any[]).map((r) => {
        const sched = r.schedule_id as any;
        const item = r.item_id as any;
        const categoryName =
          (item?.category_id && catMap.get(item.category_id.toString())) || undefined;
        return {
          _id: (r._id || r.id)?.toString(),
          item_name: r.item_name,
          category_name: categoryName,
          rough_weight: r.rough_weight,
          estimated_earnings: r.estimated_earnings ?? 0,
          status: r.status || "pending",
          assigned_collector: (r.assigned_collector_id as any)?.full_name,
          schedule_date: sched?.date
            ? new Date(sched.date).toISOString().split("T")[0]
            : undefined,
          schedule_time: sched?.time,
          area: sched?.area,
          created_at: r.created_at
            ? new Date(r.created_at).toISOString()
            : new Date().toISOString(),
        };
      });

      return res.sendSuccess(result);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function createPickupRequest(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const userId = getUserId(req);
      const { item_id, rough_weight, priority, estimated_earnings } = req.body;

      const item = await PriceManagement.findById(item_id).lean();
      if (!item) {
        return res.sendError("Invalid item");
      }

      const doc = new PickupRequest({
        user_id: userId,
        item_id: new Types.ObjectId(item_id),
        item_name: (item as any).name,
        rough_weight: Number(rough_weight),
        priority: priority || "normal",
        estimated_earnings: Number(estimated_earnings) || 0,
        status: "pending",
        created_at: new Date(),
      });

      await doc.save();
      const citizen = await User.findById(userId).select("full_name mobile_number").lean();
      void SmsNotify.adminsNewPickupRequest(
        (citizen as any)?.full_name || "Citizen",
        doc.item_name,
        doc._id.toString()
      );

      const r: any = await PickupRequest.findById(doc._id)
        .populate("assigned_collector_id", "full_name")
        .populate("schedule_id")
        .lean();

      return res.sendSuccess({
        _id: (r._id || r.id)?.toString(),
        item_name: r.item_name,
        rough_weight: r.rough_weight,
        estimated_earnings: r.estimated_earnings ?? 0,
        status: r.status || "pending",
        assigned_collector: (r.assigned_collector_id as any)?.full_name,
        created_at: r.created_at
          ? new Date(r.created_at).toISOString()
          : new Date().toISOString(),
      });
    } catch (error) {
      return res.sendError(error);
    }
  }

  // Available schedules for citizen
  export async function getAvailableSchedules(req: Request, res: Response) {
    try {
      const area = (req.query.area as string) || undefined;
      const filter: any = { status: "pending" };
      if (area) filter.area = area;

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      filter.date = { $gte: startOfToday };

      const list = await Schedule.find(filter)
        .populate("collector_id", "full_name")
        .sort({ date: 1, time: 1 })
        .lean();

      const result = (list as any[]).map((s) => ({
        _id: (s._id || s.id)?.toString(),
        area: s.area,
        items: s.items,
        schedule_date: s.date ? new Date(s.date).toISOString().split("T")[0] : "",
        schedule_time: s.time || "",
        full_name: s.collector_id?.full_name,
        spots_left: undefined as number | undefined,
        status: s.status || "pending",
      }));

      return res.sendSuccess(result);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // Assign schedule to pickup request
  export async function assignSchedule(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const userId = getUserId(req);
      const requestId = req.params.requestId;
      const { schedule_id } = req.body;

      const request: any = await PickupRequest.findOne({
        _id: requestId,
        user_id: userId,
      });
      if (!request) return res.sendError("Pickup request not found");

      const schedule = await Schedule.findById(schedule_id);
      if (!schedule) return res.sendError("Schedule not found");

      request.schedule_id = schedule._id;
      request.status = "scheduled";
      await request.save();

      return res.sendSuccess(null);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // Active items
  export async function getActiveItems(req: Request, res: Response) {
    try {
      const list = await PriceManagement.find({ status: { $in: [null, "active"] } })
        .populate("category_id", "name")
        .sort({ name: 1 })
        .lean();
      const result = (list as any[]).map((i) => ({
        _id: (i._id || i.id)?.toString(),
        item_name: i.name,
        current_price: Number(i.current_price),
        category_name: i.category_id?.name,
        category_id: i.category_id?._id?.toString(),
      }));
      return res.sendSuccess(result);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // Collection history
  export async function getHistory(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const requests = await PickupRequest.find({
        user_id: userId,
        status: "completed",
      })
        .populate("assigned_collector_id", "full_name")
        .lean();
      const requestIds = (requests as any[]).map((r) => r._id);
      const collections = await Collection.find({ request_id: { $in: requestIds } }).lean();
      const collMap = new Map<string, any>();
      (collections as any[]).forEach((c) => collMap.set(c.request_id.toString(), c));

      const result = (requests as any[]).map((r) => {
        const coll = collMap.get(r._id.toString());
        const total = Number(coll?.final_price || r.estimated_earnings || 0);
        return {
          _id: (r._id || r.id)?.toString(),
          collection_date: coll?.collected_at
            ? new Date(coll.collected_at).toISOString().split("T")[0]
            : r.created_at
            ? new Date(r.created_at).toISOString().split("T")[0]
            : "",
          collector_name: (r.assigned_collector_id as any)?.full_name || "",
          total,
          items: [
            {
              type: r.item_name,
              weight: String(r.rough_weight),
              value: String(total),
            },
          ],
        };
      });

      return res.sendSuccess(result);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // Cancel own pickup request
  export async function cancelPickup(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const userId = getUserId(req);
      const rawId = req.params.requestId;
      const requestId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!Util.isObjectId(String(requestId))) {
        return res.sendError("Invalid pickup request id");
      }

      const { status, notes } = req.body as { status?: string; notes?: string };

      const request: any = await PickupRequest.findOne({
        _id: new Types.ObjectId(String(requestId)),
        user_id: userId,
      });

      if (!request) {
        return res.sendError("Pickup request not found");
      }

      const citizenUser = await User.findById(userId).select("full_name mobile_number").lean();
      let collectorPhone: string | undefined;
      if (request.assigned_collector_id) {
        const col = await User.findById(request.assigned_collector_id).select("mobile_number").lean();
        collectorPhone = (col as any)?.mobile_number;
      }

      const current = String(request.status || "").toLowerCase();
      if (current === "completed") {
        return res.sendError("Cannot cancel a completed pickup");
      }

      request.status =
        typeof status === "string" && status.trim().length > 0
          ? status.trim()
          : "cancelled";
      if (typeof notes === "string" && notes.length > 0) {
        (request as any).citizen_notes = notes;
      }
      request.schedule_id = null as any;
      await request.save();

      void SmsNotify.adminsAndCollectorPickupCancelledByCitizen(
        collectorPhone,
        request.item_name,
        request._id.toString(),
        (citizenUser as any)?.full_name || ""
      );

      return res.sendSuccess({
        _id: request._id?.toString(),
        status: request.status,
      });
    } catch (error) {
      return res.sendError(error);
    }
  }

  // Notifications
  export async function getNotifications(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      const list = await Notification.find({ user_id: userId })
        .sort({ sent_at: -1, createdAt: -1 })
        .lean();
      const result = (list as any[]).map((n) => ({
        _id: (n._id || n.id)?.toString(),
        type: n.channel || "SYSTEM",
        title: n.action || "",
        message: n.message,
        timestamp: n.sent_at
          ? new Date(n.sent_at).toISOString()
          : new Date(n.createdAt || Date.now()).toISOString(),
        isRead: n.status === "READ",
      }));
      return res.sendSuccess(result);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // Validation rules
  export function createPickupRequestRules() {
    const { check } = require("express-validator");
    return [
      check("item_id").not().isEmpty().withMessage("Item is required"),
      check("rough_weight").isNumeric().withMessage("Weight is required"),
      check("estimated_earnings").isNumeric().withMessage("Estimated earnings is required"),
    ];
  }

  export function assignScheduleRules() {
    const { check } = require("express-validator");
    return [check("schedule_id").not().isEmpty().withMessage("Schedule is required")];
  }

  export function cancelPickupRules(): any[] {
    return [];
  }
}

