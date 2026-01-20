import asyncio
import os
import random
import sys
import subprocess
from datetime import datetime

# Check for playwright
try:
    from playwright.async_api import async_playwright
except ImportError:
    print("❌ Playwright not found. Please run: pip install playwright")
    sys.exit(1)

# Configuration
USER_DATA_DIR = os.path.expanduser("~/Library/Application Support/Google/Chrome") # Mac Chrome default
GEMINI_URL = "https://gemini.google.com/app"
RESEARCH_QUEUE = [
    # --- FORD (10) ---
    ("2021", "Ford", "F-150", "Gen 14 (Can FD)"),
    ("2021", "Ford", "Bronco", "Full Size - Active Alarm Issues"),
    ("2020", "Ford", "Explorer", "CD6 Platform - Key Count"),
    ("2020", "Ford", "Escape", "C2 Platform"),
    ("2022", "Ford", "Maverick", "Add Key vs AKL"),
    ("2021", "Ford", "Mustang Mach-E", "EV procedures"),
    ("2018", "Ford", "Expedition", "U553"),
    ("2020", "Ford", "Transit", "Keyless vs Bladed"),
    ("2018", "Ford", "EcoSport", "Transponder type"),
    ("2020", "Ford", "Ranger", "T6 Platform"),

    # --- TOYOTA (10) ---
    ("2022", "Toyota", "Tundra", "i-Force Max Hybrid & 30-pin"),
    ("2023", "Toyota", "Sequoia", "Hybrid Smart Key"),
    ("2019", "Toyota", "RAV4", "XA50 Smart Key"),
    ("2018", "Toyota", "Camry", "XV70 Rolling Code"),
    ("2020", "Toyota", "Highlander", "XU70 Smart Key"),
    ("2020", "Toyota", "Corolla", "E210 Smart Key"),
    ("2021", "Toyota", "Sienna", "Hybrid only"),
    ("2021", "Toyota", "Venza", "Reintroduced Hybrid"),
    ("2022", "Toyota", "GR86", "Subaru BRZ twin"),
    ("2023", "Toyota", "Crown", "Crossover style"),

    # --- HONDA/ACURA (8) ---
    ("2022", "Honda", "Civic", "FE/FL Gen 11 - Can FD?"),
    ("2023", "Honda", "CR-V", "Gen 6"),
    ("2023", "Honda", "Pilot", "Gen 4"),
    ("2023", "Honda", "Accord", "Gen 11"),
    ("2022", "Honda", "HR-V", "Gen 3 (US spec)"),
    ("2021", "Acura", "TLX", "Gen 2"),
    ("2022", "Acura", "MDX", "Gen 4"),
    ("2023", "Acura", "Integra", "DE4"),

    # --- GM (10) ---
    ("2020", "Chevrolet", "Corvette", "C8 - Can FD"),
    ("2021", "Chevrolet", "Tahoe", "Global B Architecture"),
    ("2019", "Chevrolet", "Silverado", "1500 - Global A vs B ID"),
    ("2024", "Chevrolet", "Trax", "New Gen"),
    ("2020", "Chevrolet", "Blazer", "Crossover"),
    ("2021", "Chevrolet", "Trailblazer", "Small SUV"),
    ("2020", "Buick", "Encore GX", "New Platform"),
    ("2023", "Chevrolet", "Colorado", "New Gen"),
    ("2022", "Chevrolet", "Bolt EV", "EUV included"),
    ("2022", "GMC", "Hummer EV", "EV Platform"),

    # --- STELLANTIS (8) ---
    ("2018", "Jeep", "Wrangler", "JL - SGW Bypass"),
    ("2020", "Jeep", "Gladiator", "JT - SGW"),
    ("2022", "Jeep", "Grand Cherokee", "WL Chassis - RF Hub Lockdown"),
    ("2022", "Jeep", "Wagoneer", "WS - Firewalled"),
    ("2019", "Ram", "1500", "DT Chassis (New Body)"),
    ("2021", "Chrysler", "Pacifica", "SGW Locations"),
    ("2023", "Dodge", "Hornet", "Alfa Romeo Tonale twin"),
    ("2020", "Jeep", "Renegade", "SGW Bypass"),

    # --- HYUNDAI/KIA (10) ---
    ("2022", "Hyundai", "Ioniq 5", "E-GMP Platform"),
    ("2022", "Kia", "EV6", "E-GMP Platform"),
    ("2021", "Hyundai", "Elantra", "CN7 - 8A Smart Key"),
    ("2020", "Hyundai", "Sonata", "DN8 - Remote Park Assist"),
    ("2021", "Kia", "Sorento", "MQ4"),
    ("2022", "Kia", "Sportage", "NQ5"),
    ("2020", "Kia", "Telluride", "ON - Smart Key programming"),
    ("2020", "Hyundai", "Palisade", "LX2"),
    ("2022", "Hyundai", "Tucson", "NX4"),
    ("2022", "Hyundai", "Santa Cruz", "Pickup"),

    # --- NISSAN (6) ---
    ("2022", "Nissan", "Pathfinder", "R53 - 22-digit Pin"),
    ("2021", "Nissan", "Rogue", "T33 - New BCM rules"),
    ("2020", "Nissan", "Sentra", "B18 - 22-digit Pin"),
    ("2020", "Nissan", "Versa", "N18 - Push to Start"),
    ("2022", "Nissan", "Frontier", "D41 - New Gen"),
    ("2023", "Nissan", "Ariya", "EV Platform"),

    # --- EUROPEAN (10) ---
    ("2019", "BMW", "3-Series", "G20 - BDC3"),
    ("2019", "BMW", "X5", "G05 - BDC3"),
    ("2020", "Audi", "Q7", "4M Facelift - SFD Protection"),
    ("2021", "Audi", "A3", "8Y - SFD"),
    ("2022", "Volkswagen", "Golf", "Mk8 - SFD"),
    ("2021", "Volkswagen", "ID.4", "MEB Platform"),
    ("2019", "Mercedes", "Sprinter", "VS30 - FBS4"),
    ("2016", "Volvo", "XC90", "SPA Platform - AKL Procedures"),
    ("2020", "Land Rover", "Defender", "L663 - PEPS UWB"),
    ("2019", "Porsche", "Macan", "Facelift - BCM2 Encrypted"),
]

