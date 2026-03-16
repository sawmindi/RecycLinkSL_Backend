import { AppLogger } from "../common/logging";
import { DUser, IUser, UserRole } from "../models/user-model";
import User from "../schemas/user-schema";
import { StringOrObjectId, Util } from "../common/util";
import { ApplicationError } from "../common/application-error";
import { Types } from "mongoose";
import Customer from "../schemas/customer-schema";
import { DCustomer, ICustomer } from "../models/customer-model";
import Collection from "../schemas/collection-schema";
import { DCollection, ICollection } from "../models/collection-model";
export namespace CollectionDao {
    export async function createCollection(user: Partial<DCollection>): Promise<ICollection> {
        const ICollection = new Collection(user);
        const newCollection = await ICollection.save();
        AppLogger.info(`User created, userID: ${newCollection._id}`);
        return newCollection;
    }

}
