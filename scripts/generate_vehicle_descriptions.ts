#!/usr/bin/env npx tsx
/**
 * Vehicle Description Generator
 * Generates 4-sentence AI descriptions for all vehicle make/model combinations
 * 
 * Usage: npx tsx scripts/generate_vehicle_descriptions.ts [--batch N] [--resume]
 */

import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'https://euro-keys.jeremy-samuels17.workers.dev';
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'vehicle_descriptions.json');
const PROGRESS_FILE = path.join(__dirname, '..', 'data', 'vehicle_descriptions_progress.json');
const BATCH_SIZE = 25;

// Use OpenRouter API (configured in environment)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

interface VehicleDescription {
    make: string;
    model: string;
    description: string;
    generated: string;
}

interface ProgressData {
    completed: string[]; // "make|model" keys
    lastBatch: number;
    totalVehicles: number;
}

async function fetchAllVehicles(): Promise<{ make: string, model: string }[]> {
    console.log('📋 Fetching all makes...');
    const makesRes = await fetch(`${API_BASE}/api/vyp/makes`);
    const makesData = await makesRes.json();
    const makes: string[] = makesData.makes || [];

    console.log(`   Found ${makes.length} makes`);

    const vehicles: { make: string, model: string }[] = [];

    for (const make of makes) {
        try {
            const modelsRes = await fetch(`${API_BASE}/api/vyp/models?make=${encodeURIComponent(make)}`);
            const modelsData = await modelsRes.json();
            const models: string[] = modelsData.models || [];

            for (const model of models) {
                vehicles.push({ make, model });
            }
            console.log(`   ${make}: ${models.length} models`);
        } catch (e) {
            console.error(`   ⚠️ Error fetching models for ${make}`);
        }
    }

    console.log(`\n✅ Total vehicles: ${vehicles.length}`);
    return vehicles;
}

async function generateDescriptions(vehicles: { make: string, model: string }[]): Promise<string> {
    const vehicleList = vehicles.map(v => `${v.make} ${v.model}`).join('\n');

    const prompt = `You are an automotive locksmith expert. Generate a 4-sentence description for each of these vehicles. Each description should cover:
1. General introduction to the vehicle
2. Security platform / IMMO (immobilizer) generation info
3. Key programming difficulty and tool requirements  
4. Common issues or pro tips for locksmiths

Format your response as JSON array:
[
  {"make": "Brand", "model": "Model", "description": "Sentence 1. Sentence 2. Sentence 3. Sentence 4."},
  ...
]

Be concise but informative. Focus on practical locksmith knowledge.

Vehicles:
${vehicleList}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://eurokeys.app',
        },
        body: JSON.stringify({
            model: 'google/gemini-2.0-flash-001',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4000,
        }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

function loadProgress(): ProgressData {
    if (fs.existsSync(PROGRESS_FILE)) {
        return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
    return { completed: [], lastBatch: 0, totalVehicles: 0 };
}

function saveProgress(progress: ProgressData): void {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function loadDescriptions(): Record<string, VehicleDescription> {
    if (fs.existsSync(OUTPUT_FILE)) {
        return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    }
    return {};
}

function saveDescriptions(descriptions: Record<string, VehicleDescription>): void {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(descriptions, null, 2));
}

async function main() {
    const args = process.argv.slice(2);
    const resumeMode = args.includes('--resume');
    const batchArg = args.findIndex(a => a === '--batch');
    const specificBatch = batchArg >= 0 ? parseInt(args[batchArg + 1]) : null;

    if (!OPENROUTER_API_KEY) {
        console.error('❌ OPENROUTER_API_KEY environment variable required');
        process.exit(1);
    }

    // Fetch all vehicles
    const allVehicles = await fetchAllVehicles();

    // Load existing progress
    let progress = loadProgress();
    let descriptions = loadDescriptions();

    if (!resumeMode) {
        progress = { completed: [], lastBatch: 0, totalVehicles: allVehicles.length };
    }

    // Filter out already completed vehicles
    const pendingVehicles = allVehicles.filter(v =>
        !progress.completed.includes(`${v.make}|${v.model}`)
    );

    console.log(`\n📊 Status: ${progress.completed.length}/${allVehicles.length} completed`);
    console.log(`   Remaining: ${pendingVehicles.length} vehicles`);

    // Calculate batches
    const totalBatches = Math.ceil(pendingVehicles.length / BATCH_SIZE);
    const startBatch = specificBatch !== null ? specificBatch : 0;
    const endBatch = specificBatch !== null ? specificBatch + 1 : totalBatches;

    console.log(`   Batches to process: ${startBatch} to ${endBatch - 1} (of ${totalBatches})\n`);

    for (let i = startBatch; i < endBatch; i++) {
        const batchStart = i * BATCH_SIZE;
        const batchEnd = Math.min(batchStart + BATCH_SIZE, pendingVehicles.length);
        const batchVehicles = pendingVehicles.slice(batchStart, batchEnd);

        if (batchVehicles.length === 0) break;

        console.log(`\n🔄 Processing batch ${i + 1}/${totalBatches} (${batchVehicles.length} vehicles)...`);
        console.log(`   Vehicles: ${batchVehicles.map(v => `${v.make} ${v.model}`).slice(0, 5).join(', ')}...`);

        try {
            const response = await generateDescriptions(batchVehicles);

            // Parse JSON response (handle markdown code blocks)
            let jsonStr = response;
            if (response.includes('```')) {
                const match = response.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (match) jsonStr = match[1];
            }

            const generated: VehicleDescription[] = JSON.parse(jsonStr);

            // Save each description
            for (const desc of generated) {
                const key = `${desc.make}|${desc.model}`;
                descriptions[key] = {
                    ...desc,
                    generated: new Date().toISOString().split('T')[0],
                };
                progress.completed.push(key);
            }

            progress.lastBatch = i;
            saveProgress(progress);
            saveDescriptions(descriptions);

            console.log(`   ✅ Saved ${generated.length} descriptions`);

            // Rate limit delay
            if (i < endBatch - 1) {
                console.log('   ⏳ Waiting 2s before next batch...');
                await new Promise(r => setTimeout(r, 2000));
            }

        } catch (error) {
            console.error(`   ❌ Error in batch ${i}:`, error);
            saveProgress(progress);
            saveDescriptions(descriptions);
            console.log('   Progress saved. Resume with --resume flag.');
            process.exit(1);
        }
    }

    console.log(`\n🎉 Complete! Generated ${Object.keys(descriptions).length} descriptions.`);
    console.log(`   Output: ${OUTPUT_FILE}`);
}

main().catch(console.error);
