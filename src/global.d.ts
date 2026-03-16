type ObjectId = import("mongoose").Types.ObjectId;
declare namespace Express {
  export interface Request {
    user?: User;
  }

  export interface Response {
    sendSuccess: (data: any, message?: string) => void;
    sendError: (error: any, errorCode?: number) => void;
  }

  interface User {
    _id: ObjectId;
    name: string;
    email: string;
    role: string;
  }
}
