CREATE TYPE "public"."product_type" AS ENUM('injectable', 'skincare', 'consumable', 'retail', 'equipment', 'device_supply', 'medication', 'chemical');--> statement-breakpoint
CREATE TYPE "public"."storage_condition" AS ENUM('ambient', 'refrigerated', 'frozen');--> statement-breakpoint
CREATE TYPE "public"."notification_category" AS ENUM('appointment', 'inventory', 'financial', 'staff', 'client', 'system', 'marketing');--> statement-breakpoint
CREATE TYPE "public"."notification_priority" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TABLE "inventory_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_en" varchar(255),
	"description" text,
	"color" varchar(20),
	"is_active" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "in_app_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"category" "notification_category" NOT NULL,
	"priority" "notification_priority" DEFAULT 'medium' NOT NULL,
	"title" varchar(500) NOT NULL,
	"title_en" varchar(500),
	"body" text,
	"body_en" text,
	"icon" varchar(50),
	"action_url" varchar(500),
	"entity_type" varchar(50),
	"entity_id" text,
	"actor_id" text,
	"actor_name" varchar(255),
	"metadata" jsonb,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"category" "notification_category" NOT NULL,
	"in_app_enabled" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"notification_id" text NOT NULL,
	"user_id" text NOT NULL,
	"is_read" integer DEFAULT 0 NOT NULL,
	"read_at" timestamp,
	"is_archived" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "name_en" varchar(255);--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "barcode" varchar(100);--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "brand" varchar(255);--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "category_id" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "product_type" "product_type";--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "unit_of_measure" varchar(20);--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "units_per_package" integer;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "cost_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "expiry_date" varchar(10);--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "batch_number" varchar(100);--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "is_retail" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "is_active" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "supplier_name" varchar(255);--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "storage_conditions" "storage_condition";--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "inventory_categories" ADD CONSTRAINT "inventory_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "in_app_notifications" ADD CONSTRAINT "in_app_notifications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_notification_id_in_app_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."in_app_notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_category_id_inventory_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."inventory_categories"("id") ON DELETE set null ON UPDATE no action;