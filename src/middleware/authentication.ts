import * as passport from "passport";
import { NextFunction, Request, Response } from "express";
import { AppLogger } from "../common/logging";
import { UserRole } from "../models/user-model";

export class Authentication {
  public static verifyToken(req: Request, res: Response, next: NextFunction) {
    return passport.authenticate("jwt", { session: false }, (err: any, user: any, info: any) => {
      if (err || !user) {
        AppLogger.error(`Login Failed. reason: ${info}`);
        return res.sendError(info);
      }
      req.user = user;
      req.body.user = user._id;
      return next();
    })(req, res, next);
  }

  public static collectorVerification(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (req.user.role === UserRole.COLLECTOR) {
      return next();
    } else {
      res.status(403).json({
        success: false,
        message: "No authorization to access this route.",
      });
    }
  }


  public static superAdminVerification(req: Request, res: Response, next: NextFunction): void {
    if (req.user.role === UserRole.ADMIN) {
      return next();
    } else {
      res.status(403).json({
        success: false,
        message: "No authorization to access this route.",
      });
    }
  }

  public static collectorSuperAdminVerification(req: Request, res: Response, next: NextFunction): void {
    if (req.user.role === UserRole.COLLECTOR || req.user.role === UserRole.ADMIN) {
      return next();
    } else {
      res.status(403).json({
        success: false,
        message: "No authorization to access this route.",
      });
    }
  }
}
