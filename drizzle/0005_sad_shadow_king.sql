CREATE TABLE "activity_log_relations" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"activity_log_id" text NOT NULL,
	"entity_type" "activity_entity_type" NOT NULL,
	"entity_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_log_relations" ADD CONSTRAINT "activity_log_relations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log_relations" ADD CONSTRAINT "activity_log_relations_activity_log_id_activity_logs_id_fk" FOREIGN KEY ("activity_log_id") REFERENCES "public"."activity_logs"("id") ON DELETE cascade ON UPDATE no action;