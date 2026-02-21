-- Notification system enums
DO $$ BEGIN
  CREATE TYPE "notification_category" AS ENUM('appointment', 'inventory', 'financial', 'staff', 'client', 'system', 'marketing');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "notification_priority" AS ENUM('critical', 'high', 'medium', 'low');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- In-app notifications table
CREATE TABLE IF NOT EXISTS "in_app_notifications" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "category" "notification_category" NOT NULL,
  "priority" "notification_priority" NOT NULL DEFAULT 'medium',
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

-- User notifications pivot table
CREATE TABLE IF NOT EXISTS "user_notifications" (
  "id" text PRIMARY KEY NOT NULL,
  "notification_id" text NOT NULL REFERENCES "in_app_notifications"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "is_read" integer NOT NULL DEFAULT 0,
  "read_at" timestamp,
  "is_archived" integer NOT NULL DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS "notification_preferences" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "tenant_id" text NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "category" "notification_category" NOT NULL,
  "in_app_enabled" integer NOT NULL DEFAULT 1,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_user_notifications_user_read" ON "user_notifications" ("user_id", "is_read");
CREATE INDEX IF NOT EXISTS "idx_user_notifications_notification" ON "user_notifications" ("notification_id");
CREATE INDEX IF NOT EXISTS "idx_in_app_notifications_tenant_created" ON "in_app_notifications" ("tenant_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_notification_preferences_user" ON "notification_preferences" ("user_id", "tenant_id");
