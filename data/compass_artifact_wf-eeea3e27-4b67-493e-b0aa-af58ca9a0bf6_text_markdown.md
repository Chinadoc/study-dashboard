# Automotive Key Code Series Database by Manufacturer and Keyway

This comprehensive locksmith reference covers **30+ keyways** across 10 major automotive manufacturers (2000-2025 vehicles), providing code series ranges, Lishi tool compatibility, model applications, and technical specifications essential for key cutting by code, decoding, and supplier ordering.

## Complete CSV database

```csv
make,keyway,code_series_start,code_series_end,lishi_tool,example_models,year_range,notes
GM,B106,G0001,G3631,B106/B107,"Silverado,Tahoe,Yukon,Impala,Malibu,Corvette,Equinox,HHR,Cobalt,Suburban",2003-2017,"10-cut edge cut double-sided; Z-keyway; non-transponder mechanical; test key for B111"
GM,B111,G0000,G3631,B111,"Silverado,Tahoe,Yukon,Impala,Escalade,CTS,Malibu,Acadia,Traverse,Sierra",2004-2017,"10-cut edge cut; Philips ID46 Circle+ transponder; SKIM encrypted; 30-min OBP learn procedure"
GM,HU100-8cut,Z0001,Z2000,HU100-8cut,"Camaro,Cruze,Equinox,Malibu,Sonic,Spark,Volt,Terrain,Encore,Regal,Verano",2010-2020,"8-cut high security sidewinder; internal 2-track; various ID46 transponders"
GM,HU100-10cut,V0001,V5573,HU100-10cut,"Silverado,Sierra,Tahoe,Yukon,Suburban,Escalade,Colorado,Canyon,Express,Savana,CT6,XT5",2014-2025,"10-cut high security sidewinder; internal 2-track; Philips ID46 Circle+; requires Silca/Keyline machine"
Ford,H75,0001X,1706X,FO38/H75,"F-150,Explorer,Expedition,Crown Victoria,Taurus,Mustang,Ranger,Escape,Edge,Flex",1996-2017,"8-cut edge cut double-sided; non-transponder mechanical; ILCO 1196FD; base blade for H84/H92"
Ford,H84,0001X,1706X,FO38/H75,"Focus,Escape,F-Series,Explorer,Expedition,Mustang,Taurus,Crown Victoria,Navigator",2000-2007,"8-cut edge cut; TI 4D63 40-bit transponder; PATS Gen 1; same blade profile as H75"
Ford,H92,0001X,1706X,FO38/H75,"F-150,F-250,Explorer,Expedition,Mustang,Taurus,Escape,Fusion,Edge,Flex,MKZ,Navigator",2000-2020,"8-cut edge cut; TI 4D63 80-bit transponder; PATS Gen 2; look for DOT/SA/S/80 stamp on OEM key"
Ford,HU101,0001X,1706X,HU101-V3,"F-150,Explorer,Escape,Edge,Fusion,Mustang,Transit,Expedition,Focus,Fiesta,MKC,MKZ,Navigator",2011-2025,"10-cut high security sidewinder; external 2-track; 4D63 80-bit or HITAG-PRO 128-bit; NOT for push-start vehicles"
Stellantis,Y157,L0001,L3580,CY24,"Grand Cherokee,Cherokee,Wrangler,Cirrus,Concorde,Intrepid,Neon,Stratus,Voyager",1994-2000,"7-cut edge cut double-sided; 4 depths; non-transponder; pre-SKIM system"
Stellantis,Y159,M1,M2618,CY24,"Ram,Durango,Dakota,Charger,Viper,Grand Cherokee,Wrangler,Liberty,Caravan,Town Country",1993-2010,"7-8 cut edge cut; SKIM transponder introduced 1996; very common keyway; positions 1-8 ignition"
Stellantis,Y164,M1,M2618,CY24,"300C,Charger,Challenger,Ram,Grand Cherokee,Wrangler,Compass,Patriot,Journey,Dart,Durango",2004-2019,"7-cut edge cut; ID46 Philips Crypto transponder; requires SKIM PIN code programming"
Stellantis,CY24,L0001/M1,L3580/M2618,CY24,"All Chrysler/Dodge/Jeep/Ram with standard keyway 1994-2019",1994-2019,"Silca designation; Lishi tool covers Y157/Y159/Y164; 8-cut 4-5 depth system"
Toyota,TOY43,10001,15000,TOY43-AT,"Camry,Corolla,RAV4,Highlander,4Runner,Tacoma,Tundra,Sienna,Avalon,Sequoia,Venza,Matrix",1992-2020,"8-cut edge cut split wafer; chips: 4C/4D-67/G-chip/H-chip by year; most common Toyota keyway"
Toyota,TOY48,40000,49999,TOY48,"Lexus ES,GS,IS,LS,RX,GX,LX,SC,Avalon,Camry,Corolla,Land Cruiser,Scion tC",1997-2017,"10-cut high security sidewinder; internal 4-track; 4C/4D-68/H transponders; quad lifter Lishi required"
Toyota,TOY51,80000,89999,TOY51/VA8,"Camry,Corolla,RAV4,Highlander,Tacoma,Tundra,C-HR,Avalon,bZ4X,Lexus models",2005-2025,"8-cut high security sidewinder; internal 2-track; smart key emergency blade; also VA8 European designation"
Honda,HON66,K001,N718,HON66,"Accord,Civic,CR-V,Pilot,Odyssey,HR-V,Ridgeline,Fit,MDX,RDX,TL,TLX,TSX,ILX",2002-2019,"12-cut high security sidewinder; external 4-track; 6 depths; ID46/ID48/8E transponders"
Honda,HON70,J00,U39,HON70,"CBR1000,CBR600,Gold Wing,Hornet,Fireblade,Shadow,Silver Wing,Varadero,VTX1800",1999-2022,"8-cut flat edge cut; MOTORCYCLE ONLY - not automotive; ID46 chip"
Nissan,NSN14,00001,22185,NSN14,"Altima,Maxima,Sentra,Rogue,Pathfinder,Frontier,Titan,Armada,Murano,350Z,370Z,Leaf,Infiniti G/M/Q",1996-2019,"10-cut edge cut double-sided; 4 depths; ID46 transponder; DA34 is ILCO equivalent designation"
Nissan,DA34,00001,22185,NSN14,"Same as NSN14 - identical keyway different designation",1996-2019,"Same as NSN14; ILCO designation; door uses positions 3-10; ignition uses all 10"
Hyundai/Kia,HY14,T0001,T1000,HYN11/HY14,"Accent,Elantra,Tiburon,Tucson,Spectra,Sportage",1996-2010,"10-cut edge cut double-sided; non-transponder mechanical for most; older generation keyway"
Hyundai/Kia,HY16,V0001,V1200,HY16/HYN14,"Accent,Sonata,Veracruz,Santa Fe,Genesis,Rio,Carnival,Optima,Tucson",2006-2012,"10-cut flat edge cut; transponder equipped; HYN14 Silca profile"
Hyundai/Kia,HY18,T1001,T3500,HY20/HY18,"Accent,Elantra,Veloster,Veracruz,Santa Fe,Sorento",2012-2020,"8-cut high security sidewinder; HY18R reversed variant uses C1001-C3500 codes"
Hyundai/Kia,HY22,G0001,G2500,HY22,"Sonata,Azera,Genesis,Equus,Optima,Sorento,Forte,Rio,Borrego,Amanti",2005-2017,"12-cut high security sidewinder; internal 4-track; quad lifter Lishi required; smart key systems"
Hyundai/Kia,MIT17,F1,F1571,MIT17,"Eclipse,Endeavor,Galant,Lancer,Outlander,Mirage,i-MiEV",2003-2020,"Edge cut standard; Mitsubishi keyway; ID46A transponder; some Hyundai cross-application"
BMW,HU58,BH010001,BH241450,HU58-V3,"3-Series E36/E46,5-Series E34/E39,7-Series E38,Z3,X5 E53,M3,M5",1988-2003,"8-cut edge cut; 4-track external; ID44 PCF7935 transponder; EWS1/EWS2 system; twin lifter tool"
BMW,HU92,Dealer/VIN,Dealer/VIN,HU92-V3,"3-Series E46/E90,5-Series E60,6-Series E63,7-Series E65,X3 E83,X5 E53/E70,X6 E71,Z4,Mini Cooper",1999-2014,"8-cut high security; 2-track internal; ID44/ID46 transponder; EWS3/EWS4/CAS1/CAS2; TWIN lifter required"
BMW,HU100R,Dealer/VIN,Dealer/VIN,HU100R-V3,"1-Series F20,2-Series F22,3-Series F30,4-Series F32,5-Series F10,X3 F25,X5 F15,M-Series",2007-2025,"8-cut high security; 2-track internal sidewinder; CAS3/CAS4/FEM/BDC systems; F/G-Series vehicles"
Mercedes,HU64,001,6700,HU64-V3,"C-Class W203/W204,E-Class,M-Class,S-Class,CL,CLK,SL,SLK,G-Class,R-Class,Crossfire,Sprinter",1995-2011,"10-cut high security; 2-track external sidewinder; 5 depths; ID44 PCF7935 transponder; twin lifter"
Mercedes,HU39,HY6001,HY8130,None/Traditional,"W124 E-Class,W126/W140 S-Class,R107/R129 SL-Class,R170 SLK,300 Series",1981-2005,"10-cut edge cut; no Lishi tool - traditional picking/impression; high security brass key"
Mercedes,YM23,MCC0001,MCC1000,YM23,"Smart ForTwo,Smart ForFour,Smart Roadster,Smart C450/A450",1998-2015,"8-cut edge cut for Smart; 4 depths; 433MHz remote; small format blade; NOT interchangeable with Mercedes 10-cut YM23"
VW/Audi,HU66,0001,6000,HU66,"Golf,Jetta,Passat,Beetle,Tiguan,Touareg,A3,A4,A6,A8,TT,Q5,Q7,Porsche 911/Boxster/Cayenne",1996-2017,"8-9 cut high security; 2-track internal sidewinder; 4 depths; ID48/ID48 CAN transponder; 3 lock generations"
VW/Audi,HU162,MQB-Series,MQB-Series,HU162T,"Golf 2014+,Jetta 2015+,Passat 2015+,Atlas,Tiguan 2015+,Audi MQB models,Seat,Skoda",2014-2025,"8-10 cut high security; 2-track + side cuts; ID49 AES encrypted; multiple Lishi variants needed; inverted wafers"
```

