import { NextFunction, Request, Response } from "express";
import { UserDao } from "../dao/user-dao";
import { check, validationResult } from "express-validator";
import multer = require("multer");
import { Validation } from "../common/validation";
export namespace AdminEp {
    export function loginWithEmailValidationRules() {
        return [Validation.email(), Validation.password()];
    }

    export async function adminLoginWithEmail(req: Request, res: Response, next: NextFunction) {
        const email = req.body.email;
        const password = req.body.password;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.sendError(errors.array()[0]["msg"]);
        }
        try {
            let user = await UserDao.getUserByEmail(email);
            if (user) {
                let isMatch;

                if (user.password_hash) {
                    isMatch = await user.comparePassword(password);
                } else {
                    return res.sendError("You have signed up to this account using social login. Please check.");
                }

                if (isMatch) {
                    let authToken = user.createAccessToken();

                    res.cookie("token", authToken, {
                        httpOnly: true,
                        secure: false,
                        maxAge: 24 * 60 * 60 * 1000,
                    });

                    return res.sendSuccess(authToken, "Successfully Logged.");
                } else {
                    return res.sendError("Incorrect email/password combination.");
                }
            } else {
                return res.sendError("User not found.");
            }
        } catch (error) {
            return res.sendError(error);
        }
    }
}
