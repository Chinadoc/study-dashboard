const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../index.html');
const content = fs.readFileSync(indexPath, 'utf8');

const regex = /const VIDEO_TUTORIALS = (\[[\s\S]*?\]);/;
const match = content.match(regex);

if (!match) {
    console.error('VIDEO_TUTORIALS not found');
    process.exit(1);
}

const videos = eval(match[1]);

let sql = '';
videos.forEach(v => {
    const id = v.id.replace(/'/g, "''");
    const videoId = v.videoId.replace(/'/g, "''");
    const title = v.title.replace(/'/g, "''");
    const desc = v.desc.replace(/'/g, "''");
    const category = v.category.replace(/'/g, "''");
    const tool = v.tool.replace(/'/g, "''");
    const difficulty = v.difficulty.replace(/'/g, "''");
    const make = v.makes ? v.makes[0].replace(/'/g, "''") : null;
    const model = v.models ? v.models[0].replace(/'/g, "''") : null;

    let yearStart = null;
    let yearEnd = null;
    if (v.years) {
        const parts = v.years.split('-');
        if (parts.length === 2) {
            yearStart = parseInt(parts[0]);
            yearEnd = parseInt(parts[1]);
        } else if (parts.length === 1) {
            yearStart = parseInt(parts[0]);
            yearEnd = parseInt(parts[0]);
        }
    }

    sql += `INSERT OR REPLACE INTO video_tutorials (id, video_id, title, description, category, tool, difficulty, related_make, related_model, related_year_start, related_year_end) VALUES ('${id}', '${videoId}', '${title}', '${desc}', '${category}', '${tool}', '${difficulty}', ${make ? `'${make}'` : 'NULL'}, ${model ? `'${model}'` : 'NULL'}, ${yearStart || 'NULL'}, ${yearEnd || 'NULL'});\n`;
});

fs.writeFileSync(path.join(__dirname, '../api/migrations/0004_seed_videos.sql'), sql);
console.log('Migration file created');
