import {UserRole} from "../models/user-model";
import {NextFunction, Request, Response} from "express";
import {ApplicationError} from "../common/application-error";

export function verifyRole(...roles: UserRole[]) {
    return function (req: Request, res: Response, next: NextFunction) {
        if (roles.includes(<UserRole>req.user.role)) {
            next();
        } else {
            throw new ApplicationError("Permission denied.");
        }
    };
}
