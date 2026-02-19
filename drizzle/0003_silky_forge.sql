CREATE TYPE "public"."activity_action" AS ENUM('create', 'update', 'delete', 'note');--> statement-breakpoint
CREATE TYPE "public"."activity_entity_type" AS ENUM('appointment', 'client', 'employee', 'doctor', 'invoice', 'expense', 'service', 'inventory_item', 'campaign', 'transaction');--> statement-breakpoint
CREATE TABLE "activity_log_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"activity_log_id" text NOT NULL,
	"url" text NOT NULL,
	"filename" varchar(500),
	"mime_type" varchar(100),
	"file_size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"entity_type" "activity_entity_type" NOT NULL,
	"entity_id" text NOT NULL,
	"action" "activity_action" NOT NULL,
	"user_id" text,
	"user_name" varchar(255),
	"changes" jsonb,
	"content" text,
	"entity_label" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_log_attachments" ADD CONSTRAINT "activity_log_attachments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log_attachments" ADD CONSTRAINT "activity_log_attachments_activity_log_id_activity_logs_id_fk" FOREIGN KEY ("activity_log_id") REFERENCES "public"."activity_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;