import { sendSMS } from "./sms";
import { sendEmail } from "./email";

export interface NotificationPayload {
  to: string;
  subject?: string;
  body: string;
  type: "sms" | "email";
}

export async function sendNotification(
  payload: NotificationPayload
): Promise<boolean> {
  try {
    if (payload.type === "sms") {
      return await sendSMS(payload.to, payload.body);
    } else {
      return await sendEmail(payload.to, payload.subject || "", payload.body);
    }
  } catch (error) {
    console.error(`Notification failed (${payload.type}):`, error);
    return false;
  }
}

export { sendSMS } from "./sms";
export { sendEmail } from "./email";
export {
  appointmentConfirmation,
  appointmentReminder,
  invoiceReceipt,
  lowStockAlert,
} from "./templates";
