import { AppLogger } from "../common/logging";
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
