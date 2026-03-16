import {NextFunction, Request, Response} from 'express';
import {AppLogger, ErrorLogger} from '../common/logging';
import {ApplicationError} from '../common/application-error';
import * as mongoose from "mongoose";

export function handleError(error: Error, req: Request, res: Response, next: NextFunction) {
    AppLogger.error(error.message);
    if (error instanceof ApplicationError) {
        res.sendError(error.message);
    } else if (error instanceof mongoose.Error) {
        res.sendError(error.message, 1);
    } else {
        ErrorLogger.error(error!.stack);
        res.sendError("An internal server error occurred", 1);
    }
}
