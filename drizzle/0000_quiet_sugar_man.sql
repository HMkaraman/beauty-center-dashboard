CREATE TYPE "public"."user_role" AS ENUM('owner', 'admin', 'manager', 'staff', 'receptionist');--> statement-breakpoint
CREATE TYPE "public"."client_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('active', 'on-leave', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."doctor_status" AS ENUM('active', 'on-leave', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."service_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('confirmed', 'pending', 'cancelled', 'completed', 'no-show');--> statement-breakpoint
CREATE TYPE "public"."invoice_payment_method" AS ENUM('cash', 'card', 'bank_transfer');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('paid', 'unpaid', 'void');--> statement-breakpoint
CREATE TYPE "public"."expense_status" AS ENUM('approved', 'pending', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."inventory_status" AS ENUM('in-stock', 'low-stock', 'out-of-stock');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('active', 'paused', 'completed', 'draft');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('financial', 'appointments', 'clients', 'employees', 'inventory', 'marketing');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('trial', 'starter', 'professional', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('sms', 'email');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('sent', 'failed', 'pending');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('appointment_confirmation', 'appointment_reminder', 'invoice_receipt', 'low_stock_alert', 'custom');--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"currency" varchar(10) DEFAULT 'SAR' NOT NULL,
	"locale" varchar(5) DEFAULT 'ar' NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Riyadh' NOT NULL,
	"logo" text,
	"phone" varchar(20),
	"email" varchar(255),
	"address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'staff' NOT NULL,
	"employee_id" text,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"date_of_birth" varchar(10),
	"address" text,
	"city" varchar(100),
	"country" varchar(100),
	"status" "client_status" DEFAULT 'active' NOT NULL,
	"join_date" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"role" varchar(100) NOT NULL,
	"specialties" text,
	"status" "employee_status" DEFAULT 'active' NOT NULL,
	"hire_date" timestamp DEFAULT now() NOT NULL,
	"commission_rate" numeric(5, 2) DEFAULT '0',
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_commissions" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"rate" numeric(5, 2) NOT NULL,
	"date" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"is_available" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"specialty" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"status" "doctor_status" DEFAULT 'active' NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0',
	"license_number" varchar(100),
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"category_id" text,
	"category" varchar(255) NOT NULL,
	"duration" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"status" "service_status" DEFAULT 'active' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"client_id" text,
	"client_name" varchar(255) NOT NULL,
	"client_phone" varchar(20),
	"service_id" text,
	"service_name" varchar(255) NOT NULL,
	"employee_id" text,
	"employee_name" varchar(255) NOT NULL,
	"doctor_id" text,
	"date" varchar(10) NOT NULL,
	"time" varchar(5) NOT NULL,
	"duration" integer NOT NULL,
	"status" "appointment_status" DEFAULT 'pending' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"description" varchar(500) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"date" varchar(10) NOT NULL,
	"client_id" text,
	"client_name" varchar(255) NOT NULL,
	"client_phone" varchar(20),
	"appointment_id" text,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '15' NOT NULL,
	"tax_amount" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"status" "invoice_status" DEFAULT 'unpaid' NOT NULL,
	"payment_method" "invoice_payment_method",
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"date" varchar(10) NOT NULL,
	"description" varchar(500) NOT NULL,
	"category" varchar(100) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"status" "expense_status" DEFAULT 'pending' NOT NULL,
	"approved_by" text,
	"receipt_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"date" varchar(10) NOT NULL,
	"description" varchar(500) NOT NULL,
	"category" varchar(100) NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"invoice_id" text,
	"expense_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"category" varchar(100) NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"reorder_level" integer DEFAULT 10,
	"status" "inventory_status" DEFAULT 'in-stock' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"item_id" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"quantity" integer NOT NULL,
	"reason" varchar(255),
	"appointment_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"channel" varchar(100) NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"start_date" varchar(10) NOT NULL,
	"end_date" varchar(10),
	"budget" numeric(10, 2) NOT NULL,
	"reach" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"business_name" varchar(255),
	"business_name_en" varchar(255),
	"tax_rate" integer DEFAULT 15,
	"next_invoice_number" integer DEFAULT 1,
	"currency" varchar(10) DEFAULT 'SAR',
	"sms_enabled" integer DEFAULT 0,
	"email_enabled" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_settings_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "working_hours" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"is_open" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"type" "report_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"last_generated" timestamp,
	"downloads" integer DEFAULT 0 NOT NULL,
	"file_size" varchar(50),
	"file_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_inventory_requirements" (
	"id" text PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"inventory_item_id" text NOT NULL,
	"quantity_required" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"stripe_price_id" varchar(255),
	"plan" "plan_type" DEFAULT 'trial' NOT NULL,
	"status" "subscription_status" DEFAULT 'trialing' NOT NULL,
	"max_staff" integer DEFAULT 3 NOT NULL,
	"max_locations" integer DEFAULT 1 NOT NULL,
	"trial_ends_at" timestamp,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "client_otp_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" varchar(20) NOT NULL,
	"code" varchar(6) NOT NULL,
	"tenant_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"recipient" varchar(255) NOT NULL,
	"subject" varchar(500),
	"body" text NOT NULL,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"key" varchar(64) NOT NULL,
	"prefix" varchar(10) NOT NULL,
	"last_used_at" timestamp,
	"request_count" integer DEFAULT 0 NOT NULL,
	"rate_limit" integer DEFAULT 1000 NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	CONSTRAINT "api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_commissions" ADD CONSTRAINT "employee_commissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_commissions" ADD CONSTRAINT "employee_commissions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_commissions" ADD CONSTRAINT "employee_commissions_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_schedules" ADD CONSTRAINT "employee_schedules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_schedules" ADD CONSTRAINT "employee_schedules_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "working_hours" ADD CONSTRAINT "working_hours_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_inventory_requirements" ADD CONSTRAINT "service_inventory_requirements_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_inventory_requirements" ADD CONSTRAINT "service_inventory_requirements_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;