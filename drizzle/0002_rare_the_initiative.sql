CREATE TYPE "public"."attachment_label" AS ENUM('before', 'after', 'during', 'prescription_scan', 'general');--> statement-breakpoint
CREATE TYPE "public"."healing_journey_status" AS ENUM('active', 'completed', 'paused');--> statement-breakpoint
CREATE TYPE "public"."journey_entry_type" AS ENUM('session', 'prescription', 'note', 'photo', 'milestone');--> statement-breakpoint
CREATE TABLE "healing_journey_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"entry_id" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"filename" varchar(500),
	"mime_type" varchar(100),
	"file_size" integer,
	"label" "attachment_label" DEFAULT 'general',
	"body_region" varchar(100),
	"caption" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "healing_journey_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"journey_id" text NOT NULL,
	"type" "journey_entry_type" NOT NULL,
	"date" varchar(10) NOT NULL,
	"notes" text,
	"created_by_id" text,
	"appointment_id" text,
	"service_id" text,
	"service_name" varchar(255),
	"doctor_id" text,
	"doctor_name" varchar(255),
	"employee_id" text,
	"employee_name" varchar(255),
	"price" numeric(10, 2),
	"duration" integer,
	"invoice_id" text,
	"prescription_text" text,
	"prescribed_by_doctor_id" text,
	"prescribed_by_doctor_name" varchar(255),
	"milestone_label" varchar(255),
	"metadata" jsonb,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "healing_journeys" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"client_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "healing_journey_status" DEFAULT 'active' NOT NULL,
	"start_date" varchar(10) NOT NULL,
	"end_date" varchar(10),
	"primary_service_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "healing_journey_attachments" ADD CONSTRAINT "healing_journey_attachments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healing_journey_attachments" ADD CONSTRAINT "healing_journey_attachments_entry_id_healing_journey_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."healing_journey_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healing_journey_entries" ADD CONSTRAINT "healing_journey_entries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healing_journey_entries" ADD CONSTRAINT "healing_journey_entries_journey_id_healing_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."healing_journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healing_journey_entries" ADD CONSTRAINT "healing_journey_entries_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healing_journey_entries" ADD CONSTRAINT "healing_journey_entries_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healing_journey_entries" ADD CONSTRAINT "healing_journey_entries_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healing_journey_entries" ADD CONSTRAINT "healing_journey_entries_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healing_journey_entries" ADD CONSTRAINT "healing_journey_entries_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healing_journey_entries" ADD CONSTRAINT "healing_journey_entries_prescribed_by_doctor_id_doctors_id_fk" FOREIGN KEY ("prescribed_by_doctor_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healing_journeys" ADD CONSTRAINT "healing_journeys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healing_journeys" ADD CONSTRAINT "healing_journeys_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "healing_journeys" ADD CONSTRAINT "healing_journeys_primary_service_id_services_id_fk" FOREIGN KEY ("primary_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;