import { Express } from "express";
import { UserEp } from "../end-point/user-ep";
import { CitizenEp } from "../end-point/citizen-ep";
import { CollectorEp } from "../end-point/collector-ep";
import { AdminPanelEp } from "../end-point/admin-panel-ep";
import { Authentication } from "../middleware/authentication";

export function initUserRoutes(app: Express) {
    // Citizen signup
    app.post(
        "/api/public/signUp",
        UserEp.signUpValidationRules(),
        UserEp.signUpAsCitizen
    );

    app.post(
        "/api/public/login",
        UserEp.loginWithPhoneValidationRules(),
        UserEp.loginWithPhoneNumber
    );

    app.post(
        "/api/public/signUpOTPVerification",
        UserEp.verifyUserByCode
    );

    app.get(
        "/api/auth/me",
        UserEp.getMe
    );

    // Collector signup (admin only)
    app.post(
        "/api/auth/collectors",
        Authentication.verifyToken,
        Authentication.superAdminVerification,
        UserEp.collectorSignUpValidationRules(),
        UserEp.collectorSignUp
    );

    app.post("/api/public/forgotPassword", UserEp.sendForgotPassword);

    app.post(
        "/api/public/otpVerificationForgotPassword",
        UserEp.otpVerificationForgotPassword
    );

    // Shared auth
    const auth = [Authentication.verifyToken];

    // Dashboard
    app.get("/api/citizen/dashboard/stats", auth, CitizenEp.getDashboardStats);

    // Pickup requests (citizen)
    app.get("/api/pickup-requests/citizen", auth, CitizenEp.getPickupRequests);
    app.post(
        "/api/pickup-requests",
        auth,
        CitizenEp.createPickupRequestRules(),
        CitizenEp.createPickupRequest
    );

    // Available schedules (citizen)
    app.get(
        "/api/pickup-schedules/citizen",
        auth,
        CitizenEp.getAvailableSchedules
    );

    // Assign schedule to pickup request
    app.put(
        "/api/pickup-requests/:requestId/schedule",
        auth,
        CitizenEp.assignScheduleRules(),
        CitizenEp.assignSchedule
    );

    // Active items
    app.get("/api/items/active", auth, CitizenEp.getActiveItems);

    // Collection history
    app.get("/api/citizen/history", auth, CitizenEp.getHistory);

    // Notifications
    app.get("/api/citizen/notifications", auth, CitizenEp.getNotifications);

    // Collector protected APIs
    const collectorAuth = [Authentication.verifyToken, Authentication.collectorVerification];

    // Collector dashboard
    app.get("/api/collector/dashboard/stats", collectorAuth, CollectorEp.getDashboardStats);

    // Collector schedules / routes
    app.get("/api/pickup-schedules/collector/today", collectorAuth, CollectorEp.getTodayRoutes);
    app.get("/api/pickup-schedules/collector", collectorAuth, CollectorEp.getSchedules);

    // Collector pickups with citizen details
    app.get("/api/collector/pickups", collectorAuth, CollectorEp.getPickupRoutes);

    // Complete pickup
    app.post(
        "/api/collector/pickups/:requestId/complete",
        collectorAuth,
        CollectorEp.completePickupRules(),
        CollectorEp.completePickup
    );

    // Cancel pickup request
    app.post(
        "/api/collector/pickups/:requestId/cancel",
        collectorAuth,
        CollectorEp.cancelPickupRules(),
        CollectorEp.cancelPickup
    );

    // Collector collection history
    app.get("/api/collector/history", collectorAuth, CollectorEp.getHistory);

    // Collector notifications
    app.get("/api/collector/notifications", collectorAuth, CollectorEp.getNotifications);

    // Citizen & admin cancel pickup request
    const citizenAuth = [Authentication.verifyToken, Authentication.citizenVerification];
    app.post(
        "/api/citizen/pickups/:requestId/cancel",
        citizenAuth,
        CitizenEp.cancelPickupRules(),
        CitizenEp.cancelPickup
    );

    const adminAuth = [Authentication.verifyToken, Authentication.superAdminVerification];
    app.post(
        "/api/admin/pickups/:requestId/cancel",
        adminAuth,
        AdminPanelEp.cancelPickupRequestRules(),
        AdminPanelEp.cancelPickupRequest
    );
}
