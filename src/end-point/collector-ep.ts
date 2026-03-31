import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import { Util } from "../common/util";
import PickupRequest from "../schemas/pickup-request-schema";
import Schedule from "../schemas/schedule-schema";
import Collection from "../schemas/collection-schema";
import Notification from "../schemas/notification-schema";

function getUserId(req: Request): Types.ObjectId {
  const id = (req.user as any)?._id;
  return typeof id === "string" ? new Types.ObjectId(id) : (id as Types.ObjectId);
}

function refIdString(ref: unknown): string {
  if (ref == null) return "";
  const r = ref as { _id?: Types.ObjectId; toString?: () => string };
  if (typeof r === "object" && r._id != null) return String(r._id);
  return String(ref);
}

function objectIdsEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  try {
    return new Types.ObjectId(a).equals(new Types.ObjectId(b));
  } catch {
    return false;
  }
}

export namespace CollectorEp {
  // Dashboard
  export async function getDashboardStats(req: Request, res: Response) {
    try {
      const collectorId = getUserId(req);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const todaysPickups = await PickupRequest.countDocuments({
        assigned_collector_id: collectorId,
        created_at: { $gte: todayStart, $lt: todayEnd },
      });

      const completed = await PickupRequest.find({
        assigned_collector_id: collectorId,
        status: "completed",
      })
        .select("user_id")
        .lean();

      const citizenIds = new Set<string>();
      (completed as any[]).forEach((r) => {
        if (r.user_id) citizenIds.add(r.user_id.toString());
      });

      const citizensServed = citizenIds.size;

      const pendingPayments = 0;

      const user: any = req.user || {};

      return res.sendSuccess({
        todaysPickups,
        pendingPayments,
        citizensServed,
        collectorName: user.full_name,
        areaName: user.area,
      });
    } catch (error) {
      return res.sendError(error);
    }
  }

