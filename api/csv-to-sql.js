#!/usr/bin/env node
// Script to convert CSV to SQL INSERT statements for D1
const fs = require('fs');
const path = require('path');

// Use the expanded file with more data
const csvPath = path.join(__dirname, '..', 'data', 'master_locksmith_expanded_fcc_imm.csv');
const outputPath = path.join(__dirname, 'data.sql');

const csv = fs.readFileSync(csvPath, 'utf-8');
const lines = csv.split(/\r?\n/);
const headerLine = lines[0];
const headers = [];

// Parse header with quote handling
let current = '';
let inQuotes = false;
for (let i = 0; i < headerLine.length; i++) {
    const ch = headerLine[i];
    if (ch === '"') {
        inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
        headers.push(current.trim());
        current = '';
    } else {
        current += ch;
    }
}
headers.push(current.trim());

function parseRow(line) {
    const parts = [];
    let curr = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQ && line[i + 1] === '"') {
                curr += '"';
                i++;
            } else {
                inQ = !inQ;
            }
        } else if (ch === ',' && !inQ) {
            parts.push(curr);
            curr = '';
        } else {
            curr += ch;
        }
    }
    parts.push(curr);
    return parts;
}

function escapeSQL(val) {
    if (val === undefined || val === null || val === '') return 'NULL';
    return "'" + val.replace(/'/g, "''") + "'";
}

const output = [];
// No BEGIN TRANSACTION - D1 doesn't support it in batch files

let count = 0;
for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = parseRow(line);
    const values = headers.map((h, idx) => {
        const val = parts[idx] || '';
        // Handle numeric fields
        if (h === 'year' || h === 'buttons' || h === 'compat_year_min' || h === 'compat_year_max') {
            const num = parseInt(val, 10);
            return isNaN(num) ? 'NULL' : num;
        }
        if (h === 'frequency_mhz') {
            const num = parseFloat(val);
            return isNaN(num) ? 'NULL' : num;
        }
        return escapeSQL(val);
    });

    output.push(`INSERT INTO locksmith_data (${headers.join(',')}) VALUES (${values.join(',')});`);
    count++;
}

fs.writeFileSync(outputPath, output.join('\n'));
console.log(`Generated ${count} INSERT statements to ${outputPath}`);
