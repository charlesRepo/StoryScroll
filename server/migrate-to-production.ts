import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { stories } from '../shared/schema';
import { db as devDb } from './db';

/**
 * Migration script to copy stories from development to production database
 * 
 * Usage:
 * 1. Get your production DATABASE_URL from Replit Database pane
 * 2. Run: PROD_DATABASE_URL="your-prod-url" tsx server/migrate-to-production.ts
 */

async function migrateToProduction() {
  const prodDatabaseUrl = process.env.PROD_DATABASE_URL;
  
  if (!prodDatabaseUrl) {
    console.error('❌ Error: PROD_DATABASE_URL environment variable not set');
    console.log('\nUsage:');
    console.log('  PROD_DATABASE_URL="your-production-url" tsx server/migrate-to-production.ts\n');
    console.log('Get your production database URL from:');
    console.log('  1. Open Database pane in Replit');
    console.log('  2. Switch to "Production Database"');
    console.log('  3. Copy the connection string\n');
    process.exit(1);
  }

  console.log('🔄 Starting migration from development to production...\n');

  try {
    // Connect to production database
    const sql = neon(prodDatabaseUrl);
    const prodDb = drizzle(sql);

    // Fetch all stories from development
    console.log('📖 Reading stories from development database...');
    const allStories = await devDb.select().from(stories);
    console.log(`✅ Found ${allStories.length} stories in development\n`);

    // Insert stories into production in batches of 10
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allStories.length; i += batchSize) {
      const batch = allStories.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(allStories.length / batchSize);
      
      console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} stories)...`);

      try {
        await prodDb.insert(stories).values(batch);
        successCount += batch.length;
        console.log(`   ✅ Success: ${batch.length} stories inserted`);
      } catch (error: any) {
        errorCount += batch.length;
        console.error(`   ❌ Error inserting batch ${batchNum}:`, error.message);
        
        // Try inserting one by one to identify problematic stories
        console.log(`   🔍 Attempting individual inserts for batch ${batchNum}...`);
        for (const story of batch) {
          try {
            await prodDb.insert(stories).values(story);
            successCount++;
            console.log(`      ✅ Inserted: "${story.title.substring(0, 50)}..."`);
          } catch (storyError: any) {
            errorCount++;
            console.error(`      ❌ Failed: "${story.title.substring(0, 50)}..." - ${storyError.message}`);
          }
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} stories`);
    if (errorCount > 0) {
      console.log(`❌ Failed to migrate: ${errorCount} stories`);
    }
    console.log('='.repeat(60));

    // Verify count in production
    console.log('\n🔍 Verifying production database...');
    const prodStories = await prodDb.select().from(stories);
    console.log(`📈 Total stories in production: ${prodStories.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Please review the output above.');
    }

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

migrateToProduction();