## Understanding the code series system

Code series represent the **bitting combinations** that manufacturers assign to their locks. When a locksmith has a key code (from VIN lookup, code retrieval software, or physical decoding), they reference the code series to determine which software module or code book applies. For example, Toyota TOY43 codes **10001-15000** tell the locksmith they need to use the Toyota edge-cut database, while GM HU100-10cut codes **V0001-V5573** require the GM high-security sidewinder module.

**Critical code series patterns** include GM's alphabetic prefix system (G-series for edge-cut, Z-series for 8-cut sidewinder, V-series for 10-cut sidewinder), Ford's X-suffix system (0001X-1706X covers all H-series keyways), and Toyota's numeric range segmentation (10K series for TOY43 edge-cut, 40K for TOY48 internal-track, 80K for TOY51 smart key emergency blades).

## Lishi tool quick reference by manufacturer

| Manufacturer | Edge-Cut Tools | High-Security Tools |
|-------------|----------------|---------------------|
| GM | B106/B107, B111 | HU100-8cut, HU100-10cut |
| Ford | FO38/H75 | HU101-V3 |
| Stellantis | CY24 | CY24 (covers all) |
| Toyota | TOY43, TOY43-AT | TOY48, TOY51/VA8 |
| Honda | HON70 (moto) | HON66 |
| Nissan | NSN14 | NSN14 (edge-cut) |
| Hyundai/Kia | HYN11/HY14, HY16 | HY18, HY22 |
| BMW | HU58 | HU92, HU100R |
| Mercedes | YM23 | HU64 |
| VW/Audi | — | HU66, HU162T |

