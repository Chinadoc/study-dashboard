import { NextRequest, NextResponse } from 'next/server';

// Required for Cloudflare Pages deployment
export const runtime = 'edge';

// Video tutorials data - extracted from dossier manifests
interface VideoTutorial {
    id: string;
    video_id: string;
    title: string;
    description: string;
    category: string;
    tool: string | null;
    related_make: string | null;
    related_model: string | null;
    related_year_start: number | null;
    related_year_end: number | null;
    source_dossier: string;
    youtube_url: string;
}

// Video data extracted from dossiers - will be served statically
const VIDEO_TUTORIALS: VideoTutorial[] = [
    {
        "id": "ce6a128fe40ef4a0",
        "video_id": "qSdFblyIh44",
        "title": "HOW TO PROGRAM A KEY FOR 2014-2018 BMW X5 ADD A KEY ALL OBD (AKL NEED ISM) USING AUTEL IM508 & X400",
        "description": "Extracted from dossier: 1Q1nJyQthmHTOCgxtX1JM0mWcwYfO9K2vJTD5cIuKS1k",
        "category": "akl",
        "tool": "Autel",
        "related_make": "BMW",
        "related_model": "X5",
        "related_year_start": 2014,
        "related_year_end": 2018,
        "source_dossier": "1Q1nJyQthmHTOCgxtX1JM0mWcwYfO9K2vJTD5cIuKS1k",
        "youtube_url": "https://www.youtube.com/watch?v=qSdFblyIh44"
    },
    {
        "id": "ef8933e8da327773",
        "video_id": "KMt9sKJTwco",
        "title": "Cadillac Escalade / CT4 / CT5 Key Fob remote battery replacement - EASY DIY",
        "description": "Extracted from dossier: 1rPRIPkMeS7_TK7WD4NfXB96RkXzderj8h9_j7v80pjM",
        "category": "tutorial",
        "tool": null,
        "related_make": "Cadillac",
        "related_model": "Escalade",
        "related_year_start": null,
        "related_year_end": null,
        "source_dossier": "1rPRIPkMeS7_TK7WD4NfXB96RkXzderj8h9_j7v80pjM",
        "youtube_url": "https://www.youtube.com/watch?v=KMt9sKJTwco"
    },
    {
        "id": "13943de9a5574628",
        "video_id": "D0EmDE7e5nU",
        "title": "How to Use Your Digital Key | Genesis GV70",
        "description": "Extracted from dossier: 1YAFTgxAd5IYc8leTXhcuygxANf7gThru1n8ek7SEnME",
        "category": "tutorial",
        "tool": null,
        "related_make": "Genesis",
        "related_model": "GV70",
        "related_year_start": 2023,
        "related_year_end": 2023,
        "source_dossier": "1YAFTgxAd5IYc8leTXhcuygxANf7gThru1n8ek7SEnME",
        "youtube_url": "https://www.youtube.com/watch?v=D0EmDE7e5nU"
    },
    {
        "id": "8dad162da0c90978",
        "video_id": "LbZrS3sdNhI",
        "title": "Toyota key programming with the Smart Pro Lite",
        "description": "Extracted from dossier: 1bXdRu-buCOZWrW1LOMOEWWAJfMYShkkukJnS9_Kndgw",
        "category": "programming",
        "tool": "Smart Pro",
        "related_make": "Toyota",
        "related_model": null,
        "related_year_start": null,
        "related_year_end": null,
        "source_dossier": "1bXdRu-buCOZWrW1LOMOEWWAJfMYShkkukJnS9_Kndgw",
        "youtube_url": "https://www.youtube.com/watch?v=LbZrS3sdNhI"
    },
    {
        "id": "e5884eb44c692823",
        "video_id": "BhrogGzPdJ0",
        "title": "Autel IM608 pro | Ford Transit 2021 | Add key | 2022-23",
        "description": "Extracted from dossier: 1gNgQtLKYk9-QhCSE19CBs8FkoxDwBrg2i1gHfWv1x4o",
        "category": "add_key",
        "tool": "Autel",
        "related_make": "Ford",
        "related_model": "Transit",
        "related_year_start": 2021,
        "related_year_end": 2021,
        "source_dossier": "1gNgQtLKYk9-QhCSE19CBs8FkoxDwBrg2i1gHfWv1x4o",
        "youtube_url": "https://www.youtube.com/watch?v=BhrogGzPdJ0"
    },
    {
        "id": "57b11e2b50e4900a",
        "video_id": "rCA1L_LWQtA",
        "title": "How To Program Keys For Mercedes Benz using Autel IM608 Pro",
        "description": "Extracted from dossier: 1mao0Gcs5c2PZH9PZeqX1ZqFsdYgfSc2Ktw2WJVvuCMY",
        "category": "programming",
        "tool": "Autel",
        "related_make": "Mercedes-Benz",
        "related_model": null,
        "related_year_start": null,
        "related_year_end": null,
        "source_dossier": "1mao0Gcs5c2PZH9PZeqX1ZqFsdYgfSc2Ktw2WJVvuCMY",
        "youtube_url": "https://www.youtube.com/watch?v=rCA1L_LWQtA"
    },
    {
        "id": "555610efae3c12e1",
        "video_id": "_US0ODtHRAA",
        "title": "2022 Mitsubishi Outlander proximity key programming via Smart Pro!",
        "description": "Extracted from dossier: 1yz-mE-an2nDvUvDEGTzc1DvUwqry7yOi-STmhrnLYHY",
        "category": "programming",
        "tool": "Smart Pro",
        "related_make": "Mitsubishi",
        "related_model": "Outlander",
        "related_year_start": 2022,
        "related_year_end": 2022,
        "source_dossier": "1yz-mE-an2nDvUvDEGTzc1DvUwqry7yOi-STmhrnLYHY",
        "youtube_url": "https://www.youtube.com/watch?v=_US0ODtHRAA"
    },
    {
        "id": "7e0f970cfb409179",
        "video_id": "mBUUWfHNcd0",
        "title": "HONDA ACCORD NO CRANK DEAD BRICKED BCM KEY PROGRAM FIX",
        "description": "Extracted from dossier: 1gcI3EmrYPxEFkpqlOaDtloJtHE0tppRixupWpAVt57k",
        "category": "programming",
        "tool": null,
        "related_make": "Honda",
        "related_model": "Accord",
        "related_year_start": null,
        "related_year_end": null,
        "source_dossier": "1gcI3EmrYPxEFkpqlOaDtloJtHE0tppRixupWpAVt57k",
        "youtube_url": "https://www.youtube.com/watch?v=mBUUWfHNcd0"
    },
    {
        "id": "16d3fc000317c430",
        "video_id": "EEdb4_TfN44",
        "title": "CAN-C Star Connector Gremlin Fix for JEEP JL/JT",
        "description": "Extracted from dossier: 1-L829CsgS5hU8mFpWX6YTFvKfalcCD83hxx-GUDTJe0",
        "category": "bypass",
        "tool": null,
        "related_make": "Jeep",
        "related_model": "Wrangler",
        "related_year_start": null,
        "related_year_end": null,
        "source_dossier": "1-L829CsgS5hU8mFpWX6YTFvKfalcCD83hxx-GUDTJe0",
        "youtube_url": "https://www.youtube.com/watch?v=EEdb4_TfN44"
    },
    {
        "id": "b2a3064614f7c3bb",
        "video_id": "xwmxSoOTtTs",
        "title": "Alfa Romeo Stelvio/Giulia SGW Bypass install & maintenance reset",
        "description": "Extracted from dossier: 1_oDJgaaCQUVLXvODWhliGk13nvNVfaxIS3pavdDb7CA",
        "category": "bypass",
        "tool": null,
        "related_make": "Alfa Romeo",
        "related_model": null,
        "related_year_start": null,
        "related_year_end": null,
        "source_dossier": "1_oDJgaaCQUVLXvODWhliGk13nvNVfaxIS3pavdDb7CA",
        "youtube_url": "https://www.youtube.com/watch?v=xwmxSoOTtTs"
    },
    {
        "id": "0a2651b79e2100f5",
        "video_id": "D072R88XJdc",
        "title": "2018 JEEP WRANGLER / GLADIATOR 12+8 LOCATIONS (SGM LOCATION)",
        "description": "Extracted from dossier: 15XQBCT1doYV8mISVXvVFqITnqQA1A8Dq1BNgnoju2g4",
        "category": "tutorial",
        "tool": null,
        "related_make": "Jeep",
        "related_model": "Wrangler",
        "related_year_start": 2018,
        "related_year_end": 2018,
        "source_dossier": "15XQBCT1doYV8mISVXvVFqITnqQA1A8Dq1BNgnoju2g4",
        "youtube_url": "https://www.youtube.com/watch?v=D072R88XJdc"
    },
    {
        "id": "5b5a84739311f37d",
        "video_id": "92eG4xWRGD8",
        "title": "Range Rover Key Programming in Under 5 Minutes!?",
        "description": "Extracted from dossier: 1s21ZLrMatAt_hWmgYOaeXB33LcT5YdQZThDOt_sXfz4",
        "category": "programming",
        "tool": null,
        "related_make": "Land Rover",
        "related_model": "Range Rover",
        "related_year_start": null,
        "related_year_end": null,
        "source_dossier": "1s21ZLrMatAt_hWmgYOaeXB33LcT5YdQZThDOt_sXfz4",
        "youtube_url": "https://www.youtube.com/watch?v=92eG4xWRGD8"
    },
    {
        "id": "5f6c4718984017d9",
        "video_id": "K_PELmyQdqg",
        "title": "ACURA MDX TLX RLX RDX ALL KEYS LOST PUSH START(SMART KEY) TUTORIAL",
        "description": "Extracted from dossier: 1DNx-aHPF-NpJN1RuN-mBwzgVr-io3c55dQlAe1S71pQ",
        "category": "akl",
        "tool": null,
        "related_make": "Acura",
        "related_model": "MDX",
        "related_year_start": null,
        "related_year_end": null,
        "source_dossier": "1DNx-aHPF-NpJN1RuN-mBwzgVr-io3c55dQlAe1S71pQ",
        "youtube_url": "https://www.youtube.com/watch?v=K_PELmyQdqg"
    },
    {
        "id": "14facd62a987cf1b",
        "video_id": "-UkRYfc3aBw",
        "title": "PORSCHE BCM KEY PROGRAMMING",
        "description": "Extracted from dossier: 1kKEbgp2JneaHBKYvYkgZuWwPhdiJ9z_dlV4ESRIs_b8",
        "category": "programming",
        "tool": null,
        "related_make": "Porsche",
        "related_model": null,
        "related_year_start": null,
        "related_year_end": null,
        "source_dossier": "1kKEbgp2JneaHBKYvYkgZuWwPhdiJ9z_dlV4ESRIs_b8",
        "youtube_url": "https://www.youtube.com/watch?v=-UkRYfc3aBw"
    },
    {
        "id": "1a7234096e28575d",
        "video_id": "HDLLTrNivKg",
        "title": "Polestar Key Fob Programming With VIDA (Applicable to Polestar & Volvo)",
        "description": "Extracted from dossier: 1ES68K_MfZlWMnpE6hwSUFxJhdq5gxqzKhUXMsetoXdA",
        "category": "programming",
        "tool": null,
        "related_make": "Volvo",
        "related_model": null,
        "related_year_start": null,
        "related_year_end": null,
        "source_dossier": "1ES68K_MfZlWMnpE6hwSUFxJhdq5gxqzKhUXMsetoXdA",
        "youtube_url": "https://www.youtube.com/watch?v=HDLLTrNivKg"
    },
    {
        "id": "2204ba5bdae0ba63",
        "video_id": "0ZfmOf0yGQY",
        "title": "How to Program Lexus Toyota Replacement Smart Key with Techstream",
        "description": "Extracted from dossier: 1mjAladM1dSHlzbpdc6tA1w7O63zrYfJB9DEKI7PaAw0",
        "category": "programming",
        "tool": null,
        "related_make": "Lexus",
        "related_model": null,
        "related_year_start": null,
        "related_year_end": null,
        "source_dossier": "1mjAladM1dSHlzbpdc6tA1w7O63zrYfJB9DEKI7PaAw0",
        "youtube_url": "https://www.youtube.com/watch?v=0ZfmOf0yGQY"
    },
    {
        "id": "4986bec94dc209fa",
        "video_id": "sCcr4W8qaUc",
        "title": "How to program key on Infiniti G35 G37 370z",
        "description": "Extracted from dossier: 1zBGduvsYrdTB4FMOTh0K60bTeB0VaxK0Zk3iMwbCls4",
        "category": "programming",
        "tool": null,
        "related_make": "Infiniti",
        "related_model": null,
        "related_year_start": null,
        "related_year_end": null,
        "source_dossier": "1zBGduvsYrdTB4FMOTh0K60bTeB0VaxK0Zk3iMwbCls4",
        "youtube_url": "https://www.youtube.com/watch?v=sCcr4W8qaUc"
    },
    {
        "id": "bd91ebb35d6bf43c",
        "video_id": "df-C8Dg1phs",
        "title": "Lincoln Navigator keyless remote programming",
        "description": "Extracted from dossier: 1GYlhMNdQ2w6sFWoJxaA1ooWCiqyKH1cK0UH3KP25uOk",
        "category": "programming",
        "tool": null,
        "related_make": "Lincoln",
        "related_model": "Navigator",
        "related_year_start": null,
        "related_year_end": null,
        "source_dossier": "1GYlhMNdQ2w6sFWoJxaA1ooWCiqyKH1cK0UH3KP25uOk",
        "youtube_url": "https://www.youtube.com/watch?v=df-C8Dg1phs"
    },
    // Honda Civic videos (covering 2016-2021, which includes 2018 demo vehicle)
    {
        "id": "civic_bcm_location_01",
        "video_id": "nlmeQz4WPI0",
        "title": "How To Remove/Access 2016-2021 Honda Civic BCM - BCM Location",
        "description": "Extracted from Honda 11th Gen Research dossier",
        "category": "tutorial",
        "tool": null,
        "related_make": "Honda",
        "related_model": "Civic",
        "related_year_start": 2016,
        "related_year_end": 2021,
        "source_dossier": "Honda_11th_Gen_Key_Programming_Research",
        "youtube_url": "https://www.youtube.com/watch?v=nlmeQz4WPI0"
    },
    {
        "id": "civic_bcm_fuse_01",
        "video_id": "Il3LIj-aIRs",
        "title": "HONDA CIVIC BCM FUSE LOCATION, BODY CONTROL MODULE FUSE 2016-2021",
        "description": "Extracted from Honda 11th Gen Research dossier",
        "category": "tutorial",
        "tool": null,
        "related_make": "Honda",
        "related_model": "Civic",
        "related_year_start": 2016,
        "related_year_end": 2021,
        "source_dossier": "Honda_11th_Gen_Key_Programming_Research",
        "youtube_url": "https://www.youtube.com/watch?v=Il3LIj-aIRs"
    },
    {
        "id": "civic_akl_2022_01",
        "video_id": "YTS6F4VFguI",
        "title": "2022 Honda Civic All Smart Keys Lost using Autel KM100 and Universal iKey",
        "description": "Extracted from XTOOL X100 PAD3 Research",
        "category": "akl",
        "tool": "Autel",
        "related_make": "Honda",
        "related_model": "Civic",
        "related_year_start": 2022,
        "related_year_end": 2022,
        "source_dossier": "XTOOL_X100_PAD3_Research_Analysis",
        "youtube_url": "https://www.youtube.com/watch?v=YTS6F4VFguI"
    },
    {
        "id": "civic_bcm_removal_01",
        "video_id": "Ffc6v9aG4rw",
        "title": "2020 Honda Civic Body Control Module Location and Removal",
        "description": "Extracted from Honda Pilot Research dossier",
        "category": "tutorial",
        "tool": null,
        "related_make": "Honda",
        "related_model": "Civic",
        "related_year_start": 2020,
        "related_year_end": 2020,
        "source_dossier": "Comprehensive_Analysis_of_Honda_Pilot",
        "youtube_url": "https://www.youtube.com/watch?v=Ffc6v9aG4rw"
    },
    {
        "id": "civic_ihds_pcm_01",
        "video_id": "vk34ENlPvbo",
        "title": "2016 Honda Civic Programming a new PCM using I-HDS or Autel",
        "description": "Extracted from Honda i-HDS Research dossier",
        "category": "programming",
        "tool": "Autel",
        "related_make": "Honda",
        "related_model": "Civic",
        "related_year_start": 2016,
        "related_year_end": 2021,
        "source_dossier": "Honda_i-HDS_Diagnostic_System_Research",
        "youtube_url": "https://www.youtube.com/watch?v=vk34ENlPvbo"
    },
    // Ford F-150 videos
    {
        "id": "f150_fdrs_2021",
        "video_id": "ReGc01CzxVE",
        "title": "2021 Ford F-150 key programming with FDRS and NASTF",
        "description": "Extracted from F-150 Gen 14 Technical Compendium",
        "category": "programming",
        "tool": "FDRS",
        "related_make": "Ford",
        "related_model": "F-150",
        "related_year_start": 2021,
        "related_year_end": 2024,
        "source_dossier": "Technical_Compendium_F150_Gen14",
        "youtube_url": "https://www.youtube.com/watch?v=ReGc01CzxVE"
    },
    {
        "id": "f150_octfast_2023",
        "video_id": "sav7q-7rFV8",
        "title": "How to program Ford F150 2021 with OCT FastPats Software (FDRS type)",
        "description": "Extracted from F-150 Gen 14 Technical Compendium",
        "category": "programming",
        "tool": "OCT FastPats",
        "related_make": "Ford",
        "related_model": "F-150",
        "related_year_start": 2021,
        "related_year_end": 2025,
        "source_dossier": "Technical_Compendium_F150_Gen14",
        "youtube_url": "https://www.youtube.com/watch?v=sav7q-7rFV8"
    },
    {
        "id": "f150_doorcode_01",
        "video_id": "zR2hGkb5A1I",
        "title": "Ford F-150: How to Pull Your Door Key Code (2021-2024)",
        "description": "Extracted from F-150 Gen 14 Technical Compendium",
        "category": "tutorial",
        "tool": null,
        "related_make": "Ford",
        "related_model": "F-150",
        "related_year_start": 2021,
        "related_year_end": 2024,
        "source_dossier": "Technical_Compendium_F150_Gen14",
        "youtube_url": "https://www.youtube.com/watch?v=zR2hGkb5A1I"
    },
    // Toyota videos
    {
        "id": "tundra_akl_2022",
        "video_id": "EDR79QIqQqo",
        "title": "2022-2025 Toyota Tundra All keys lost programming and PIN code bypass",
        "description": "Extracted from Toyota Techstream SGW Bypass Research",
        "category": "akl",
        "tool": null,
        "related_make": "Toyota",
        "related_model": "Tundra",
        "related_year_start": 2022,
        "related_year_end": 2025,
        "source_dossier": "Toyota_Techstream_SGW_Bypass_Research",
        "youtube_url": "https://www.youtube.com/watch?v=EDR79QIqQqo"
    },
    {
        "id": "tacoma_smartkey_2024",
        "video_id": "NlBFe0tLIj4",
        "title": "Toyota Tacoma 2024 - New Smart Key with Autel 508 and SmartPro (30 pin cable)",
        "description": "Extracted from Toyota Techstream SGW Bypass Research",
        "category": "programming",
        "tool": "Autel",
        "related_make": "Toyota",
        "related_model": "Tacoma",
        "related_year_start": 2024,
        "related_year_end": 2024,
        "source_dossier": "Toyota_Techstream_SGW_Bypass_Research",
        "youtube_url": "https://www.youtube.com/watch?v=NlBFe0tLIj4"
    },
    {
        "id": "highlander_akl_2024",
        "video_id": "jupqjDXyng0",
        "title": "2024 Toyota Grand Highlander all keys lost key programming",
        "description": "Extracted from Toyota Grand Highlander TNGA-K Research",
        "category": "akl",
        "tool": null,
        "related_make": "Toyota",
        "related_model": "Highlander",
        "related_year_start": 2023,
        "related_year_end": 2024,
        "source_dossier": "Toyota_Grand_Highlander_TNGA-K",
        "youtube_url": "https://www.youtube.com/watch?v=jupqjDXyng0"
    },
    // Kia/Hyundai videos
    {
        "id": "kia_k5_smartpro",
        "video_id": "r4KbnjdQDSg",
        "title": "How to Read Pin Code & Program 2022 KIA K5 proximity key w Smart Pro Programmer",
        "description": "Extracted from Kia Telluride Research",
        "category": "programming",
        "tool": "Smart Pro",
        "related_make": "Kia",
        "related_model": "K5",
        "related_year_start": 2022,
        "related_year_end": 2024,
        "source_dossier": "Advanced_Technical_Report_Kia_Telluride",
        "youtube_url": "https://www.youtube.com/watch?v=r4KbnjdQDSg"
    },
    {
        "id": "kia_hyundai_autel_tip",
        "video_id": "K9UKGyFuCK4",
        "title": "TIP WHEN GETTING ERROR WITH AUTEL IM508 TO PROGRAM SMART KEYS ON NEW KIA AND HYUNDAI",
        "description": "Extracted from Kia Telluride Research",
        "category": "tutorial",
        "tool": "Autel",
        "related_make": "Kia",
        "related_model": null,
        "related_year_start": 2020,
        "related_year_end": 2025,
        "source_dossier": "Advanced_Technical_Report_Kia_Telluride",
        "youtube_url": "https://www.youtube.com/watch?v=K9UKGyFuCK4"
    },
    // Ford Maverick videos
    {
        "id": "maverick_fdrs_akl",
        "video_id": "aS1UVHTHplU",
        "title": "2022 Ford Maverick AKL key programming via FDRS + NASTF",
        "description": "Extracted from Ford Maverick Forensic Report",
        "category": "akl",
        "tool": "FDRS",
        "related_make": "Ford",
        "related_model": "Maverick",
        "related_year_start": 2022,
        "related_year_end": 2025,
        "source_dossier": "Forensic_Technical_Report_2022_Ford_Maverick",
        "youtube_url": "https://www.youtube.com/watch?v=aS1UVHTHplU"
    },
    {
        "id": "maverick_doorcode",
        "video_id": "jrjhkmeiisg",
        "title": "2022-2025 Ford Maverick How to retrieve Keyless Door Code",
        "description": "Extracted from Ford Maverick Forensic Report",
        "category": "tutorial",
        "tool": null,
        "related_make": "Ford",
        "related_model": "Maverick",
        "related_year_start": 2022,
        "related_year_end": 2025,
        "source_dossier": "Forensic_Technical_Report_2022_Ford_Maverick",
        "youtube_url": "https://www.youtube.com/watch?v=jrjhkmeiisg"
    },
    // Lincoln videos
    {
        "id": "navigator_autel_2018",
        "video_id": "jqPadVur51g",
        "title": "2018 Lincoln Navigator Proximity Key Programmed with Autel IM608",
        "description": "Extracted from Lincoln Security Architectures Analysis",
        "category": "programming",
        "tool": "Autel",
        "related_make": "Lincoln",
        "related_model": "Navigator",
        "related_year_start": 2018,
        "related_year_end": 2020,
        "source_dossier": "Lincoln_Security_Architectures",
        "youtube_url": "https://www.youtube.com/watch?v=jqPadVur51g"
    },
    {
        "id": "lincoln_aviator_battery",
        "video_id": "vC6wUdTPt5k",
        "title": "How to Replace Lincoln Aviator Key Fob Battery",
        "description": "Extracted from Lincoln Security Architectures Analysis",
        "category": "tutorial",
        "tool": null,
        "related_make": "Lincoln",
        "related_model": "Aviator",
        "related_year_start": 2020,
        "related_year_end": 2024,
        "source_dossier": "Lincoln_Security_Architectures",
        "youtube_url": "https://www.youtube.com/watch?v=vC6wUdTPt5k"
    },
    // Honda Accord 2023
    {
        "id": "accord_smartpro_2023",
        "video_id": "AKy6vAo8pgc",
        "title": "Honda Accord 2023 - Program New Smartkey with SmartPro and K Jaw",
        "description": "Extracted from Honda 11th Gen Research",
        "category": "programming",
        "tool": "Smart Pro",
        "related_make": "Honda",
        "related_model": "Accord",
        "related_year_start": 2023,
        "related_year_end": 2024,
        "source_dossier": "Honda_11th_Gen_Key_Programming_Research",
        "youtube_url": "https://www.youtube.com/watch?v=AKy6vAo8pgc"
    }
];

