-- Custom SQL migration for inventory enhancements
-- Adds product_type and storage_condition enums, inventory_categories table, and new columns to inventory_items

-- Create enums
DO $$ BEGIN
  CREATE TYPE "public"."product_type" AS ENUM('injectable', 'skincare', 'consumable', 'retail', 'equipment', 'device_supply', 'medication', 'chemical');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."storage_condition" AS ENUM('ambient', 'refrigerated', 'frozen');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create inventory_categories table
CREATE TABLE IF NOT EXISTS "inventory_categories" (
  "id" text PRIMARY KEY NOT NULL,
  "tenant_id" text NOT NULL,
  "name" varchar(255) NOT NULL,
  "name_en" varchar(255),
  "description" text,
  "color" varchar(20),
  "is_active" integer DEFAULT 1 NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key for inventory_categories
DO $$ BEGIN
  ALTER TABLE "inventory_categories" ADD CONSTRAINT "inventory_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Add new columns to inventory_items
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "name_en" varchar(255);
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "barcode" varchar(100);
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "image" text;
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "brand" varchar(255);
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "category_id" text;
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "product_type" "product_type";
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "unit_of_measure" varchar(20);
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "units_per_package" integer;
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "cost_price" numeric(10,2);
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "expiry_date" varchar(10);
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "batch_number" varchar(100);
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "is_retail" integer DEFAULT 0 NOT NULL;
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "is_active" integer DEFAULT 1 NOT NULL;
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "supplier_name" varchar(255);
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "storage_conditions" "storage_condition";
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "notes" text;

-- Add foreign key for category_id
DO $$ BEGIN
  ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_category_id_inventory_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."inventory_categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
