const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_API = "https://api.stripe.com/v1";

async function stripeRequest(
  endpoint: string,
  method: string = "GET",
  body?: Record<string, string>
) {
  const res = await fetch(`${STRIPE_API}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Stripe API error");
  }

  return res.json();
}

export const stripe = {
  customers: {
    create: (params: {
      email: string;
      name: string;
      metadata?: Record<string, string>;
    }) =>
      stripeRequest("/customers", "POST", {
        email: params.email,
        name: params.name,
        ...(params.metadata
          ? Object.fromEntries(
              Object.entries(params.metadata).map(([k, v]) => [
                `metadata[${k}]`,
                v,
              ])
            )
          : {}),
      }),
  },

  checkout: {
    sessions: {
      create: (params: {
        customer: string;
        mode: string;
        line_items: Array<{ price: string; quantity: number }>;
        success_url: string;
        cancel_url: string;
      }) =>
        stripeRequest("/checkout/sessions", "POST", {
          customer: params.customer,
          mode: params.mode,
          "line_items[0][price]": params.line_items[0].price,
          "line_items[0][quantity]": String(params.line_items[0].quantity),
          success_url: params.success_url,
          cancel_url: params.cancel_url,
        }),
    },
  },

  billingPortal: {
    sessions: {
      create: (params: { customer: string; return_url: string }) =>
        stripeRequest("/billing_portal/sessions", "POST", {
          customer: params.customer,
          return_url: params.return_url,
        }),
    },
  },
};

export const PLANS = {
  trial: {
    name: "Trial",
    price: 0,
    maxStaff: 3,
    maxLocations: 1,
    trialDays: 14,
  },
  starter: {
    name: "Starter",
    priceMonthly: 99,
    currency: "SAR",
    maxStaff: 3,
    maxLocations: 1,
  },
  professional: {
    name: "Professional",
    priceMonthly: 249,
    currency: "SAR",
    maxStaff: 10,
    maxLocations: 1,
  },
  enterprise: {
    name: "Enterprise",
    priceMonthly: 599,
    currency: "SAR",
    maxStaff: 999,
    maxLocations: 3,
  },
} as const;

export type PlanType = keyof typeof PLANS;
