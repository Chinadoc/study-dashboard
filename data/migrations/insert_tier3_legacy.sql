-- Honda Tier 3 Legacy Models: Crosstour, Insight, Clarity, CR-Z, S2000
-- Generated from web research with verified sources

-- Crosstour 2010-2015
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-crosstour-2010-2015',
  'Honda',
  'Crosstour',
  2010,
  2015,
  '# Honda Crosstour 2010-2015 Key Programming Master Guide

## Overview
The Honda Accord Crosstour (later just Crosstour) is a mid-size crossover based on the Accord platform.

> **Pearl:** Crosstour shares Accord key specs. Use the same blanks and procedures as 2008-2012 Accord.

## Transponder Chip
| Year | Chip Type | Protocol |
|------|-----------|----------|
| 2010-2015 | ID46 (Philips "V") | Crypto 2 |

## FCC ID
| Year | FCC ID | Buttons |
|------|--------|---------|
| 2010-2012 | MLBHLIK-1T | 4B |
| 2013-2015 | MLBHLIK-1T | 4B |

## Key Info
- **Blade:** HON66
- **Lishi:** HON66 2-in-1

## OBP Remote Programming
Standard Honda 4-cycle ignition procedure.

## Autel IM608
Menu: IMMO → Honda → Accord Crosstour → [Year]

## Sources
- carandtruckremotes.com, northcoastkeyless.com
',
  '{"sources": ["carandtruckremotes.com", "northcoastkeyless.com", "tomskey.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- Insight 2010-2022
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-insight-2010-2022',
  'Honda',
  'Insight',
  2010,
  2022,
  '# Honda Insight 2010-2022 Key Programming Master Guide

## Overview
The Honda Insight is a hybrid vehicle with two distinct generations in this period.

## Transponder Chips
| Year | Chip Type | Protocol |
|------|-----------|----------|
| 2010-2014 | ID46 (Philips "V") | Crypto 2 |
| 2019-2022 | NXP AES 128-bit | Advanced |

## FCC IDs
| Year | FCC ID | Key Type |
|------|--------|----------|
| 2010-2014 | MLBHLIK-1T | Remote Head Key |
| 2019-2022 | CWTWB1G0090 | Smart Key |

## Key Info
- **2010-2014 Blade:** HON66
- **2019-2022:** Smart Key with HU101 emergency

## Programming
- 2010-2014: OBP for remote, Autel for transponder
- 2019-2022: Professional tool required, supports Pro Key Box

## Autel IM608
Menu: IMMO → Honda → Insight → [Year]

## Sources
- locksmithkeyless.com, carandtruckremotes.com
',
  '{"sources": ["locksmithkeyless.com", "carandtruckremotes.com", "insightcentral.net"], "generated": "2024-12-10", "method": "web_research"}'
);

-- Clarity 2017-2021
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-clarity-2017-2021',
  'Honda',
  'Clarity',
  2017,
  2021,
  '# Honda Clarity 2017-2021 Key Programming Master Guide

## Overview
The Honda Clarity is available as Plug-in Hybrid, Electric, and Fuel Cell variants.

## Transponder Chip
| Year | Chip Type | Protocol |
|------|-----------|----------|
| 2017-2021 | HITAG 3 | 128-bit AES |

## FCC ID
| Year | FCC ID | Buttons | Frequency |
|------|--------|---------|-----------|
| 2017-2021 | KR5V2X-V42 | 6B | 434 MHz |

## Key Info
- **Key Type:** Smart Key Only
- **Emergency Blade:** HU101
- **Battery:** CR2032

## Programming
- NOT onboard programmable
- Requires dealer or locksmith with Autel/professional tool

## Autel IM608
Menu: IMMO → Honda → Clarity → [Year] → Smart Key

## Sources
- remotesandkeys.com, keyless2go.com, key4.com
',
  '{"sources": ["remotesandkeys.com", "keyless2go.com", "key4.com", "carandtruckremotes.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- CR-Z 2011-2016
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-crz-2011-2016',
  'Honda',
  'CR-Z',
  2011,
  2016,
  '# Honda CR-Z 2011-2016 Key Programming Master Guide

## Overview
The Honda CR-Z is a sporty hybrid coupe with remote head key technology.

## Transponder Chip
| Year | Chip Type | Protocol |
|------|-----------|----------|
| 2011-2016 | ID46 (Philips "V") | Crypto 2 |

## FCC ID
| Year | FCC ID | Buttons |
|------|--------|---------|
| 2011-2016 | MLBHLIK-1T | 3B |

## Key Info
- **Blade:** HON66
- **Lishi:** HON66 2-in-1
- **Chip Part:** HO03-PT

## Programming
- Remote: No DIY OBP, requires professional tool
- Transponder: Autel IM608 via OBD

## Autel IM608
Menu: IMMO → Honda → CR-Z → [Year]

## Sources
- crzforum.com, remotesandkeys.com, programautokeys.com
',
  '{"sources": ["crzforum.com", "remotesandkeys.com", "programautokeys.com", "carandtruckremotes.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- S2000 2000-2009
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-s2000-2000-2009',
  'Honda',
  'S2000',
  2000,
  2009,
  '# Honda S2000 2000-2009 Key Programming Master Guide

## Overview
The Honda S2000 is a rear-wheel-drive roadster with older key technology.

> **Pearl:** S2000 uses older 4-button remotes. OBP works for remotes only. Transponder needs pro tool.

## Transponder Chip
| Year | Chip Type | Protocol |
|------|-----------|----------|
| 2000-2009 | T5 (Nova) | Legacy |

## FCC ID
| Year | FCC ID | Buttons | Frequency |
|------|--------|---------|-----------|
| 2000-2009 | E4EG8DJ / G8D-452H-A | 4B | 315 MHz |

## Key Info
- **Blade:** HON66
- **Lishi:** HON66 2-in-1

## OBP Remote Programming
1. Insert key, turn ON
2. Within 4 seconds, press LOCK for 1 second
3. Turn OFF within 4 seconds
4. Repeat 3 more times (4 total cycles)
5. On 4th ON, press LOCK on each remote
6. Locks cycle = success
7. Turn OFF to save

## Transponder Programming
- Requires professional locksmith
- T5 chip must be cloned or programmed via Autel

## Sources
- northcoastkeyless.com, programautokeys.com, youtube.com
',
  '{"sources": ["northcoastkeyless.com", "programautokeys.com", "youtube.com", "ebay.com"], "generated": "2024-12-10", "method": "web_research"}'
);
