CREATE TYPE "public"."consent_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "healing_journeys" ADD COLUMN "consent_status" "consent_status";--> statement-breakpoint
ALTER TABLE "healing_journeys" ADD COLUMN "signature_url" text;--> statement-breakpoint
ALTER TABLE "healing_journeys" ADD COLUMN "consent_signed_at" timestamp;--> statement-breakpoint
ALTER TABLE "healing_journeys" ADD COLUMN "consent_requested_at" timestamp;--> statement-breakpoint
ALTER TABLE "healing_journeys" ADD COLUMN "consent_requested_by_id" text;