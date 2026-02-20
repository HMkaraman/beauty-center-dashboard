CREATE TYPE "public"."consumption_type" AS ENUM('laser_shots', 'injectable');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('active', 'used', 'expired', 'disposed');--> statement-breakpoint
CREATE TYPE "public"."shot_deviation" AS ENUM('within_range', 'below', 'above');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'product_expiry_reminder' BEFORE 'custom';--> statement-breakpoint
CREATE TABLE "client_product_reservations" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"client_id" text NOT NULL,
	"consumption_log_id" text NOT NULL,
	"inventory_item_id" text,
	"product_name" varchar(255) NOT NULL,
	"leftover_amount" numeric(10, 2) NOT NULL,
	"remaining_amount" numeric(10, 2) NOT NULL,
	"unit" varchar(10) NOT NULL,
	"original_appointment_id" text,
	"opened_date" varchar(10),
	"expiry_date" varchar(10),
	"expiry_days" integer,
	"status" "reservation_status" DEFAULT 'active' NOT NULL,
	"touch_up_appointment_id" text,
	"touch_up_date" varchar(10),
	"touch_up_amount_used" numeric(10, 2),
	"touch_up_is_free" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_consumption_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"appointment_id" text NOT NULL,
	"service_id" text,
	"client_id" text,
	"consumption_type" "consumption_type" NOT NULL,
	"actual_shots" integer,
	"expected_min_shots" integer,
	"expected_max_shots" integer,
	"shot_deviation" "shot_deviation",
	"inventory_item_id" text,
	"product_name" varchar(255),
	"total_allocated" numeric(10, 2),
	"amount_used" numeric(10, 2),
	"leftover_amount" numeric(10, 2),
	"unit" varchar(10),
	"device_id" varchar(100),
	"device_model" varchar(100),
	"notes" text,
	"recorded_by_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "service_type" varchar(20);--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "laser_min_shots" integer;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "laser_max_shots" integer;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "injectable_unit" varchar(10);--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "injectable_expiry_days" integer;--> statement-breakpoint
ALTER TABLE "client_product_reservations" ADD CONSTRAINT "client_product_reservations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_product_reservations" ADD CONSTRAINT "client_product_reservations_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_product_reservations" ADD CONSTRAINT "client_product_reservations_consumption_log_id_session_consumption_logs_id_fk" FOREIGN KEY ("consumption_log_id") REFERENCES "public"."session_consumption_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_product_reservations" ADD CONSTRAINT "client_product_reservations_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_product_reservations" ADD CONSTRAINT "client_product_reservations_original_appointment_id_appointments_id_fk" FOREIGN KEY ("original_appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_product_reservations" ADD CONSTRAINT "client_product_reservations_touch_up_appointment_id_appointments_id_fk" FOREIGN KEY ("touch_up_appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_consumption_logs" ADD CONSTRAINT "session_consumption_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_consumption_logs" ADD CONSTRAINT "session_consumption_logs_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_consumption_logs" ADD CONSTRAINT "session_consumption_logs_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_consumption_logs" ADD CONSTRAINT "session_consumption_logs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_consumption_logs" ADD CONSTRAINT "session_consumption_logs_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE set null ON UPDATE no action;