/**
 * Get the best matching video for a vehicle
 */
function findFeaturedVideo(make: string, model?: string, year?: number): VideoTutorial | null {
    const makeLower = make.toLowerCase();

    // Priority 1: Exact make + model + year match
    if (model && year) {
        const exact = VIDEO_TUTORIALS.find(v =>
            v.related_make?.toLowerCase() === makeLower &&
            v.related_model?.toLowerCase() === model.toLowerCase() &&
            v.related_year_start && v.related_year_end &&
            year >= v.related_year_start && year <= v.related_year_end
        );
        if (exact) return exact;
    }

    // Priority 2: Make + model match
    if (model) {
        const makeModel = VIDEO_TUTORIALS.find(v =>
            v.related_make?.toLowerCase() === makeLower &&
            v.related_model?.toLowerCase() === model.toLowerCase()
        );
        if (makeModel) return makeModel;
    }

    // Priority 3: Make only match (prefer programming/akl categories)
    const makeOnly = VIDEO_TUTORIALS
        .filter(v => v.related_make?.toLowerCase() === makeLower)
        .sort((a, b) => {
            const categoryPriority: Record<string, number> = { programming: 1, akl: 2, add_key: 3, bypass: 4, tutorial: 5 };
            return (categoryPriority[a.category] || 99) - (categoryPriority[b.category] || 99);
        });

    return makeOnly[0] || null;
}

