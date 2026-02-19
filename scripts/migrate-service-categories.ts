/**
 * One-time migration script to:
 * 1. Read distinct `category` values from `services` per tenant
 * 2. Create `service_categories` rows for each
 * 3. Update `services.categoryId` to match
 *
 * Run with: npx tsx scripts/migrate-service-categories.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { services, serviceCategories } from "../src/db/schema";
import { eq, and, sql } from "drizzle-orm";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  console.log("Starting service categories migration...");

  // Get distinct category + tenantId combos
  const distinctCategories = await db
    .select({
      tenantId: services.tenantId,
      category: services.category,
    })
    .from(services)
    .where(sql`${services.categoryId} IS NULL`)
    .groupBy(services.tenantId, services.category);

  console.log(`Found ${distinctCategories.length} distinct category/tenant combos`);

  for (const { tenantId, category } of distinctCategories) {
    // Check if category already exists for this tenant
    const [existing] = await db
      .select()
      .from(serviceCategories)
      .where(
        and(
          eq(serviceCategories.tenantId, tenantId),
          eq(serviceCategories.name, category)
        )
      );

    let categoryId: string;

    if (existing) {
      categoryId = existing.id;
      console.log(`  Category "${category}" already exists for tenant ${tenantId}`);
    } else {
      const [created] = await db
        .insert(serviceCategories)
        .values({
          tenantId,
          name: category,
        })
        .returning();
      categoryId = created.id;
      console.log(`  Created category "${category}" for tenant ${tenantId}`);
    }

    // Update services with this category
    const result = await db
      .update(services)
      .set({ categoryId })
      .where(
        and(
          eq(services.tenantId, tenantId),
          eq(services.category, category),
          sql`${services.categoryId} IS NULL`
        )
      );

    console.log(`  Updated services for category "${category}"`);
  }

  console.log("Migration complete!");
  await client.end();
}

main().catch(console.error);
