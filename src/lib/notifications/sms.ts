interface SMSProvider {
  send(to: string, body: string): Promise<boolean>;
}

class LogSMSProvider implements SMSProvider {
  async send(to: string, body: string): Promise<boolean> {
    console.log(`[SMS] To: ${to}, Body: ${body}`);
    return true;
  }
}

class TwilioSMSProvider implements SMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || "";
    this.authToken = process.env.TWILIO_AUTH_TOKEN || "";
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || "";
  }

  async send(to: string, body: string): Promise<boolean> {
    if (!this.accountSid || !this.authToken) return false;

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          From: this.fromNumber,
          Body: body,
        }).toString(),
      }
    );
    return res.ok;
  }
}

const provider: SMSProvider = process.env.TWILIO_ACCOUNT_SID
  ? new TwilioSMSProvider()
  : new LogSMSProvider();

export async function sendSMS(to: string, body: string): Promise<boolean> {
  return provider.send(to, body);
}