PROMPT_TEMPLATE_PATH = "research_pearl_prompt.md"

async def read_prompt_template():
    if not os.path.exists(PROMPT_TEMPLATE_PATH):
        print(f"❌ Prompt template not found at {PROMPT_TEMPLATE_PATH}")
        return None
    with open(PROMPT_TEMPLATE_PATH, "r") as f:
        return f.read()

async def run_automation():
    print("🚀 Starting Gemini Night Shift Automation...")
    
    prompt_base = await read_prompt_template()
    if not prompt_base:
        return

    async with async_playwright() as p:
        # Launch Chrome with user profile to retain login
        # Note: User must close their actual Chrome window first!
        try:
            browser = await p.chromium.launch_persistent_context(
                user_data_dir=USER_DATA_DIR,
                channel="chrome",
                headless=False, # VISIBLE MODE for debugging
                args=[
                    "--start-maximized"
                ]
            )
        except Exception as e:
            print(f"❌ Could not open Chrome. Make sure your Chrome browser is CLOSED.")
            print(f"Error: {e}")
            return

        # CHECKPOINT: Give user time to log in if needed
        page = await browser.new_page()
        await page.goto(GEMINI_URL)
        print("\n⚠️  BROWSER CHECK:")
        print("    1. Chrome should have opened.")
        print("    2. Check if you are logged into Gemini.")
        print("    3. If not, LOG IN MANUALLY now.")
        print("    ⏳ Waiting 45 seconds for you to verify login...")
        await asyncio.sleep(45)
        print("    ✅ Assuming you are logged in. Starting research loop...")
        await page.close()

        for vehicle in RESEARCH_QUEUE:  # FULL MODE: Process all 72 vehicles
            year, make, model, note = vehicle
            vehicle_name = f"{year} {make} {model}"
            print(f"\n🔍 Researching: {vehicle_name}...")
            
            # Open a fresh tab for each vehicle to ensure clean session state
            context = await browser.new_context()
            page = await context.new_page()

            # 1. Prepare Prompt
            # We construct a specific focus instruction based on the "note" in the queue
            focus_text = f"Specifically focus on: {note}." if note else "Focus on key programming, immobilizer systems, and known issues."
            
            prompt_text = prompt_base \
                .replace("[YEAR]", year) \
                .replace("[MAKE]", make) \
                .replace("[MODEL]", model) \
                .replace("[FOCUS_AREA]", focus_text)
            
            # 2. Go to Gemini
            await page.goto(GEMINI_URL)
            await page.wait_for_load_state("networkidle")

            # 2.5 Ensure New Chat & Deep Research Mode
            try:
                # Force "New Chat" - sometimes URL retains history
                new_chat_selector = "button[aria-label='New chat'], span:has-text('New chat')"
                if await page.is_visible(new_chat_selector):
                    await page.click(new_chat_selector)
                    await asyncio.sleep(2) # Wait for UI reset

                # Toggle "Deep Research" if available
                # Look for "Deep Research" toggle/button
                deep_research_selector = "button:has-text('Deep research'), span:has-text('Deep research')"
                if await page.is_visible(deep_research_selector):
                    await page.click(deep_research_selector)
                    print("   🔵 Selected 'Deep Research' mode.")
                    await asyncio.sleep(1)
            except Exception as e:
                print(f"   ⚠️ UI Navigation warning: {e}")
            
            # 3. Input Prompt (Selectors may vary, finding the contenteditable div)
            try:
                # Common Gemini input selector - rich textarea
                input_selector = "div[contenteditable='true']"
                await page.wait_for_selector(input_selector, timeout=10000)
                await page.click(input_selector)
                await page.keyboard.type(prompt_text)
                await page.keyboard.press("Enter")
                
                print("   ✅ Prompt sent. Waiting for Plan Generation...")
                
                # 3.5 Handle Deep Research Plan Approval
                # Wait for the "Start research" or "Approve" button
                try:
                    # Look for common buttons found in Deep Research flow
                    # Usually "Start research" or "I approve" or similar primary action
                    # limit to 60s wait for plan generation
                    approve_selector = "button:has-text('Start research'), button:has-text('Approve plan')" 
                    
                    await page.wait_for_selector(approve_selector, timeout=60000)
                    await page.click(approve_selector)
                    print("   👍 Plan Approved! Deep Research starting...")
                except Exception as ex:
                    print(f"   ⚠️ Could not find 'Approve Plan' button. Proceeding anyway (maybe it auto-started?): {ex}")

                # 4. WAIT for completion
                print("   ⏳ Deep Search in progress (waiting 15 mins)...")
                # In a real deep research, this takes long. We wait fixed time or poll for "Regenerate" button
                # For demo, we wait shorter, but for "Night Shift" set this high.
                await asyncio.sleep(60 * 15) # 15 Minutes
                
                # 5. Extract Response - Save to File
                # We use a simple strategy: Save the full page text content converted to Markdown (if possible) 
                # or just the raw text. Since we want "Pearl Protocol", we hope the model followed instructions.
                
                # Get all text from the chat container (heuristically)
                # Or just innerText of the body for simplicity, filtered to the last response?
                # For robustness, we will save the Full Page Text.
                page_text = await page.inner_text("body")
                
                # Create a filename
                safe_name = vehicle_name.replace(" ", "_").replace("/", "-")
                filename = os.path.join("gdrive_exports", f"{safe_name}_pearl.md")
                
                with open(filename, "w", encoding="utf-8") as f:
                    f.write(page_text)
                
                print(f"   💾 Saved research to: {filename}")
                
            except Exception as e:
                print(f"   ❌ Error interacting with Gemini: {e}")
                # Save screenshot for debugging
                safe_name = vehicle_name.replace(" ", "_").replace("/", "-")
                await page.screenshot(path=f"gdrive_exports/{safe_name}_error.png")
            
            # Close the context to clean up memory and ensure distinct session next time
            await context.close()
            continue

        print("✅ Queue complete.")
        input("Press Enter to close browser...")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_automation())
