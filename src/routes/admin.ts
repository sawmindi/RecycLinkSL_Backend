import { Express } from "express";
import { AdminEp } from "../end-point/admin-ep";
import { Authentication } from "../middleware/authentication";
export function initAdminRoutes(app: Express) {
    app.post(
        "/api/public/adminLogin",
        AdminEp.loginWithEmailValidationRules(),
        AdminEp.adminLoginWithEmail
    );
}
