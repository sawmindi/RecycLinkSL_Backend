import { Express } from "express";
import { UserEp } from "../end-point/user-ep";
import { CitizenEp } from "../end-point/citizen-ep";
import { Authentication } from "../middleware/authentication";

export function initUserRoutes(app: Express) {
    // Citizen signup (public)
    app.post(
        "/api/public/signUp",
        UserEp.signUpValidationRules(),
        UserEp.signUp
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

    // Citizen protected APIs
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

    // Available schedules for citizen
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

}
