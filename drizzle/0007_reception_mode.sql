-- Add new appointment statuses for reception mode
ALTER TYPE "public"."appointment_status" ADD VALUE IF NOT EXISTS 'waiting';--> statement-breakpoint
ALTER TYPE "public"."appointment_status" ADD VALUE IF NOT EXISTS 'in-progress';--> statement-breakpoint
-- Add groupId column for multi-service appointments
ALTER TABLE "appointments" ADD COLUMN "group_id" text;