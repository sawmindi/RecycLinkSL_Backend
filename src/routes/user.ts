import { Express } from "express";
import { UserEp } from "../end-point/user-ep";
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

}
