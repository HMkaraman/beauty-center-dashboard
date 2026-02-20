CREATE TABLE "service_employees" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"service_id" text NOT NULL,
	"employee_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "service_employees" ADD CONSTRAINT "service_employees_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_employees" ADD CONSTRAINT "service_employees_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_employees" ADD CONSTRAINT "service_employees_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;