/**
 * Get related videos for a vehicle (excluding featured)
 */
function findRelatedVideos(make: string, model?: string, featuredId?: string): VideoTutorial[] {
    const makeLower = make.toLowerCase();

    return VIDEO_TUTORIALS
        .filter(v => {
            if (v.id === featuredId) return false;
            if (v.related_make?.toLowerCase() !== makeLower) return false;
            return true;
        })
        .slice(0, 3);
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    const category = searchParams.get('category');
    const all = searchParams.get('all');

    // Return all videos if 'all' param is set
    if (all === 'true') {
        let filtered = VIDEO_TUTORIALS;

        if (category) {
            filtered = filtered.filter(v => v.category === category);
        }
        if (make) {
            filtered = filtered.filter(v => v.related_make?.toLowerCase() === make.toLowerCase());
        }

        return NextResponse.json({
            videos: filtered,
            total: filtered.length
        });
    }

    // Require make for featured/related lookup
    if (!make) {
        return NextResponse.json({
            error: 'Missing required parameter: make',
            usage: '/api/videos?make=BMW&model=X5&year=2017'
        }, { status: 400 });
    }

    const featured = findFeaturedVideo(make, model || undefined, year ? parseInt(year) : undefined);
    const related = findRelatedVideos(make, model || undefined, featured?.id);

    return NextResponse.json({
        featured,
        related,
        make,
        model,
        year: year ? parseInt(year) : null
    });
}
