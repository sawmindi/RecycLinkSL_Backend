import { Express } from "express";
import { AdminEp } from "../end-point/admin-ep";
export function initAdminRoutes(app: Express) {
    app.post(
        "/api/public/adminLogin",
        AdminEp.loginWithEmailValidationRules(),
        AdminEp.adminLoginWithEmail
    );
}
