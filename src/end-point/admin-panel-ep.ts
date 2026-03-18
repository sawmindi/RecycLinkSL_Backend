import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Authentication } from "../middleware/authentication";

function paramId(req: Request, key: string): string {
  const p = req.params[key];
  return Array.isArray(p) ? p[0] : (p || "");
}
import { CategoryDao } from "../dao/category-dao";
import { ScheduleDao } from "../dao/schedule-dao";
import { PickupRequestDao } from "../dao/pickup-request-dao";
import { CollectorAssignmentDao } from "../dao/collector-assignment-dao";
import { PriceManagementDao } from "../dao/price-management-dao";
import { UserDao } from "../dao/user-dao";
import User from "../schemas/user-schema";
import Schedule from "../schemas/schedule-schema";
import { UserRole } from "../models/user-model";
import { Util } from "../common/util";
import { Types } from "mongoose";

export namespace AdminPanelEp {
  // ---- Dashboard ----
  export async function getDashboardStats(req: Request, res: Response) {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const [todaysPickups, pendingSchedules, citizensCount, collectorsCount, categories] =
        await Promise.all([
          Schedule.countDocuments({ date: { $gte: todayStart, $lt: todayEnd } }),
          Schedule.countDocuments({ status: "pending" }),
          User.countDocuments({ role: UserRole.CITIZEN }),
          User.countDocuments({ role: UserRole.COLLECTOR }),
          CategoryDao.findAll(),
        ]);

      const activeCategories = categories.filter((c: any) => c.is_active !== false).length;

      return res.sendSuccess({
        todaysPickups,
        pendingSchedules,
        registeredCitizens: citizensCount,
        activeCollectors: collectorsCount,
        activeCategories,
      });
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function getAreaPickups(req: Request, res: Response) {
    try {
      const aggregated = await Schedule.aggregate([
        { $group: { _id: "$area", pickups: { $sum: 1 } } },
        { $project: { area: "$_id", pickups: 1, _id: 0 } },
      ]);
      return res.sendSuccess(aggregated);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function getItemTypeDistribution(req: Request, res: Response) {
    try {
      const categories = await CategoryDao.findAll();
      const items = await PriceManagementDao.findAll();
      const byCategory: Record<string, number> = {};
      for (const item of items) {
        const name = (item as any).category_name || "Other";
        byCategory[name] = (byCategory[name] || 0) + 1;
      }
      const distribution = Object.entries(byCategory).map(([name, value]) => ({
        name,
        value,
      }));
      return res.sendSuccess(distribution);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // ---- Pickup schedules ----
  export async function getPickupSchedules(req: Request, res: Response) {
    try {
      const list = await ScheduleDao.findAll();
      return res.sendSuccess(list);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function createPickupSchedule(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const { area, schedule_date, schedule_time, items } = req.body;
      const created = await ScheduleDao.create({
        area,
        schedule_date,
        schedule_time,
        items: items || "",
      });
      return res.sendSuccess(created);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function updatePickupSchedule(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const id = paramId(req, "id");
      const { area, schedule_date, schedule_time, items } = req.body;
      const updated = await ScheduleDao.update(id, {
        area,
        schedule_date,
        schedule_time,
        items,
      });
      if (!updated) return res.sendError("Schedule not found");
      return res.sendSuccess(updated);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function deletePickupSchedule(req: Request, res: Response) {
    try {
      await ScheduleDao.remove(paramId(req, "id"));
      return res.sendSuccess(null);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // ---- Categories ----
  export async function getCategoriesAdmin(req: Request, res: Response) {
    try {
      const list = await CategoryDao.findAll();
      const mapped = list.map((c: any) => ({
        ...c,
        id: c._id?.toString(),
        is_active: c.is_active !== false,
      }));
      return res.sendSuccess(mapped);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function createCategory(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const { name, unit, description, is_active } = req.body;
      const created = await CategoryDao.create({
        name,
        unit,
        description: description || undefined,
        is_active: is_active !== false,
      });
      const c = created as any;
      return res.sendSuccess({
        id: c._id?.toString(),
        name: c.name,
        unit: c.unit,
        description: c.description,
        is_active: c.is_active !== false,
      });
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function updateCategory(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const id = paramId(req, "id");
      const payload: any = {};
      if (req.body.name != null) payload.name = req.body.name;
      if (req.body.unit != null) payload.unit = req.body.unit;
      if (req.body.description !== undefined) payload.description = req.body.description;
      if (req.body.is_active !== undefined) payload.is_active = req.body.is_active;
      const updated = await CategoryDao.update(id, payload);
      if (!updated) return res.sendError("Category not found");
      const u = updated as any;
      return res.sendSuccess({
        id: u._id?.toString(),
        name: u.name,
        unit: u.unit,
        description: u.description,
        is_active: u.is_active !== false,
      });
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function deleteCategory(req: Request, res: Response) {
    try {
      await CategoryDao.remove(paramId(req, "id"));
      return res.sendSuccess(null);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // ---- Collectors ----
  export async function getCollectors(req: Request, res: Response) {
    try {
      const list = await User.find({ role: UserRole.COLLECTOR })
        .select("_id full_name area")
        .lean();
      const mapped = (list as any[]).map((u) => ({
        id: u._id?.toString(),
        full_name: u.full_name,
        area: u.area || "",
      }));
      return res.sendSuccess(mapped);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // ---- Collector–category assignments ----
  export async function getCollectorCategoryAssignments(req: Request, res: Response) {
    try {
      const list = await CollectorAssignmentDao.findAll();
      return res.sendSuccess(list);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function createCollectorCategoryAssignment(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const { collector_id, category_id, area } = req.body;
      const created = await CollectorAssignmentDao.create({
        collector_id: new Types.ObjectId(collector_id),
        category_id: new Types.ObjectId(category_id),
        area,
      });
      return res.sendSuccess(created);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function deleteCollectorCategoryAssignment(req: Request, res: Response) {
    try {
      await CollectorAssignmentDao.remove(paramId(req, "id"));
      return res.sendSuccess(null);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // ---- Pickup requests (admin) ----
  export async function getPickupRequestsAdmin(req: Request, res: Response) {
    try {
      const list = await PickupRequestDao.findAllForAdmin();
      return res.sendSuccess(list);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function updatePickupRequestStatus(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const id = paramId(req, "requestId");
      const { status } = req.body;
      await PickupRequestDao.updateStatus(id, status);
      return res.sendSuccess(null);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function assignCollectorToPickupRequest(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const requestId = paramId(req, "requestId");
      const { collector_id } = req.body;
      await PickupRequestDao.assignCollector(requestId, new Types.ObjectId(collector_id));
      return res.sendSuccess(null);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // ---- Items (price management) ----
  export async function getItems(req: Request, res: Response) {
    try {
      const list = await PriceManagementDao.findAll();
      return res.sendSuccess(list);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function createItem(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const { category_id, name, current_price } = req.body;
      const created = await PriceManagementDao.create({
        category_id: new Types.ObjectId(category_id),
        name,
        current_price: Number(current_price),
      });
      return res.sendSuccess(created);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function updateItem(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const id = paramId(req, "id");
      const { category_id, name, current_price, status } = req.body;
      const payload: any = {};
      if (name != null) payload.name = name;
      if (current_price != null) payload.current_price = Number(current_price);
      if (status != null) payload.status = status;
      if (category_id != null) payload.category_id = new Types.ObjectId(category_id);
      const updated = await PriceManagementDao.update(id, payload);
      if (!updated) return res.sendError("Item not found");
      return res.sendSuccess(updated);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function deleteItem(req: Request, res: Response) {
    try {
      await PriceManagementDao.remove(paramId(req, "id"));
      return res.sendSuccess(null);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // ---- Users (admin) ----
  export async function getUsersAdmin(req: Request, res: Response) {
    try {
      const list = await UserDao.getUsersForAdmin();
      return res.sendSuccess(list);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function createUser(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const {
        full_name,
        mobile_number,
        email,
        area,
        password,
        role,
      } = req.body;
      const username = mobile_number || email || `user_${Date.now()}`;
      const password_hash = await Util.passwordHashing(password);
      const is_active = true;
      const userRole = role === "COLLECTOR" ? UserRole.COLLECTOR : role === "ADMIN" ? UserRole.ADMIN : UserRole.CITIZEN;
      const existing = await UserDao.getUserByPhoneNumber(mobile_number);
      if (existing) return res.sendError("Mobile number already registered");
      const user = await UserDao.signUpWithPhoneNumber(
        full_name,
        username,
        mobile_number,
        email || "",
        area || "",
        userRole,
        password_hash,
        is_active
      );
      return res.sendSuccess({ user: { username: user.username } });
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function updateUser(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.sendError(errors.array()[0]["msg"]);
    try {
      const id = paramId(req, "id");
      const { full_name, mobile_number, email, area, role, is_active } = req.body;
      const updated = await UserDao.updateUser(new Types.ObjectId(id), {
        full_name,
        mobile_number,
        email,
        area,
        role,
        is_active,
      });
      const mapped = {
        id: updated._id?.toString(),
        full_name: updated.full_name,
        email: updated.email ?? null,
        mobile_number: updated.mobile_number || "",
        address: (updated as any).address || "",
        role: updated.role,
        is_active: updated.is_active !== false,
        joined_date: (updated as any).createdAt ? new Date((updated as any).createdAt).toISOString().split("T")[0] : "",
      };
      return res.sendSuccess(mapped);
    } catch (error) {
      return res.sendError(error);
    }
  }

  export async function deleteUser(req: Request, res: Response) {
    try {
      await UserDao.deleteUser(paramId(req, "id"));
      return res.sendSuccess(null);
    } catch (error) {
      return res.sendError(error);
    }
  }

  // Validation rule sets
  export function pickupScheduleRules() {
    const { check } = require("express-validator");
    return [
      check("area").not().isEmpty().withMessage("Area is required"),
      check("schedule_date").not().isEmpty().withMessage("Schedule date is required"),
      check("schedule_time").not().isEmpty().withMessage("Schedule time is required"),
    ];
  }

  export function categoryRules() {
    const { check } = require("express-validator");
    return [
      check("name").not().isEmpty().withMessage("Name is required"),
      check("unit").not().isEmpty().withMessage("Unit is required"),
    ];
  }

  export function collectorAssignmentRules() {
    const { check } = require("express-validator");
    return [
      check("collector_id").not().isEmpty().withMessage("Collector is required"),
      check("category_id").not().isEmpty().withMessage("Category is required"),
      check("area").not().isEmpty().withMessage("Area is required"),
    ];
  }

  export function itemRules() {
    const { check } = require("express-validator");
    return [
      check("category_id").not().isEmpty().withMessage("Category is required"),
      check("name").not().isEmpty().withMessage("Name is required"),
      check("current_price").isNumeric().withMessage("Current price is required"),
    ];
  }

  export function createUserRules() {
    const { check } = require("express-validator");
    return [
      check("full_name").not().isEmpty().withMessage("Full name is required"),
      check("mobile_number").not().isEmpty().withMessage("Mobile number is required"),
      check("password").not().isEmpty().isLength({ min: 6 }).withMessage("Password min 6 characters"),
      check("role").optional(),
    ];
  }

  export function statusRules() {
    const { check } = require("express-validator");
    return [check("status").not().isEmpty().withMessage("Status is required")];
  }

  export function assignCollectorRules() {
    const { check } = require("express-validator");
    return [check("collector_id").not().isEmpty().withMessage("Collector is required")];
  }
}
