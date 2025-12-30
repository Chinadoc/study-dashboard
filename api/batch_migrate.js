#!/usr/bin/env node
/**
 * Batch execute SQL statements from a file to D1
 * Handles network errors by retrying failed batches
 */
const { execSync } = require('child_process');
const fs = require('fs');

const SQL_FILE = '../data/migrations/import_aks_2024_2026.sql';
const BATCH_SIZE = 50;

// Read and parse SQL file
const content = fs.readFileSync(SQL_FILE, 'utf8');
const statements = content.split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('--'))
    .map(line => line.trim());

console.log(`Total statements: ${statements.length}`);

let success = 0;
let failed = 0;

for (let i = 0; i < statements.length; i += BATCH_SIZE) {
    const batch = statements.slice(i, i + BATCH_SIZE);
    const combined = batch.join(' ');

    console.log(`\nExecuting batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(statements.length / BATCH_SIZE)} (${batch.length} statements)...`);

    try {
        execSync(
            `npx wrangler d1 execute LOCKSMITH_DB --remote --command "${combined.replace(/"/g, '\\"')}"`,
            {
                cwd: __dirname,
                timeout: 60000,
                stdio: 'pipe'
            }
        );
        success += batch.length;
        console.log(`  ✓ Batch complete (${success} total)`);
    } catch (err) {
        console.log(`  ✗ Batch failed, trying individually...`);

        // Try each statement individually
        for (const stmt of batch) {
            try {
                execSync(
                    `npx wrangler d1 execute LOCKSMITH_DB --remote --command "${stmt.replace(/"/g, '\\"')}"`,
                    {
                        cwd: __dirname,
                        timeout: 30000,
                        stdio: 'pipe'
                    }
                );
                success++;
            } catch (e) {
                failed++;
                console.log(`    Failed: ${stmt.substring(0, 60)}...`);
            }
        }
    }
}

console.log(`\n✅ Complete: ${success} succeeded, ${failed} failed`);
