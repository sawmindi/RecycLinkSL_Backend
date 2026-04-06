import User from "../schemas/user-schema";
import { UserRole } from "../models/user-model";
import {normalizeLkMobile, sendSmsSafe} from "./sms";

async function notifyAllAdmins(message: string): Promise<void> {
  const admins = await User.find({ role: UserRole.ADMIN })
    .select("mobile_number")
    .lean();
  for (const a of admins as any[]) {
    const to = normalizeLkMobile(a.mobile_number || "");
    if (to) await sendSmsSafe(to, message);
  }
}

export const SmsNotify = {
  async citizenSignUpOtp(phoneRaw: string, code: string): Promise<void> {
    try {
      const to = normalizeLkMobile(phoneRaw);
      if (!to) return;
      await sendSmsSafe(
        to,
        `RecyclinkSL: Your signup verification code is ${code}. Do not share it.`
      );
    } catch (e) {
      console.error("[SmsNotify] citizenSignUpOtp", e);
    }
  },

  async adminsNewCitizen(
    fullName: string,
    mobile: string,
    area: string
  ): Promise<void> {
    try {
      const msg = `RecyclinkSL Admin: New citizen — ${fullName}, tel ${mobile}, area: ${area || "—"}.`;
      await notifyAllAdmins(msg);
    } catch (e) {
      console.error("[SmsNotify] adminsNewCitizen", e);
    }
  },

  async adminsNewPickupRequest(citizenName: string, itemName: string, requestId: string): Promise<void> {
    try {
      const msg = `RecyclinkSL Admin: New pickup request #${requestId.slice(-6)} — ${citizenName}, item: ${itemName}.`;
      await notifyAllAdmins(msg);
    } catch (e) {
      console.error("[SmsNotify] adminsNewPickupRequest", e);
    }
  },

  async collectorAssignedPickup(
    collectorPhoneRaw: string | undefined,
    itemName: string,
    requestId: string,
    citizenName: string
  ): Promise<void> {
    try {
      const to = normalizeLkMobile(collectorPhoneRaw || "");
      if (!to) return;
      await sendSmsSafe(
        to,
        `RecyclinkSL: You were assigned pickup #${requestId.slice(-6)} — ${itemName}, citizen: ${citizenName}.`
      );
    } catch (e) {
      console.error("[SmsNotify] collectorAssignedPickup", e);
    }
  },

  async citizenAndAdminsPickupCompleted(
    citizenPhoneRaw: string | undefined,
    itemName: string,
    requestId: string,
    finalPrice: number
  ): Promise<void> {
    try {
      const toC = normalizeLkMobile(citizenPhoneRaw || "");
      if (toC) {
        await sendSmsSafe(
          toC,
          `RecyclinkSL: Your pickup #${requestId.slice(-6)} for ${itemName} is completed. Amount: LKR ${finalPrice}.`
        );
      }
      const msg = `RecyclinkSL Admin: Pickup #${requestId.slice(-6)} completed — ${itemName}, LKR ${finalPrice}.`;
      await notifyAllAdmins(msg);
    } catch (e) {
      console.error("[SmsNotify] citizenAndAdminsPickupCompleted", e);
    }
  },

  async citizenAndAdminsPickupCancelled(
    citizenPhoneRaw: string | undefined,
    itemName: string,
    requestId: string,
    byLabel: string
  ): Promise<void> {
    try {
      const toC = normalizeLkMobile(citizenPhoneRaw || "");
      if (toC) {
        await sendSmsSafe(
          toC,
          `RecyclinkSL: Pickup #${requestId.slice(-6)} (${itemName}) was cancelled (${byLabel}).`
        );
      }
      const msg = `RecyclinkSL Admin: Pickup #${requestId.slice(-6)} cancelled (${byLabel}) — ${itemName}.`;
      await notifyAllAdmins(msg);
    } catch (e) {
      console.error("[SmsNotify] citizenAndAdminsPickupCancelled", e);
    }
  },

  async adminsAndCollectorPickupCancelledByCitizen(
    collectorPhoneRaw: string | undefined,
    itemName: string,
    requestId: string,
    citizenName: string
  ): Promise<void> {
    try {
      const toCol = normalizeLkMobile(collectorPhoneRaw || "");
      if (toCol) {
        await sendSmsSafe(
          toCol,
          `RecyclinkSL: Pickup #${requestId.slice(-6)} (${itemName}) cancelled by citizen ${citizenName}.`
        );
      }
      const msg = `RecyclinkSL Admin: Citizen cancelled pickup #${requestId.slice(-6)} — ${itemName}, ${citizenName}.`;
      await notifyAllAdmins(msg);
    } catch (e) {
      console.error("[SmsNotify] adminsAndCollectorPickupCancelledByCitizen", e);
    }
  },

  async citizenAndCollectorPickupCancelledByAdmin(
    citizenPhoneRaw: string | undefined,
    collectorPhoneRaw: string | undefined,
    itemName: string,
    requestId: string
  ): Promise<void> {
    try {
      const toC = normalizeLkMobile(citizenPhoneRaw || "");
      if (toC) {
        await sendSmsSafe(
          toC,
          `RecyclinkSL: Your pickup #${requestId.slice(-6)} (${itemName}) was cancelled by admin.`
        );
      }
      const toCol = normalizeLkMobile(collectorPhoneRaw || "");
      if (toCol) {
        await sendSmsSafe(
          toCol,
          `RecyclinkSL: Pickup #${requestId.slice(-6)} (${itemName}) was cancelled by admin.`
        );
      }
    } catch (e) {
      console.error("[SmsNotify] citizenAndCollectorPickupCancelledByAdmin", e);
    }
  },

  async forgotPasswordOtp(phoneRaw: string, otp: string): Promise<void> {
    try {
      let raw = phoneRaw;
      if (raw?.startsWith("0")) raw = "94" + raw.substring(1);
      const to = normalizeLkMobile(raw);
      if (!to) return;
      await sendSmsSafe(
        to,
        `RecyclinkSL: Your password reset code is ${otp}. Do not share it.`
      );
    } catch (e) {
      console.error("[SmsNotify] forgotPasswordOtp", e);
    }
  },
};
