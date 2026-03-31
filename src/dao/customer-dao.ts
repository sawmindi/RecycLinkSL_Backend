import { AppLogger } from "../common/logging";
import { StringOrObjectId, Util } from "../common/util";
import { ApplicationError } from "../common/application-error";
import { Types } from "mongoose";
import Customer from "../schemas/customer-schema";
import { DCustomer, ICustomer } from "../models/customer-model";
export namespace CustomerDao {
    export async function createCustomer(user: Partial<DCustomer>): Promise<ICustomer> {
        const iCustomer = new Customer(user);
        const newCustomer = await iCustomer.save();
        AppLogger.info(`User created, userID: ${newCustomer._id}`);
        return newCustomer;
    }


    export async function getAllCustomers(userId: Types.ObjectId, limit: number, offset: number) {
        let customer = await Customer.find({ userId }).sort({ createdAt: -1 }).skip(limit * (offset - 1))
            .limit(limit);
        AppLogger.info(`Found customer for collectorId`);
        return customer;
    }

    export async function getCustomerById(id: StringOrObjectId): Promise<ICustomer> {
        let customer: ICustomer = await Customer.findById(id)
            .select({ password: 0 });
        if (!customer) {
            throw new ApplicationError("Customer not found for Id: " + id);
        }

        AppLogger.info(`Got customer for id, customerId: ${customer._id}`);
        await customer.save();
        return customer;
    }
}