## Important distinctions locksmiths should know

**Same keyway, different designations** occur frequently: NSN14 and DA34 are identical (Silca vs. ILCO naming), while CY24 is the Silca designation and Lishi tool name covering Chrysler's Y157, Y159, and Y164 keyways. The TOY51 keyway shares the VA8 designation in European markets for Renault/Peugeot/Citroën applications.

**HU100 splits into two distinct systems** at GM—8-cut versions (Z-prefix codes) serve passenger cars like Camaro, Cruze, and Malibu, while 10-cut versions (V-prefix codes) serve trucks and SUVs like Silverado, Sierra, Tahoe, and Escalade. Different Lishi tools are required for each.

**The HU162 represents the most complex modern keyway** with 8-cut, 9-cut, and 10-cut variants featuring inverted wafers and side cuts. Door locks use side cuts in positions 1-3 while ignitions do not, requiring multiple specialized Lishi tools for complete vehicle coverage.

**Dealer-only code retrieval** applies to BMW HU92 and HU100R keyways—these require VIN-based code lookup through BMW ISTA+ diagnostic systems or dealership-level access rather than traditional code series databases.

## Transponder evolution by platform

Modern keyways increasingly require understanding transponder generations alongside mechanical specifications. GM transitioned from non-transponder B106 to **ID46 Circle+ encrypted** B111 keys, then to high-security HU100 with the same chip architecture. Ford moved through **4D63 40-bit** (H84) to **4D63 80-bit** (H92) to **HITAG-PRO 128-bit** (HU101). Toyota progressed from clonable **4C** to encrypted **4D-67** to **G-chip** to **H-chip/8A** systems. VW/Audi advanced from **ID48 Megamos** to **ID48 CAN** to the current **ID49 AES-encrypted MQB** platform.

## Year range overlaps and transition periods

Significant overlap exists where manufacturers phased in new keyways while continuing older systems. Ford used H75, H84, H92, and HU101 concurrently during 2011-2017 depending on model and trim level. Toyota ran TOY43 edge-cut alongside TOY48 and TOY51 high-security keyways from 2005-2020, with keyway assignment varying by whether vehicles had traditional ignition or push-button start. GM operated B106/B111 and HU100 simultaneously from 2010-2017 before fully transitioning trucks to HU100-10cut.

Locksmiths should always verify the specific vehicle's keyway before cutting or ordering blanks, as VIN-based lookup or physical inspection remains essential despite general year-range guidelines.