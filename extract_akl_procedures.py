#!/usr/bin/env python3
"""
Script to extract All Keys Lost (AKL) procedures from HTML files
and organize them by vehicle/year/model/tool
"""

import os
import re
import json
from bs4 import BeautifulSoup
from pathlib import Path

def extract_akl_content(html_file):
    """Extract AKL-related content from an HTML file"""
    try:
        with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        soup = BeautifulSoup(content, 'html.parser')

        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()

        # Get text content
        text = soup.get_text()

        # Extract vehicle info from filename
        filename = os.path.basename(html_file)
        vehicle_info = extract_vehicle_info(filename)

        # Find AKL-related sections
        akl_patterns = [
            r'all keys lost.*?(?=all keys lost|$)',
            r'AKL.*?(?=AKL|$)',
            r'lost.*key.*procedure.*?(?=lost.*key.*procedure|$)',
            r'key.*lost.*procedure.*?(?=key.*lost.*procedure|$)',
            r'immobilizer.*bypass.*?(?=immobilizer.*bypass|$)',
            r'security.*gateway.*bypass.*?(?=security.*gateway.*bypass|$)',
            r'emergency.*key.*programming.*?(?=emergency.*key.*programming|$)',
            r'backup.*key.*programming.*?(?=backup.*key.*programming|$)',
            r'no.*key.*available.*?(?=no.*key.*available|$)',
        ]

        akl_sections = []

        for pattern in akl_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
            for match in matches:
                if len(match.strip()) > 50:  # Only include substantial content
                    akl_sections.append({
                        'vehicle': vehicle_info,
                        'filename': filename,
                        'pattern': pattern,
                        'content': match.strip(),
                        'tool_mentions': extract_tools(match),
                        'year_range': extract_year_range(match, vehicle_info)
                    })

        return akl_sections

    except Exception as e:
        print(f"Error processing {html_file}: {e}")
        return []

def extract_vehicle_info(filename):
    """Extract vehicle information from filename"""
    # Remove .html extension
    name = filename.replace('.html', '')

    # Extract make/model/year info
    patterns = [
        r'(\d{4})_(.+)_(.+)',  # 2020_Toyota_Camry
        r'(.+)_(\d{4})_(.+)',  # Toyota_2020_Camry
        r'(\d{4})_(.+)',       # 2020_Camry
        r'(.+)_(.+)_(\d{4})',  # Toyota_Camry_2020
    ]

    for pattern in patterns:
        match = re.search(pattern, name, re.IGNORECASE)
        if match:
            groups = match.groups()
            if len(groups) == 3:
                return {
                    'year': groups[0] if groups[0].isdigit() else (groups[2] if groups[2].isdigit() else None),
                    'make': groups[1] if not groups[1].isdigit() else groups[0],
                    'model': groups[2] if not groups[2].isdigit() else groups[1]
                }
            elif len(groups) == 2:
                return {
                    'year': groups[0] if groups[0].isdigit() else None,
                    'make': groups[1] if not groups[0].isdigit() else groups[0],
                    'model': groups[1] if groups[0].isdigit() else None
                }

    # Fallback: split by underscores and try to identify components
    parts = name.split('_')
    vehicle_info = {'make': None, 'model': None, 'year': None}

    for part in parts:
        if part.isdigit() and len(part) == 4 and 2000 <= int(part) <= 2030:
            vehicle_info['year'] = part
        elif part.lower() in ['toyota', 'honda', 'ford', 'chevrolet', 'bmw', 'mercedes', 'audi', 'vw', 'nissan', 'subaru', 'mazda', 'kia', 'hyundai', 'jeep', 'chrysler', 'dodge', 'ram', 'gmc', 'lincoln', 'lexus', 'acura', 'infiniti', 'volvo', 'jaguar', 'land rover', 'porsche', 'mini', 'tesla', 'rivian']:
            vehicle_info['make'] = part
        else:
            if not vehicle_info['model']:
                vehicle_info['model'] = part

    return vehicle_info

def extract_tools(content):
    """Extract tool mentions from content"""
    tools = []

    tool_patterns = [
        r'(Autel|Launch|Xtool|Foxwell|Snap-on|Matco|OBDStar|CGDI|VXDIAG|Lonsdor|AD100Pro|Yanhua|Orange5|VVDI|Carprog|Tango|Keyline|JMA|Silca|Ilco|Strattec|GM MDI|Ford IDS|Toyota Techstream|Honda HDS|BMW ISTA|Mercedes DAS|VW ODIS)',
        r'([A-Z]{2,4}\d{3,4})',  # Tool model numbers like MDI100, VXDIAG, etc.
        r'(\w+ \w+ \w+)',      # Three word tool names
    ]

    for pattern in tool_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        tools.extend(matches)

    # Remove duplicates and clean
    tools = list(set([tool.strip() for tool in tools if len(tool.strip()) > 2]))

    return tools

