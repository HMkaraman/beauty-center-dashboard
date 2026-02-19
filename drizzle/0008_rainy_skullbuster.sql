ALTER TABLE "tenant_settings" ADD COLUMN "country" varchar(10);--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "tax_enabled" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "exchange_rates" text;