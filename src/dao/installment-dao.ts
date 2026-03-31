import moment = require("moment");
import Installment from "../schemas/installment-schema";
export namespace InstallmentDao {
    export async function generateInstallments({
        userId,
        customerId,
        collection,
        amountOfLend,
        interestRate,
        interestType,
        installmentType,
        duration,
        startDate,
    }: any) {
        const installments = [];
        const totalInstallments = duration;
        const installmentDates: Date[] = [];

        // Determine time interval (daily / weekly / monthly)
        for (let i = 0; i < totalInstallments; i++) {
            let nextDate = moment(startDate);
            if (installmentType === "daily") nextDate = nextDate.add(i, "days");
            else if (installmentType === "weekly") nextDate = nextDate.add(i, "weeks");
            else if (installmentType === "monthly") nextDate = nextDate.add(i, "months");
            installmentDates.push(nextDate.toDate());
        }

        // Calculate per-installment amounts
        let principalBalance = amountOfLend;
        for (let i = 1; i <= totalInstallments; i++) {
            let profitFromInstallment = 0;
            let installmentAmount = 0;

            if (interestType === "flat") {
                const totalInterest = (amountOfLend * interestRate * duration) / 100;
                profitFromInstallment = totalInterest / totalInstallments;
                installmentAmount =
                    amountOfLend / totalInstallments + profitFromInstallment;
            } else {
                profitFromInstallment = (principalBalance * interestRate) / 100;
                installmentAmount =
                    amountOfLend / totalInstallments + profitFromInstallment;
                principalBalance -= amountOfLend / totalInstallments;
            }

            const installment = {
                userId,
                customerId,
                collectionId: collection._id,
                installmentNumber: i,
                dueDate: installmentDates[i - 1],
                amount: Number(installmentAmount.toFixed(2)),
                profitFromInstallment: Number(profitFromInstallment.toFixed(2)),
                isOverdue: false,
                paymentStatus: "PENDING",
            };

            installments.push(installment);
        }

        const saved = await Installment.insertMany(installments);
        return saved;
    }

    export async function payInstallment(installmentId: string, amountPaid: number) {
        const installment = await Installment.findByIdAndUpdate(
            installmentId,
            {
                $set: {
                    paymentStatus: "PAID",
                    paidAmount: amountPaid,
                    paymentDate: new Date(),
                },
            },
            { new: true }
        );

        return installment;
    }
}