def extract_year_range(content, vehicle_info):
    """Extract year range from content"""
    years = []

    # Find all 4-digit years between 2000-2030
    year_matches = re.findall(r'\b(20\d{2})\b', content)
    years.extend([int(y) for y in year_matches if 2000 <= int(y) <= 2030])

    # Also check for ranges like 2018-2022
    range_matches = re.findall(r'\b(20\d{2})-(20\d{2})\b', content)
    for start, end in range_matches:
        start_year = int(start)
        end_year = int(end)
        if 2000 <= start_year <= 2030 and 2000 <= end_year <= 2030:
            years.extend(list(range(start_year, end_year + 1)))

    if years:
        return {'min': min(years), 'max': max(years)}
    elif vehicle_info.get('year'):
        return {'min': int(vehicle_info['year']), 'max': int(vehicle_info['year'])}

    return None

def main():
    """Main processing function"""
    html_dir = Path('gdrive_exports/html')
    output_file = Path('all_keys_lost_procedures.json')

    if not html_dir.exists():
        print(f"Directory {html_dir} not found!")
        return

    all_akl_data = []

    # List of files with AKL content (from our previous search)
    akl_files = [
        '4th_Gen_Tacoma_Locksmith_Intelligence.html',
        '2024_Silverado_AKL_Locksmith_Guide.html',
        'Copy_of_2019_Sierra_1500_Locksmith_Intelligence.html',
        '2019_Sierra_1500_Locksmith_Intelligence.html',
        'Copy_of_2019_Ram_DT_Locksmith_Intelligence_Report.html',
        '2019_Ram_DT_Locksmith_Intelligence_Report.html',
        'RAM_1500_DT_Key_Programming_Compendium.html',
        'GM_T1XX_Platform_Key_Programming_Dossier.html',
        'Copy_of_GM_T1XX_Platform_Key_Programming_Dossier.html',
        'GM_Global_B_Key_Programming_Research.html',
        'GM_Global_B_Chip___CAN_FD.html',
        'GM_Global_A_B_Architecture_Transition_Research.html',
        'GM_Global_A_B_Architecture_Transition_Research.html',
        'Toyota_Lexus_Key_System_Dossier.html',
        'Toyota-Lexus_Smart_Key_Reference_Guide.html',
        'Toyota-Lexus_Security_Evolution_Data.html',
        'Toyota_Lexus_Security_Evolution_Data.html',
        'TNGA-F_Locksmith_Dossier.html',
        'TNGA-K_Platform_Key_Programming_Dossier.html',
        '2022_Tundra_Locksmith_Deep_Dive.html',
        '2020_Toyota_Highlander_Locksmith_Guide.html',
        'Copy_of_2020_Toyota_Highlander_Locksmith_Guide.html',
        '2019_Camry_Locksmith_Programming_Guide.html',
        'Copy_of_2019_Camry_Locksmith_Programming_Guide.html',
        'Toyota_Grand_Highlander_Locksmith_Report.html',
        'Honda_Acura_Global_Platform_Key_Dossier.html',
        'Copy_of_Honda-Acura_Global_Platform_Key_Dossier.html',
        'Honda_Civic_Accord_Locksmith_Dossier.html',
        'Copy_of_Honda_Civic-Accord_Locksmith_Dossier.html',
        'Honda_Civic_Key_System_Reference.html',
        'Honda_BSI_Key_Programming_Challenges.html',
        'Honda_11th_Gen_Key_Chip_Research.html',
        '2020_Honda_CR-V_Locksmith_Report.html',
        'Ford_Super_Duty_Locksmith_Dossier.html',
        'Copy_of_Ford_Super_Duty_Locksmith_Dossier.html',
        'Ford_CD6_Platform_Security_Dossier.html',
        'Ford_BCM_Security_Bypass_Research.html',
        'Ford_BCM_Security_Bypass_Analysis.html',
        '2021_F-150_CAN_FD_Locksmith_Research.html',
        '2020_Ford_Explorer_Locksmith_Research.html',
        '2018_Ford_Expedition_Locksmith_Research.html',
        'Ford_PATS_Locksmith_Intelligence_Database.html',
        'Ford_Commercial_Compact_Platform_Dossier.html',
        'Ford_Commercial-Compact_Platform_Dossier.html',
        'Ford_Escape_Locksmith_Research_Request.html',
        'Ford_Maverick_Locksmith_Research.html',
        'Ford_Mustang_Mach-E_Locksmith_Research.html',
        'BMW_F-G_Series_Locksmith_Intelligence.html',
        'BMW_CAS_vs_FEM_BDC_Architecture_Research.html',
        'BMW_CAS_vs_FEM-BDC_Architecture_Research.html',
        'BMW_Locksmith_Guide_Development.html',
        'BMW_X5_G05_Locksmith_Dossier.html',
        'BMW_G-Series_Locksmith_Intelligence_Document.html',
        'Mercedes_FBS4_Locksmith_Intelligence_Document.html',
        'Mercedes_FBS4_Workarounds___Business.html',
        'Mercedes_FBS4_Workarounds__Business.html',
        'Mercedes_FBS4_Aftermarket_Workarounds.html',
        'Mercedes_Locksmith_Comprehensive_Guide.html',
        'Mercedes_W167_Locksmith_Intelligence_Dossier.html',
        'Mercedes-Benz_Key_Programming_Database.html',
        'Audi_Q7_Locksmith_Intelligence_Dossier.html',
        'Copy_of_Audi_Q7_Locksmith_Intelligence_Dossier.html',
        'Audi_Q7_Q8_Locksmith_Guide_Research.html',
        'Audi_Q7-Q8_Locksmith_Guide_Research.html',
        'Audi_MQB-Evo_Security_Deep_Dive.html',
        'VAG_MLB-EVO_Key_Programming_Dossier.html',
        'Copy_of_VAG_MLB-EVO_Key_Programming_Dossier.html',
        'VAG_MQB_vs._MQB-Evo_Security.html',
        'VAG_MQB_vs._MQB-Evo_Key_Programming.html',
        'VW_MQB_Key_Programming_Dossier.html',
        'Copy_of_VW_MQB_Key_Programming_Dossier.html',
        'VW_Atlas_Key_Forensics_Dossier.html',
        'Copy_of_VW_Atlas_Key_Forensics_Dossier.html',
        'VAG_Security_Bypass_Research_Matrix.html',
        'Nissan_Locksmith_Research_Dossier.html',
        'Copy_of_Nissan_Locksmith_Research_Dossier.html',
        'Nissan_Locksmith_Programming_Guide.html',
        'Nissan_Gateway_Bypass_Research_Goals.html',
        'Nissan_Rogue_Key_Programming_Differences.html',
        'Copy_of_Nissan_Rogue_Key_Programming_Differences.html',
        'Nissan_Rogue_T32_Locksmith_Intelligence.html',
        'Copy_of_Nissan_Rogue_T32_Locksmith_Intelligence.html',
        'Nissan-Infiniti_Security_Gateway_Locksmith_Guide.html',
        'Infiniti_Locksmith_Intelligence_Dossier.html',
        'Subaru_Key_Programming_Guide_2016-2026.html',
        'Subaru_Security_Gateway___Key_Programming.html',
        'Subaru_Security_Gateway__Key_Programming.html',
        'Subaru_SGW_Locksmith_Guide.html',
        '2020_Subaru_Outback_Locksmith_Intelligence.html',
        'Copy_of_2020_Subaru_Outback_Locksmith_Intelligence.html',
        'Mazda_Key_Programming_Research_Data.html',
        'Mazda_Locksmith_Intelligence_Document.html',
        'Mazda_Locksmith_Master_Guide.html',
        'Mazda_CX-5_Key_System_Dossier.html',
        'Kia_Hyundai_N3_Platform_Key_Programming.html',
        'Kia-Hyundai_N3_Platform_Key_Programming.html',
        'Kia_Hyundai_Security_Architecture_Update.html',
        'Kia-Hyundai_Security_Architecture_Update.html',
        'Kia_Hyundai_Security_Update_Research.html',
        'Kia-Hyundai_Security_Update_Research.html',
        'Kia_Hyundai_Security_Update_Guide.html',
        'Kia-Hyundai_Security_Crisis_Locksmith_Guide.html',
        'Kia_Telluride_Security_Update_Report.html',
        'Copy_of_Kia_Telluride_Security_Update_Report.html',
        'Hyundai-Kia_N3_Locksmith_Dossier.html',
        'Genesis_GV70_Locksmith_Intelligence_Dossier.html',
        'Copy_of_Genesis_GV70_Locksmith_Intelligence_Dossier.html',
        'Lincoln_Locksmith_Intelligence_Document.html',
        'Locksmith_Dossiers-_Lincoln__Genesis_Security.html',
        'Jeep_Wrangler_Gladiator_Locksmith_Dossier.html',
        'Copy_of_Jeep_Wrangler-Gladiator_Locksmith_Dossier.html',
        'Jeep_Wrangler-Gladiator_Locksmith_Dossier.html',
        'Jeep_Grand_Cherokee_L_Locksmith_Intelligence.html',
        'Jeep_JL-JT_Locksmith_Intelligence_Document.html',
        'Jeep_Renegade_Hornet_Key_Programming_Issue.html',
        'Jeep_Renegade-Hornet_Key_Programming_Issue.html',
        'jeep_gladiator_2020_2024.html',
        'Chrysler_Locksmith_Guide_Creation.html',
        'Stellantis_DS-LA_Locksmith_Dossier.html',
        'Stellantis_RF_Hub_Dossier___Programming.html',
        'Stellantis_RF_Hub_Dossier__Programming.html',
        'Stellantis_RF_Hub___Fobik_Programming.html',
        'Stellantis_RF_Hub__Fobik_Programming.html',
        'Stellantis_FCC_ID_VIN_Pre-coding_Research.html',
        'Stellantis_Minivan_Key_Programming_Dossier.html',
        'Copy_of_Stellantis_Minivan_Key_Programming_Dossier.html',
        'Stellantis_SGW_Mastery_Guide.html',
        'Stellantis_SGW_Systems_Reference_Guide.html',
        'Dodge_Charger_Challenger_Locksmith_Dossier.html',
        'Dodge_Charger-Challenger_Locksmith_Dossier.html',
        'Dodge_Challenger_Locksmith_Guide_Research.html',
        'dodge_ram_1500_2019_2024.html',
        'GM_E2XX_Key_Programming_Dossier.html',
        'Copy_of_GM_E2XX_Key_Programming_Dossier.html',
        'GM_Truck-SUV_Locksmith_Reference_Guide.html',
        'GM_Ultium_EV_Locksmith_Dossier.html',
        '2018_Camaro_Key_Data_Research.html',
        '2018_Camaro_Locksmith_Cheat_Sheet.html',
        '2019_Chevrolet_Blazer_Locksmith_Report.html',
        '2020_Chevrolet_Traverse_Locksmith_Report.html',
        'Copy_of_2020_Chevrolet_Traverse_Locksmith_Report.html',
        '2020_Equinox_Locksmith_Intelligence_Report.html',
        '2020_Escalade_Locksmith_Intelligence_Dossier.html',
        'Copy_of_2020_Escalade_Locksmith_Intelligence_Dossier.html',
        '2021_Silverado_Locksmith_Programming_Guide.html',
        'Copy_of_2021_Silverado_Locksmith_Programming_Guide.html',
        '2024_Silverado_Key_Programming_Guide.html',
        '2024_Silverado_Key_Programming_Research.html',
        'GMC-Cadillac_Locksmith_Intelligence_Document.html',
        'Lexus_RX_350_Locksmith_Intelligence_Dossier.html',
        'Copy_of_Lexus_RX_350_Locksmith_Intelligence_Dossier.html',
        'Acura_Locksmith_Intelligence_Document.html',
        'Honda_Locksmith_Intelligence_Document.html',
        'Alfa_Romeo_Giorgio_Platform_Dossier.html',
        'Copy_of_Alfa_Romeo_Giorgio_Platform_Dossier.html',
        'Alfa_Romeo_Locksmith_Intelligence_Document.html',
        'Asian_Luxury_Locksmith_Intelligence_Document.html',
        'JLR_L494_Locksmith_Intelligence_Dossier.html',
        'JLR_Security_Architecture_Deep_Dive.html',
        'JLR_Security_System_Evolution_Research.html',
        'Jaguar_Key_System_Dossier.html',
        'Land_Rover_Locksmith_Intelligence_Document.html',
        'Porsche_Locksmith_Intelligence_Document.html',
        'Porsche_Security___Immobilizer_Research.html',
        'Porsche_Security__Immobilizer_Research.html',
        'Volvo_Locksmith_Survival_Guide.html',
        'Volvo_Locksmith_Guide_Development_Plan.html',
        'Volvo_Locksmith_Master_Document_Creation.html',
        'Volvo_XC90_Key_System_Dossier.html',
        'Tesla_Locksmith_Dossier_Analysis.html',
        'Copy_of_Tesla_Locksmith_Dossier_Analysis.html',
        'Tesla_Locksmith_Intelligence_Document.html',
        'Rivian_Locksmith_Dossier_Research.html',
        'EV_Truck_Locksmith_Dossier.html',
        'EV_Locksmith_Feasibility_Dossier.html',
        'Mitsubishi_Outlander_Alliance_Key_Research.html',
        'Copy_of_Mitsubishi_Outlander_Alliance_Key_Research.html',
        'Mitsubishi_Locksmith_Intelligence_Document.html',
        'Bronco_Alarm_System_Research.html',
        'Locksmith_Guide-_CAN-Bus_Transition_Era.html',
        'European_Locksmith_Reference_2000-2010.html',
        'European_Luxury_Key_Programming_Gap.html',
        'Commercial_Fleet_Locksmith_Guide.html',
        'PHEV_Locksmith_Guide-_Manufacturers__Safety.html',
        'Locksmith_Tool_Vehicle_Coverage.html',
        'Automotive_Key_Programming_Database_Research.html',
        'Automotive_Key_Data_Database_Creation.html',
        'Automotive_Transponder_Chip_Database.html',
        'Universal_Remote_Key_Cross-Reference.html',
        'VIN-Coded_Key_Requirements_Research.html',
        'Vehicle_SGW_Access_and_Key_Programming.html',
        'Vehicle_Secure_Gateway_Module_Research.html',
        'Key_Fob_Research_Mapping_Project.html',
        'toyota_venza_2009_2015.html',
        'toyota_venza_2021_2024.html',
        'toyota_tundra_2008_2018.html',
        'toyota_sequoia_2008_2019.html',
        'toyota_prado_2010_2024.html',
        'toyota_prius_2016_2022.html',
        'toyota_mirai_2016_2020.html',
        'toyota_matrix_2009_2013.html',
        'toyota_camry_2018_2024.html',
        'toyota_avalon_2007_2012.html',
        'toyota_avalon_2013_2018.html',
        'nissan_rogue_2014_2017_widowmaker.html',
        'honda_civic_2016_2021.html',
        'ford_f_150_2015_2020.html',
        'chevrolet_silverado_2014_2018.html',
        'bmw_1_series_2008_2014.html',
        'bmw_3_series__e90____5_series__e60__2005_2013.html',
        'bmw_5_series__f10__2012_2017.html',
        'hyundai_sonata_2015_2019.html',
        'acura_mdx_2014_2018.html',
        'acura_tlx_2015_2018.html',
        'Aftermarket_Access__VAG_SFD2__BMW_iDrive.html',
        'Aftermarket_Access-_VAG_SFD2_BMW_iDrive.html',
        'Copy_of_2022_Tundra_Locksmith_Deep_Dive.html',
        'Start_research.html'
    ]

    processed_count = 0

    for filename in akl_files:
        file_path = html_dir / filename
        if file_path.exists():
            print(f"Processing {filename}...")
            akl_sections = extract_akl_content(file_path)
            all_akl_data.extend(akl_sections)
            processed_count += 1

            if processed_count % 20 == 0:
                print(f"Processed {processed_count} files, found {len(all_akl_data)} AKL sections so far...")

    # Remove duplicates and organize by vehicle
    organized_data = {}

    for item in all_akl_data:
        vehicle_key = f"{item['vehicle'].get('year', 'Unknown')}_{item['vehicle'].get('make', 'Unknown')}_{item['vehicle'].get('model', 'Unknown')}"

        if vehicle_key not in organized_data:
            organized_data[vehicle_key] = {
                'vehicle_info': item['vehicle'],
                'procedures': []
            }

        # Check for duplicate content
        is_duplicate = False
        for existing in organized_data[vehicle_key]['procedures']:
            if existing['content'] == item['content']:
                is_duplicate = True
                break

        if not is_duplicate:
            organized_data[vehicle_key]['procedures'].append({
                'source_file': item['filename'],
                'content': item['content'],
                'tools': item['tool_mentions'],
                'year_range': item['year_range'],
                'pattern_used': item['pattern']
            })

    # Save to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(organized_data, f, indent=2, ensure_ascii=False)

    print(f"\nCompleted! Processed {processed_count} files.")
    print(f"Found AKL procedures for {len(organized_data)} different vehicle types.")
    print(f"Data saved to {output_file}")

if __name__ == '__main__':
    main()


