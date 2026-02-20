ALTER TYPE "public"."invoice_status" ADD VALUE 'partially_paid';--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"type" varchar(20) NOT NULL,
	"parent_code" varchar(20),
	"is_system" integer DEFAULT 0,
	"is_active" integer DEFAULT 1,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_settlements" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"date" varchar(10) NOT NULL,
	"opening_balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"cash_sales" numeric(10, 2) DEFAULT '0' NOT NULL,
	"card_sales" numeric(10, 2) DEFAULT '0' NOT NULL,
	"bank_transfer_sales" numeric(10, 2) DEFAULT '0' NOT NULL,
	"cash_expenses" numeric(10, 2) DEFAULT '0' NOT NULL,
	"expected_cash" numeric(10, 2) DEFAULT '0' NOT NULL,
	"actual_cash" numeric(10, 2),
	"discrepancy" numeric(10, 2),
	"closed_by" text,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"start_date" varchar(10) NOT NULL,
	"end_date" varchar(10) NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"snapshot_revenue" numeric(12, 2),
	"snapshot_expenses" numeric(12, 2),
	"snapshot_profit" numeric(12, 2),
	"closed_by" text,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"payment_date" varchar(10) NOT NULL,
	"reference_number" varchar(100),
	"notes" text,
	"receipt_number" varchar(100),
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"description" varchar(500) NOT NULL,
	"category_id" text,
	"category" varchar(100) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"frequency" varchar(20) NOT NULL,
	"day_of_month" integer DEFAULT 1,
	"start_date" varchar(10) NOT NULL,
	"end_date" varchar(10),
	"auto_approve" integer DEFAULT 0,
	"last_generated_date" varchar(10),
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"code" varchar(20),
	"parent_id" text,
	"is_default" integer DEFAULT 0,
	"is_active" integer DEFAULT 1,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "service_id" text;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "tax_category" varchar(20) DEFAULT 'S';--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "tax_rate" numeric(5, 2) DEFAULT '15';--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "tax_amount" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "uuid" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "invoice_type" varchar(20) DEFAULT 'standard';--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "invoice_type_code" varchar(5);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "original_invoice_id" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "buyer_trn" varchar(50);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "buyer_name" varchar(255);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "buyer_address" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "qr_code" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "xml_content" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "digital_signature" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "zatca_status" varchar(20);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "zatca_response" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "issued_at" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "currency" varchar(10) DEFAULT 'SAR';--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "discount_total" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "category_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "account_id" text;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "tax_registration_number" varchar(50);--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "business_address" text;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "business_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "e_invoicing_enabled" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "e_invoicing_mode" varchar(20);--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "invoice_prefix" varchar(10) DEFAULT 'INV';--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "next_credit_note_number" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "zatca_environment" varchar(20) DEFAULT 'sandbox';--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "zatca_compliance_csid" text;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "zatca_production_csid" text;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "zatca_private_key" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_settlements" ADD CONSTRAINT "daily_settlements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_settlements" ADD CONSTRAINT "daily_settlements_closed_by_users_id_fk" FOREIGN KEY ("closed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_periods" ADD CONSTRAINT "financial_periods_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_periods" ADD CONSTRAINT "financial_periods_closed_by_users_id_fk" FOREIGN KEY ("closed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_expenses" ADD CONSTRAINT "recurring_expenses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;