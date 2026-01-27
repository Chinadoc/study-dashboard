---
description: Process pearl extraction batches as an agent with coordination
---

# Pearl Extraction Agent Workflow

This workflow is for processing pearl enhancement batches in parallel with other agents.

## Before Starting

1. **Check your agent assignment** in `data/pearl_extraction/agent_manifest.json`
2. **Read other agents' progress** in `data/pearl_extraction/agent_XXX_progress.json` files
3. **Claim your range** by updating your progress file to `status: "running"`

## Processing Loop

// turbo-all

### Step 1: Load Source Data
```bash
# View your assigned range
cat data/pearl_extraction/agent_manifest.json | jq '.assignments.agent_XXX'
```

### Step 2: Read Flattened Pearls
View `data/pearl_extraction/flattened_pearls.json` at your assigned index range (start_idx to end_idx).

### Step 3: Create Enhanced Batch
For each batch of ~30 pearls from your range, create:
```json
[
  {
    "index": <source_index>,
    "semantic_title": "<Make Model: Concise insight description>",
    "make": "<make>",
    "model": "<model or General>",
    "target_section": "<procedure|security|hardware|troubleshooting|tools|mechanical>",
    "is_critical": <true|false>
  }
]
```

### Step 4: Save Batch File
Write to: `data/pearl_extraction/enhanced_batch_<agent_id>_<batch_num>.json`

Example: `enhanced_batch_001_026.json` for agent 1, batch 26

### Step 5: Update Progress
```python
# Update your progress file
{
  "status": "running",
  "batches_completed": <N>,
  "pearls_enhanced": <total>,
  "current_doc": "<make>|<model>|<years>",
  "last_updated": "<timestamp>"
}
```

### Step 6: Repeat
Continue until you reach your `end_idx`.

## Section Classification Guide

| Content About | target_section |
|--------------|----------------|
| AKL/Add key steps, OBP sequence | `procedure` |
| Immo architecture, encryption, SGW | `security` |
| FCC IDs, chips, frequencies, keys | `hardware` |
| Bricking, gotchas, failures | `troubleshooting` |
| Autel/Xhorse/Lonsdor specifics | `tools` |
| Lishi, keyway, picking, cutting | `mechanical` |

## Critical Flag Rules

Mark `is_critical: true` if pearl contains:
- Brick/damage risk warnings
- Frequency mismatches (315 vs 433 MHz)
- Module unlock requirements (BCM2, RFA, etc)
- Critical timing windows
- NASTF/security bypass requirements
- Tool-specific traps

## Completion

1. Set status to `"complete"` in progress file
2. Report final pearl count
3. Run merge script to combine all agent outputs
