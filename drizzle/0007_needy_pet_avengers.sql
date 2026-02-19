ALTER TYPE "public"."appointment_status" ADD VALUE 'waiting';--> statement-breakpoint
ALTER TYPE "public"."appointment_status" ADD VALUE 'in-progress';--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "group_id" text;