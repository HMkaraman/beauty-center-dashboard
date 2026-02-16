interface EmailProvider {
  send(to: string, subject: string, html: string): Promise<boolean>;
}

class LogEmailProvider implements EmailProvider {
  async send(to: string, subject: string, html: string): Promise<boolean> {
    console.log(
      `[Email] To: ${to}, Subject: ${subject}, Body: ${html.substring(0, 100)}...`
    );
    return true;
  }
}

class ResendEmailProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || "";
    this.fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@beautycenter.app";
  }

  async send(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.apiKey) return false;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: this.fromEmail, to, subject, html }),
    });
    return res.ok;
  }
}

const provider: EmailProvider = process.env.RESEND_API_KEY
  ? new ResendEmailProvider()
  : new LogEmailProvider();

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  return provider.send(to, subject, html);
}
