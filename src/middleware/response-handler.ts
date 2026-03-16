import { NextFunction, Request, Response } from 'express';
import { ErrorLogger } from '../common/logging';

export function ResponseHandler(req: Request, res: Response, next: NextFunction) {
    res.sendSuccess = (data: any, message: string = null) => {
        res.send({ success: true, data: data, message: message });
    };
    res.sendError = (error: any, errorCode = 0) => {
        if (typeof error === 'string') {
            res.send({ success: false, error: error, errorCode: errorCode });
        } else {
            if (!error) {
                error = { stack: null, message: "Unknown Error" };
            }
            ErrorLogger.error(error.stack);
            res.send({ success: false, error: error.msg, errorData: error, errorCode: errorCode });
        }
    };
    next();
}