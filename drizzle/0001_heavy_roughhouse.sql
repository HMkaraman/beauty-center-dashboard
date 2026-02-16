CREATE TABLE "doctor_commissions" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"doctor_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"rate" numeric(5, 2) NOT NULL,
	"date" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "national_id" varchar(50);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "passport_number" varchar(50);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "date_of_birth" varchar(10);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "emergency_contact" varchar(255);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "salary" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "education" text;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "certificates" text;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "years_of_experience" integer;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "compensation_type" varchar(20);--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "salary" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "commission_rate" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "doctor_commissions" ADD CONSTRAINT "doctor_commissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_commissions" ADD CONSTRAINT "doctor_commissions_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_commissions" ADD CONSTRAINT "doctor_commissions_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;