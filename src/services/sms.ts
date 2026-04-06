import axios from "axios";

export function normalizeLkMobile(input: string | undefined | null): string | null {
  if (input == null || typeof input !== "string") return null;
  let d = input.replace(/\s+/g, "").replace(/^\+/, "");
  if (!d) return null;
  if (d.startsWith("0")) d = "94" + d.slice(1);
  if (!d.startsWith("94")) d = "94" + d;
  if (!/^94\d{9}$/.test(d)) {
    console.log("[SMS] invalid or unsupported phone format:", input);
    return null;
  }
  return d;
}

export async function sendSmsSafe(to: string, message: string): Promise<boolean> {
  const preview =
    message.length > 200 ? message.slice(0, 200) + "…" : message;
  console.log("[SMS]", { to, message: preview });

  if (!SMS_REAL) {
    console.log("[SMS] demo mode — provider not called (set SMS_SEND_REAL=true for live send)");
    return true;
  }

  const apiURL = process.env.SMS_API_URL || "https://smslenz.lk/api/send-sms";
  const userId = process.env.SMS_USER_ID;
  const apiKey = process.env.SMS_API_KEY;
  const senderId = process.env.SMS_SENDER_ID || "NVS";

  if (!userId || !apiKey) {
    console.log("[SMS] SMS_SEND_REAL=true but SMS_USER_ID / SMS_API_KEY missing — skip provider");
    return false;
  }

  try {
    const response = await axios.post(apiURL, null, {
      params: {
        user_id: Number(userId),
        api_key: apiKey,
        sender_id: senderId,
        contact: to,
        message,
      },
    });
    const ok = response.data?.success === true;
    if (!ok) console.log("[SMS] provider returned non-success:", response.data);
    return ok;
  } catch (e: any) {
    console.log("[SMS] provider error:", e?.message || e);
    return false;
  }
}

/** @deprecated use sendSmsSafe */
export namespace SMSService2 {
  export async function sendSMS(phoneNumber: string, text: string) {
    const to = normalizeLkMobile(phoneNumber);
    if (!to) return false;
    return sendSmsSafe(to, text);
  }
}