  // Collector schedules
  export async function getTodayRoutes(req: Request, res: Response) {
    try {
      const collectorId = getUserId(req);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const schedules = await Schedule.find({
        collector_id: collectorId,
        date: { $gte: todayStart, $lt: todayEnd },
      })
        .sort({ time: 1 })
        .lean();

      const scheduleIds = (schedules as any[]).map((s) => s._id);
      const requests = await PickupRequest.find({
        schedule_id: { $in: scheduleIds },
        assigned_collector_id: collectorId,
      })
        .select("schedule_id")
        .lean();

      const countBySchedule = new Map<string, number>();
      (requests as any[]).forEach((r) => {
        const key = r.schedule_id?.toString();
        if (!key) return;
        countBySchedule.set(key, (countBySchedule.get(key) || 0) + 1);
      });

      const result = (schedules as any[]).map((s) => {
        const key = s._id.toString();
        const citizens = countBySchedule.get(key) || 0;
        return {
          _id: key,
          area: s.area,
          schedule_date: s.date
            ? new Date(s.date).toISOString().split("T")[0]
            : "",
          schedule_time: s.time || "",
          citizens,
        };
      });

      return res.sendSuccess(result);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function getSchedules(req: Request, res: Response) {
    try {
      const collectorId = getUserId(req);
      const schedules = await Schedule.find({ collector_id: collectorId })
        .sort({ date: 1, time: 1 })
        .lean();

      const scheduleIds = (schedules as any[]).map((s) => s._id);
      const requests = await PickupRequest.find({
        schedule_id: { $in: scheduleIds },
        assigned_collector_id: collectorId,
      })
        .select("schedule_id")
        .lean();

      const countBySchedule = new Map<string, number>();
      (requests as any[]).forEach((r) => {
        const key = r.schedule_id?.toString();
        if (!key) return;
        countBySchedule.set(key, (countBySchedule.get(key) || 0) + 1);
      });

      const result = (schedules as any[]).map((s) => {
        const key = s._id.toString();
        const bookings = countBySchedule.get(key) || 0;
        const maxBookings = typeof s.capacity_kg === "number" ? s.capacity_kg : bookings;
        return {
          _id: key,
          area: s.area,
          schedule_date: s.date
            ? new Date(s.date).toISOString().split("T")[0]
            : "",
          schedule_time: s.time || "",
          bookings,
          maxBookings,
        };
      });

      return res.sendSuccess(result);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // Collector pickups (routes with citizen details)
  export async function getPickupRoutes(req: Request, res: Response) {
    try {
      const collectorId = getUserId(req);
      const requests = await PickupRequest.find({
        assigned_collector_id: collectorId,
        status: { $in: ["pending", "scheduled"] },
      })
        .populate("user_id", "full_name mobile_number address area")
        .populate("schedule_id")
        .lean();

      type Group = {
        area: string;
        date: string;
        time: string;
        status: string;
        citizens: any[];
      };

      const groups = new Map<string, Group>();

      (requests as any[]).forEach((r) => {
        const sched = r.schedule_id as any;
        const key = sched?._id ? sched._id.toString() : `nosched-${r._id}`;
        const area = sched?.area || (r.user_id as any)?.area || "";
        const date = sched?.date
          ? new Date(sched.date).toISOString().split("T")[0]
          : "";
        const time = sched?.time || "";
        const status = r.status || "pending";
        const user = r.user_id as any;
        const citizenId = user?._id?.toString() || "";
          const pickupId = r?._id?.toString() || "";

        const item = {
          type: r.item_name,
          estWeight: String(r.rough_weight ?? ""),
          estValue: String(r.estimated_earnings ?? ""),
        };

        let group = groups.get(key);
        if (!group) {
          group = { area, date, time, status, citizens: [] };
          groups.set(key, group);
        }

        let citizen = group.citizens.find((c: any) => c.id === citizenId);
        if (!citizen) {
          citizen = {
            id: citizenId,
            pickupId: pickupId,
            name: user?.full_name || "",
            area: user?.area || user?.area || "",
            mobile: user?.mobile_number || "",
            items: [] as any[],
            totalValue: "0",
          };
          group.citizens.push(citizen);
        }

        (citizen.items as any[]).push(item);
        const currentTotal = Number(citizen.totalValue || "0");
        const addVal = Number(r.estimated_earnings ?? 0);
        citizen.totalValue = String(currentTotal + addVal);
      });

      const result = Array.from(groups.entries()).map(([key, g]) => ({
        id: key,
        area: g.area,
        date: g.date,
        time: g.time,
        citizens: g.citizens.length,
        status: g.status,
        citizensDetails: g.citizens,
      }));

      return res.sendSuccess(result);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // Complete pickup
  export async function completePickup(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const collectorId = getUserId(req);
      const rawId = req.params.requestId;
      const requestId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!Util.isObjectId(String(requestId))) {
        return res.sendError("Invalid pickup request id");
      }
      const { citizenId: rawCitizenId, notes, items } = req.body as {
        citizenId: string;
        notes?: string;
        items?: { type: string; actualWeight?: string }[];
      };
      const citizenId =
        typeof rawCitizenId === "string" ? rawCitizenId.trim() : "";

      let request: any = await PickupRequest.findOne({
        _id: new Types.ObjectId(String(requestId)),
        assigned_collector_id: collectorId,
      }).populate("item_id", "current_price name");

      if (!request) {
        const byScheduleFilter: any = {
          schedule_id: new Types.ObjectId(String(requestId)),
          assigned_collector_id: collectorId,
        };
        if (citizenId && Util.isObjectId(citizenId)) {
          byScheduleFilter.user_id = new Types.ObjectId(citizenId);
        }
        request = await PickupRequest.findOne(byScheduleFilter)
          .sort({ created_at: -1 })
          .populate("item_id", "current_price name");
      }

      if (!request) {
        return res.sendError("Pickup request not found");
      }

      const requestCitizenId = refIdString(request.user_id);
      if (citizenId) {
        if (!Util.isObjectId(citizenId)) {
          return res.sendError("Invalid citizen id");
        }
        if (
          requestCitizenId &&
          !objectIdsEqual(requestCitizenId, citizenId)
        ) {
          return res.sendError("Citizen mismatch");
        }
        if (!requestCitizenId) {
          request.user_id = new Types.ObjectId(citizenId);
        }
      }

      const rough = Number(request.rough_weight ?? 0);
      let actualWeight = rough;
      if (Array.isArray(items) && items.length > 0) {
        const sum = items.reduce(
          (s, i) => s + (Number(i.actualWeight) || 0),
          0
        );
        if (sum > 0) {
          actualWeight = sum;
        }
      }

      const priceItem = request.item_id as { current_price?: number } | null;
      const unitPrice = Number(priceItem?.current_price ?? NaN);
      const estimated = Number(request.estimated_earnings ?? 0);

      let finalPrice: number;
      if (!Number.isNaN(unitPrice) && unitPrice > 0 && actualWeight > 0) {
        finalPrice = Math.round(unitPrice * actualWeight * 100) / 100;
      } else if (rough > 0 && actualWeight > 0) {
        finalPrice =
          Math.round((estimated / rough) * actualWeight * 100) / 100;
      } else {
        finalPrice = estimated;
      }

      await Collection.findOneAndUpdate(
        { request_id: request._id },
        {
          $set: {
            actual_weight: actualWeight,
            final_price: finalPrice,
            collected_at: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      request.status = "completed";
      if (notes) {
        (request as any).collector_notes = notes;
      }
      await request.save();

      return res.sendSuccess(null);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // Cancel pickup request
  export async function cancelPickup(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const collectorId = getUserId(req);
      const rawId = req.params.requestId;
      const requestId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!Util.isObjectId(String(requestId))) {
        return res.sendError("Invalid pickup request id");
      }

      const { citizenId: rawCitizenId, status, notes } = req.body as {
        citizenId: string;
        status?: string;
        notes?: string;
      };
      const citizenId =
        typeof rawCitizenId === "string" ? rawCitizenId.trim() : "";
      console.log("AV", requestId)
      const request: any = await PickupRequest.findOne({
        _id: new Types.ObjectId(String(requestId)),
        assigned_collector_id: collectorId,
      });

      if (!request) {
        return res.sendError("Pickup request not found");
      }

      const requestCitizenId = refIdString(request.user_id);
      if (citizenId) {
        if (!Util.isObjectId(citizenId)) {
          return res.sendError("Invalid citizen id");
        }
        if (
          requestCitizenId &&
          !objectIdsEqual(requestCitizenId, citizenId)
        ) {
          return res.sendError("Citizen mismatch");
        }
      }

      request.status =
        typeof status === "string" && status.trim().length > 0
          ? status.trim()
          : "canceled";
      if (typeof notes === "string") {
        request.collector_notes = notes;
      }
      await request.save();

      return res.sendSuccess({
        _id: request._id?.toString(),
        status: request.status,
      });
    } catch (error) {
      return res.sendError(error);
    }
  }

  // Collection history
  export async function getHistory(req: Request, res: Response) {
    try {
      const collectorId = getUserId(req);
      const requests = await PickupRequest.find({
        assigned_collector_id: collectorId,
        status: "completed",
      })
        .populate("user_id", "full_name mobile_number address area")
        .lean();

      const requestIds = (requests as any[]).map((r) => r._id);
      const collections = await Collection.find({
        request_id: { $in: requestIds },
      }).lean();
      const collMap = new Map<string, any>();
      (collections as any[]).forEach((c) =>
        collMap.set(c.request_id.toString(), c)
      );

      const result = (requests as any[]).map((r) => {
        const coll = collMap.get(r._id.toString());
        const user = r.user_id as any;
        const total = Number(
          coll?.final_price ?? r.estimated_earnings ?? 0
        );
        const weight =
          coll?.actual_weight ?? r.rough_weight ?? 0;
        return {
          _id: (r._id || r.id)?.toString(),
          citizenName: user?.full_name || "",
          citizenMobile: user?.mobile_number || "",
          area: user?.area || user?.area || "",
          date: coll?.collected_at
            ? new Date(coll.collected_at).toISOString().split("T")[0]
            : r.created_at
              ? new Date(r.created_at).toISOString().split("T")[0]
              : "",
          collector: (req.user as any)?.full_name || "",
          status: r.status || "completed",
          totalValue: String(total),
          items: [
            {
              type: r.item_name,
              weight: String(weight),
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

  // Notifications
  export async function getNotifications(req: Request, res: Response) {
    try {
      const collectorId = getUserId(req);
      const list = await Notification.find({ user_id: collectorId })
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
  export function completePickupRules() {
    const { check } = require("express-validator");
    return [
      check("citizenId").not().isEmpty().withMessage("Citizen is required"),
    ];
  }

  export function cancelPickupRules() {
    const { check } = require("express-validator");
    return [
      check("citizenId").not().isEmpty().withMessage("Citizen is required"),
    ];
  }
}

