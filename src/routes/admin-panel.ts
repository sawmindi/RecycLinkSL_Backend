import { Express } from "express";
import { AdminPanelEp } from "../end-point/admin-panel-ep";
import { Authentication } from "../middleware/authentication";

export function initAdminPanelRoutes(app: Express) {
  const auth = [Authentication.verifyToken, Authentication.superAdminVerification];

  // Dashboard
  app.get("/api/admin/dashboard/stats", auth, AdminPanelEp.getDashboardStats);
  app.get("/api/admin/dashboard/area-pickups", auth, AdminPanelEp.getAreaPickups);
  app.get("/api/admin/dashboard/item-type-distribution", auth, AdminPanelEp.getItemTypeDistribution);

  // Pickup schedules
  app.get("/api/pickup-schedules", auth, AdminPanelEp.getPickupSchedules);
  app.post(
    "/api/pickup-schedules",
    auth,
    AdminPanelEp.pickupScheduleRules(),
    AdminPanelEp.createPickupSchedule
  );
  app.put(
    "/api/pickup-schedules/:id",
    auth,
    AdminPanelEp.pickupScheduleRules(),
    AdminPanelEp.updatePickupSchedule
  );
  app.delete("/api/pickup-schedules/:id", auth, AdminPanelEp.deletePickupSchedule);

  // Categories
  app.get("/api/categories/admin", auth, AdminPanelEp.getCategoriesAdmin);
  app.post("/api/categories", auth, AdminPanelEp.categoryRules(), AdminPanelEp.createCategory);
  app.put("/api/categories/:id", auth, AdminPanelEp.categoryRules(), AdminPanelEp.updateCategory);
  app.delete("/api/categories/:id", auth, AdminPanelEp.deleteCategory);

  // Collectors
  app.get("/api/collectors", auth, AdminPanelEp.getCollectors);

  // Collector–category assignments
  app.get("/api/collector-category-assignments", auth, AdminPanelEp.getCollectorCategoryAssignments);
  app.post(
    "/api/collector-category-assignments",
    auth,
    AdminPanelEp.collectorAssignmentRules(),
    AdminPanelEp.createCollectorCategoryAssignment
  );
  app.delete(
    "/api/collector-category-assignments/:id",
    auth,
    AdminPanelEp.deleteCollectorCategoryAssignment
  );

  // Pickup requests (admin)
  app.get("/api/pickup-requests/admin", auth, AdminPanelEp.getPickupRequestsAdmin);
  app.put(
    "/api/pickup-requests/:requestId/status",
    auth,
    AdminPanelEp.statusRules(),
    AdminPanelEp.updatePickupRequestStatus
  );
  app.put(
    "/api/pickup-requests/:requestId/assign-collector",
    auth,
    AdminPanelEp.assignCollectorRules(),
    AdminPanelEp.assignCollectorToPickupRequest
  );

  // Items (price management)
  app.get("/api/items", auth, AdminPanelEp.getItems);
  app.post("/api/items", auth, AdminPanelEp.itemRules(), AdminPanelEp.createItem);
  app.put("/api/items/:id", auth, AdminPanelEp.updateItem);
  app.delete("/api/items/:id", auth, AdminPanelEp.deleteItem);

  // Users (admin)
  app.get("/api/users/admin", auth, AdminPanelEp.getUsersAdmin);
  app.post(
    "/api/auth/signup",
    auth,
    AdminPanelEp.createUserRules(),
    AdminPanelEp.createUser
  );
  app.put("/api/users/:id", auth, AdminPanelEp.updateUser);
  app.delete("/api/users/:id", auth, AdminPanelEp.deleteUser);
}
