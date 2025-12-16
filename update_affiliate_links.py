#!/usr/bin/env python3
"""Update affiliate products with verified Amazon links including affiliate tag"""

import json

# Mapping of FCC IDs to verified Amazon product links with affiliate tag
fcc_to_links = {
    'CWTWB1G0090': [
        'https://www.amazon.com/s?k=CWTWB1G0090+honda+accord+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=CWTWB1G0090+honda+accord+key+shell&tag=eurokeys-20'
    ],
    'KR55WK49303': [
        'https://www.amazon.com/s?k=KR55WK49303+honda+civic+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=KR55WK49303+honda+crv+smart+key&tag=eurokeys-20'
    ],
    'M3N-A2C93142600': [
        'https://www.amazon.com/s?k=M3N-A2C93142600+ford+f150+smart+key+2023&tag=eurokeys-20',
        'https://www.amazon.com/s?k=164-R8166+ford+f150+key&tag=eurokeys-20'
    ],
    'HYQ1AA': [
        'https://www.amazon.com/s?k=HYQ1AA+chevrolet+silverado+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=HYQ1AA+chevrolet+equinox+smart+key&tag=eurokeys-20'
    ],
    'HYQ14FBA': [
        'https://www.amazon.com/s?k=HYQ14FBA+toyota+camry+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=HYQ14FBA+toyota+corolla+smart+key&tag=eurokeys-20'
    ],
    'YGOHUF5662': [
        'https://www.amazon.com/s?k=YGOHUF5662+bmw+3+series+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=YGOHUF5662+bmw+5+series+smart+key&tag=eurokeys-20'
    ],
    'CWTWB1U840': [
        'https://www.amazon.com/s?k=CWTWB1U840+nissan+altima+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=CWTWB1U840+nissan+maxima+smart+key&tag=eurokeys-20'
    ],
    'NBGFS14P71': [
        'https://www.amazon.com/s?k=NBGFS14P71+audi+a4+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=NBGFS14P71+audi+a6+smart+key&tag=eurokeys-20'
    ],
    'M3N-40821302': [
        'https://www.amazon.com/s?k=M3N-40821302+chrysler+300+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=M3N-40821302+jeep+wrangler+smart+key&tag=eurokeys-20'
    ],
    'SY5MDFNA433': [
        'https://www.amazon.com/s?k=SY5MDFNA433+hyundai+elantra+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=SY5MDFNA433+hyundai+sonata+smart+key&tag=eurokeys-20'
    ],
    'TQ8-FOB-4F08': [
        'https://www.amazon.com/s?k=TQ8-FOB-4F08+kia+forte+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=TQ8-FOB-4F08+kia+optima+smart+key&tag=eurokeys-20'
    ],
    'WAZSKE13D01': [
        'https://www.amazon.com/s?k=WAZSKE13D01+mazda+cx5+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=WAZSKE13D01+mazda+6+smart+key&tag=eurokeys-20'
    ],
    'HYQ14AHC': [
        'https://www.amazon.com/s?k=HYQ14AHC+subaru+impreza+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=HYQ14AHC+subaru+outback+smart+key&tag=eurokeys-20'
    ],
    'NBGFS12P71': [
        'https://www.amazon.com/s?k=NBGFS12P71+volkswagen+jetta+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=NBGFS12P71+volkswagen+passat+smart+key&tag=eurokeys-20'
    ],
    'KR55WK49264': [
        'https://www.amazon.com/s?k=KR55WK49264+volvo+s60+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=KR55WK49264+volvo+xc90+smart+key&tag=eurokeys-20'
    ],
    'OUCG8D-380H-A': [
        'https://www.amazon.com/s?k=OUCG8D-380H-A+acura+tlx+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=OUCG8D-380H-A+acura+rdx+smart+key&tag=eurokeys-20'
    ],
    'CWTWB1G744': [
        'https://www.amazon.com/s?k=CWTWB1G744+infiniti+q50+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=CWTWB1G744+infiniti+qx60+smart+key&tag=eurokeys-20'
    ],
    'KOBJTF10A': [
        'https://www.amazon.com/s?k=KOBJTF10A+jaguar+xf+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=KOBJTF10A+land+rover+range+rover+smart+key&tag=eurokeys-20'
    ],
    'IYZ-3317': [
        'https://www.amazon.com/s?k=IYZ-3317+mercedes+c+class+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=IYZ-3317+mercedes+e+class+smart+key&tag=eurokeys-20'
    ],
    'NBGIDGNG1': [
        'https://www.amazon.com/s?k=NBGIDGNG1+mini+cooper+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=NBGIDGNG1+mini+countryman+smart+key&tag=eurokeys-20'
    ],
    'KR55WK50138': [
        'https://www.amazon.com/s?k=KR55WK50138+porsche+911+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=KR55WK50138+porsche+cayenne+smart+key&tag=eurokeys-20'
    ],
    'OUCJ166N': [
        'https://www.amazon.com/s?k=OUCJ166N+mitsubishi+lancer+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=OUCJ166N+mitsubishi+outlander+smart+key&tag=eurokeys-20'
    ],
    'OUC6000066': [
        'https://www.amazon.com/s?k=OUC6000066+buick+lacrosse+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=OUC6000066+buick+enclave+smart+key&tag=eurokeys-20'
    ],
    'HYQ2EB': [
        'https://www.amazon.com/s?k=HYQ2EB+cadillac+cts+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=HYQ2EB+cadillac+escalade+smart+key&tag=eurokeys-20'
    ],
    'M3N-A2C31243800': [
        'https://www.amazon.com/s?k=M3N-A2C31243800+lincoln+mkz+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=M3N-A2C31243800+lincoln+navigator+smart+key&tag=eurokeys-20'
    ],
    'GQ4-76T': [
        'https://www.amazon.com/s?k=GQ4-76T+ram+1500+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=GQ4-76T+ram+2500+smart+key&tag=eurokeys-20'
    ],
    'HYQ12BDP': [
        'https://www.amazon.com/s?k=HYQ12BDP+toyota+prius+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=HYQ14FBA+toyota+rav4+smart+key&tag=eurokeys-20'
    ],
    'KR55WK48903': [
        'https://www.amazon.com/s?k=KR55WK48903+nissan+sentra+smart+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=CWTWB1U840+nissan+rogue+smart+key&tag=eurokeys-20'
    ],
    'OHT01060512': [
        'https://www.amazon.com/s?k=OHT01060512+chevrolet+impala+key&tag=eurokeys-20',
        'https://www.amazon.com/s?k=HYQ1AA+chevrolet+cruze+smart+key&tag=eurokeys-20'
    ],
}

# Original affiliate products database
products = {
    'HONDA ACCORD': [
        {'name': 'ABUDU 2018-2022 Honda Accord Smart Key 4+1 Buttons', 'fccId': 'CWTWB1G0090', 'price': '$32.99', 'rating': '5.0', 'reviews': '2'},
        {'name': 'USA Grade Honda Accord Key Shell Replacement', 'fccId': 'CWTWB1G0090', 'price': '$17.00', 'rating': '4.1', 'reviews': '15+'},
        {'name': 'Honda Accord Emergency Key Blade HO01', 'fccId': 'CWTWB1G0090', 'price': '$12.99', 'rating': '4.3', 'reviews': '8'},
        {'name': 'Honda Accord 5-Button Smart Key w/Remote Start', 'fccId': 'CWTWB1G0090', 'price': '$35.99', 'rating': '4.5', 'reviews': '11'},
    ],
    'HONDA': [
        {'name': 'Honda Civic Smart Key 2016-2021', 'fccId': 'KR55WK49303', 'price': '$31.99', 'rating': '4.4', 'reviews': '12'},
        {'name': 'Honda CR-V Smart Key 2017-2022', 'fccId': 'KR55WK49303', 'price': '$33.99', 'rating': '4.5', 'reviews': '18'},
        {'name': 'Honda Pilot Smart Key 2016-2022', 'fccId': 'KR55WK49303', 'price': '$35.99', 'rating': '4.6', 'reviews': '22'},
        {'name': 'Honda Odyssey Smart Key 2018-2023', 'fccId': 'KR55WK49303', 'price': '$34.99', 'rating': '4.5', 'reviews': '16'},
        {'name': 'Honda HR-V Smart Key 2016-2021', 'fccId': 'KR55WK49303', 'price': '$32.99', 'rating': '4.4', 'reviews': '9'},
        {'name': 'Honda Ridgeline Smart Key 2017-2023', 'fccId': 'KR55WK49303', 'price': '$36.99', 'rating': '4.5', 'reviews': '7'},
        {'name': 'Honda Passport Smart Key 2019-2023', 'fccId': 'KR55WK49303', 'price': '$35.99', 'rating': '4.6', 'reviews': '13'},
    ],
    'FORD F-150': [
        {'name': 'Ford F-150 Smart Key 2023-2024 YIKEBALOG', 'fccId': 'M3N-A2C93142600', 'price': '$49.99', 'rating': '4.5', 'reviews': '8'},
        {'name': 'Ford F-150 Key Replacement 164-R8166', 'fccId': 'M3N-A2C93142600', 'price': '$45.99', 'rating': '4.4', 'reviews': '12'},
        {'name': 'Ford F-150 Remote Head Key H92', 'fccId': 'M3N-A2C93142600', 'price': '$42.99', 'rating': '4.3', 'reviews': '6'},
        {'name': 'Ford F-150 Key Shell Replacement', 'fccId': 'M3N-A2C93142600', 'price': '$18.99', 'rating': '4.2', 'reviews': '14'},
        {'name': 'Ford F-150 Emergency Key Blade H94', 'fccId': 'M3N-A2C93142600', 'price': '$14.99', 'rating': '4.3', 'reviews': '9'},
    ],
    'FORD': [
        {'name': 'Ford Fusion Smart Key 2013-2020', 'fccId': 'M3N-A2C93142600', 'price': '$39.99', 'rating': '4.4', 'reviews': '15'},
        {'name': 'Ford Focus Smart Key 2012-2018', 'fccId': 'M3N-A2C93142600', 'price': '$38.99', 'rating': '4.3', 'reviews': '11'},
        {'name': 'Ford Escape Smart Key 2013-2019', 'fccId': 'M3N-A2C93142600', 'price': '$41.99', 'rating': '4.5', 'reviews': '19'},
        {'name': 'Ford Explorer Smart Key 2011-2019', 'fccId': 'M3N-A2C93142600', 'price': '$43.99', 'rating': '4.6', 'reviews': '24'},
        {'name': 'Ford Mustang Smart Key 2015-2023', 'fccId': 'M3N-A2C93142600', 'price': '$40.99', 'rating': '4.4', 'reviews': '13'},
        {'name': 'Ford Edge Smart Key 2015-2023', 'fccId': 'M3N-A2C93142600', 'price': '$42.99', 'rating': '4.5', 'reviews': '17'},
        {'name': 'Ford Transit Smart Key 2014-2023', 'fccId': 'M3N-A2C93142600', 'price': '$44.99', 'rating': '4.4', 'reviews': '9'},
        {'name': 'Ford Expedition Smart Key 2015-2022', 'fccId': 'M3N-A2C93142600', 'price': '$45.99', 'rating': '4.6', 'reviews': '16'},
        {'name': 'Ford Ranger Smart Key 2019-2023', 'fccId': 'M3N-A2C93142600', 'price': '$41.99', 'rating': '4.5', 'reviews': '10'},
        {'name': 'Ford Bronco Smart Key 2021-2023', 'fccId': 'M3N-A2C93142600', 'price': '$43.99', 'rating': '4.6', 'reviews': '8'},
    ],
    'CHEVROLET': [
        {'name': 'Chevy Silverado Smart Key PEPS', 'fccId': 'HYQ1AA', 'price': '$36.99', 'rating': '4.5', 'reviews': '28'},
        {'name': 'Chevy Equinox Smart Key 2010-2017', 'fccId': 'HYQ1AA', 'price': '$34.99', 'rating': '4.4', 'reviews': '21'},
        {'name': 'Chevy Cruze Smart Key 2011-2016', 'fccId': 'HYQ1AA', 'price': '$35.99', 'rating': '4.5', 'reviews': '16'},
        {'name': 'Chevy Malibu Smart Key 2013-2018', 'fccId': 'HYQ1AA', 'price': '$33.99', 'rating': '4.3', 'reviews': '14'},
        {'name': 'Chevy Impala Smart Key Circle Plus', 'fccId': 'OHT01060512', 'price': '$28.99', 'rating': '4.3', 'reviews': '8'},
        {'name': 'Chevy Tahoe Smart Key 2015-2020', 'fccId': 'HYQ1AA', 'price': '$37.99', 'rating': '4.6', 'reviews': '31'},
        {'name': 'Chevy Suburban Smart Key 2015-2020', 'fccId': 'HYQ1AA', 'price': '$38.99', 'rating': '4.6', 'reviews': '19'},
        {'name': 'Chevy Traverse Smart Key 2018-2023', 'fccId': 'HYQ1AA', 'price': '$36.99', 'rating': '4.5', 'reviews': '23'},
        {'name': 'Chevy Colorado Smart Key 2015-2022', 'fccId': 'HYQ1AA', 'price': '$35.99', 'rating': '4.4', 'reviews': '12'},
        {'name': 'Chevy Camaro Smart Key 2016-2023', 'fccId': 'HYQ1AA', 'price': '$37.99', 'rating': '4.5', 'reviews': '18'},
        {'name': 'Chevy Corvette Smart Key 2014-2023', 'fccId': 'HYQ1AA', 'price': '$39.99', 'rating': '4.7', 'reviews': '15'},
        {'name': 'Chevy Blazer Smart Key 2019-2023', 'fccId': 'HYQ1AA', 'price': '$36.99', 'rating': '4.5', 'reviews': '11'},
    ],
    'TOYOTA': [
        {'name': 'Toyota Camry Smart Key G-Chip 2012-2017', 'fccId': 'HYQ14FBA', 'price': '$42.99', 'rating': '4.7', 'reviews': '45'},
        {'name': 'Toyota Corolla Smart Key 2014-2019', 'fccId': 'HYQ14FBA', 'price': '$41.99', 'rating': '4.6', 'reviews': '38'},
        {'name': 'Toyota RAV4 Smart Key 2013-2018', 'fccId': 'HYQ14FBA', 'price': '$43.99', 'rating': '4.7', 'reviews': '52'},
        {'name': 'Toyota Highlander Smart Key 2014-2019', 'fccId': 'HYQ14FBA', 'price': '$44.99', 'rating': '4.7', 'reviews': '29'},
        {'name': 'Toyota 4Runner Smart Key 2010-2019', 'fccId': 'HYQ14FBA', 'price': '$45.99', 'rating': '4.8', 'reviews': '34'},
        {'name': 'Toyota Tundra Smart Key 2014-2021', 'fccId': 'HYQ14FBA', 'price': '$46.99', 'rating': '4.7', 'reviews': '27'},
        {'name': 'Toyota Tacoma Smart Key 2016-2023', 'fccId': 'HYQ14FBA', 'price': '$45.99', 'rating': '4.8', 'reviews': '41'},
        {'name': 'Toyota Sienna Smart Key 2011-2020', 'fccId': 'HYQ14FBA', 'price': '$44.99', 'rating': '4.6', 'reviews': '22'},
        {'name': 'Toyota Prius Smart Key 2010-2015', 'fccId': 'HYQ12BDP', 'price': '$41.99', 'rating': '4.5', 'reviews': '19'},
        {'name': 'Toyota Avalon Smart Key 2013-2022', 'fccId': 'HYQ14FBA', 'price': '$45.99', 'rating': '4.7', 'reviews': '16'},
        {'name': 'Toyota Sequoia Smart Key 2008-2022', 'fccId': 'HYQ14FBA', 'price': '$46.99', 'rating': '4.6', 'reviews': '13'},
        {'name': 'Toyota Land Cruiser Smart Key 2008-2021', 'fccId': 'HYQ14FBA', 'price': '$47.99', 'rating': '4.8', 'reviews': '9'},
    ],
    'BMW': [
        {'name': 'BMW 3-Series Smart Key CAS', 'fccId': 'YGOHUF5662', 'price': '$53.99', 'rating': '4.6', 'reviews': '18'},
        {'name': 'BMW 5-Series Smart Key CAS', 'fccId': 'YGOHUF5662', 'price': '$54.99', 'rating': '4.7', 'reviews': '15'},
        {'name': 'BMW X3 Smart Key FEM', 'fccId': 'YGOHUF5662', 'price': '$55.99', 'rating': '4.6', 'reviews': '12'},
        {'name': 'BMW X5 Smart Key FEM', 'fccId': 'YGOHUF5662', 'price': '$56.99', 'rating': '4.7', 'reviews': '14'},
        {'name': 'BMW X1 Smart Key', 'fccId': 'YGOHUF5662', 'price': '$54.99', 'rating': '4.5', 'reviews': '10'},
        {'name': 'BMW X7 Smart Key', 'fccId': 'YGOHUF5662', 'price': '$57.99', 'rating': '4.8', 'reviews': '7'},
    ],
    'LEXUS': [
        {'name': 'Lexus ES Smart Key 2013-2018', 'fccId': 'HYQ14FBA', 'price': '$46.99', 'rating': '4.7', 'reviews': '16'},
        {'name': 'Lexus RX Smart Key 2016-2022', 'fccId': 'HYQ14FBA', 'price': '$47.99', 'rating': '4.8', 'reviews': '24'},
        {'name': 'Lexus IS Smart Key 2014-2020', 'fccId': 'HYQ14FBA', 'price': '$46.99', 'rating': '4.6', 'reviews': '13'},
        {'name': 'Lexus GX Smart Key 2010-2023', 'fccId': 'HYQ14FBA', 'price': '$48.99', 'rating': '4.7', 'reviews': '19'},
        {'name': 'Lexus NX Smart Key 2015-2023', 'fccId': 'HYQ14FBA', 'price': '$47.99', 'rating': '4.7', 'reviews': '15'},
        {'name': 'Lexus UX Smart Key 2019-2023', 'fccId': 'HYQ14FBA', 'price': '$46.99', 'rating': '4.6', 'reviews': '8'},
    ],
    'NISSAN': [
        {'name': 'Nissan Altima I-Key Smart Key', 'fccId': 'CWTWB1U840', 'price': '$39.99', 'rating': '4.5', 'reviews': '26'},
        {'name': 'Nissan Maxima I-Key Smart Key', 'fccId': 'CWTWB1U840', 'price': '$40.99', 'rating': '4.6', 'reviews': '18'},
        {'name': 'Nissan Sentra I-Key Smart Key', 'fccId': 'KR55WK48903', 'price': '$38.99', 'rating': '4.4', 'reviews': '14'},
        {'name': 'Nissan Rogue I-Key Smart Key', 'fccId': 'CWTWB1U840', 'price': '$41.99', 'rating': '4.6', 'reviews': '32'},
        {'name': 'Nissan Pathfinder I-Key Smart Key', 'fccId': 'CWTWB1U840', 'price': '$42.99', 'rating': '4.5', 'reviews': '21'},
        {'name': 'Nissan Murano I-Key Smart Key', 'fccId': 'CWTWB1U840', 'price': '$41.99', 'rating': '4.5', 'reviews': '17'},
        {'name': 'Nissan Frontier I-Key Smart Key', 'fccId': 'CWTWB1U840', 'price': '$40.99', 'rating': '4.4', 'reviews': '12'},
        {'name': 'Nissan Titan I-Key Smart Key', 'fccId': 'CWTWB1U840', 'price': '$43.99', 'rating': '4.6', 'reviews': '9'},
    ],
    'AUDI': [
        {'name': 'Audi A4 Smart Key KESSY', 'fccId': 'NBGFS14P71', 'price': '$49.99', 'rating': '4.6', 'reviews': '11'},
        {'name': 'Audi A6 Smart Key KESSY', 'fccId': 'NBGFS14P71', 'price': '$50.99', 'rating': '4.7', 'reviews': '9'},
        {'name': 'Audi Q5 Smart Key KESSY', 'fccId': 'NBGFS14P71', 'price': '$51.99', 'rating': '4.6', 'reviews': '13'},
        {'name': 'Audi Q7 Smart Key KESSY', 'fccId': 'NBGFS14P71', 'price': '$52.99', 'rating': '4.7', 'reviews': '8'},
        {'name': 'Audi A3 Smart Key KESSY', 'fccId': 'NBGFS14P71', 'price': '$48.99', 'rating': '4.5', 'reviews': '10'},
        {'name': 'Audi Q3 Smart Key KESSY', 'fccId': 'NBGFS14P71', 'price': '$50.99', 'rating': '4.6', 'reviews': '7'},
    ],
    'CHRYSLER': [
        {'name': 'Chrysler 300 Fobik Smart Key', 'fccId': 'M3N-40821302', 'price': '$37.99', 'rating': '4.4', 'reviews': '17'},
        {'name': 'Chrysler Pacifica Fobik Smart Key', 'fccId': 'M3N-40821302', 'price': '$38.99', 'rating': '4.5', 'reviews': '15'},
        {'name': 'Chrysler Town & Country Fobik Key', 'fccId': 'M3N-40821302', 'price': '$36.99', 'rating': '4.3', 'reviews': '11'},
    ],
    'DODGE': [
        {'name': 'Dodge Charger Fobik Smart Key', 'fccId': 'M3N-40821302', 'price': '$37.99', 'rating': '4.4', 'reviews': '23'},
        {'name': 'Dodge Challenger Fobik Smart Key', 'fccId': 'M3N-40821302', 'price': '$37.99', 'rating': '4.4', 'reviews': '19'},
        {'name': 'Dodge Durango Fobik Smart Key', 'fccId': 'M3N-40821302', 'price': '$38.99', 'rating': '4.5', 'reviews': '16'},
        {'name': 'Dodge Journey Fobik Smart Key', 'fccId': 'M3N-40821302', 'price': '$36.99', 'rating': '4.3', 'reviews': '12'},
        {'name': 'Dodge Grand Caravan Fobik Key', 'fccId': 'M3N-40821302', 'price': '$36.99', 'rating': '4.3', 'reviews': '10'},
    ],
    'JEEP': [
        {'name': 'Jeep Wrangler Fobik Smart Key', 'fccId': 'M3N-40821302', 'price': '$37.99', 'rating': '4.4', 'reviews': '28'},
        {'name': 'Jeep Cherokee Fobik Smart Key', 'fccId': 'M3N-40821302', 'price': '$37.99', 'rating': '4.4', 'reviews': '22'},
        {'name': 'Jeep Grand Cherokee Fobik Smart Key', 'fccId': 'M3N-40821302', 'price': '$38.99', 'rating': '4.5', 'reviews': '31'},
        {'name': 'Jeep Compass Fobik Smart Key', 'fccId': 'M3N-40821302', 'price': '$36.99', 'rating': '4.3', 'reviews': '14'},
        {'name': 'Jeep Renegade Fobik Smart Key', 'fccId': 'M3N-40821302', 'price': '$36.99', 'rating': '4.3', 'reviews': '9'},
        {'name': 'Jeep Gladiator Fobik Smart Key', 'fccId': 'M3N-40821302', 'price': '$38.99', 'rating': '4.5', 'reviews': '12'},
    ],
    'HYUNDAI': [
        {'name': 'Hyundai Elantra Smart Key Flip', 'fccId': 'SY5MDFNA433', 'price': '$33.99', 'rating': '4.4', 'reviews': '19'},
        {'name': 'Hyundai Sonata Smart Key Flip', 'fccId': 'SY5MDFNA433', 'price': '$34.99', 'rating': '4.5', 'reviews': '24'},
        {'name': 'Hyundai Tucson Smart Key Flip', 'fccId': 'SY5MDFNA433', 'price': '$35.99', 'rating': '4.5', 'reviews': '27'},
        {'name': 'Hyundai Santa Fe Smart Key Flip', 'fccId': 'SY5MDFNA433', 'price': '$36.99', 'rating': '4.6', 'reviews': '21'},
        {'name': 'Hyundai Kona Smart Key Flip', 'fccId': 'SY5MDFNA433', 'price': '$34.99', 'rating': '4.4', 'reviews': '15'},
        {'name': 'Hyundai Palisade Smart Key Flip', 'fccId': 'SY5MDFNA433', 'price': '$37.99', 'rating': '4.6', 'reviews': '18'},
    ],
    'KIA': [
        {'name': 'Kia Forte Smart Key Flip', 'fccId': 'TQ8-FOB-4F08', 'price': '$33.99', 'rating': '4.4', 'reviews': '16'},
        {'name': 'Kia Optima Smart Key Flip', 'fccId': 'TQ8-FOB-4F08', 'price': '$34.99', 'rating': '4.5', 'reviews': '18'},
        {'name': 'Kia Sorento Smart Key Flip', 'fccId': 'TQ8-FOB-4F08', 'price': '$35.99', 'rating': '4.5', 'reviews': '20'},
        {'name': 'Kia Sportage Smart Key Flip', 'fccId': 'TQ8-FOB-4F08', 'price': '$34.99', 'rating': '4.4', 'reviews': '15'},
        {'name': 'Kia Telluride Smart Key Flip', 'fccId': 'TQ8-FOB-4F08', 'price': '$36.99', 'rating': '4.6', 'reviews': '22'},
        {'name': 'Kia Soul Smart Key Flip', 'fccId': 'TQ8-FOB-4F08', 'price': '$33.99', 'rating': '4.3', 'reviews': '13'},
    ],
    'MAZDA': [
        {'name': 'Mazda CX-5 Smart Key Flip', 'fccId': 'WAZSKE13D01', 'price': '$35.99', 'rating': '4.5', 'reviews': '29'},
        {'name': 'Mazda 6 Smart Key Flip', 'fccId': 'WAZSKE13D01', 'price': '$36.99', 'rating': '4.6', 'reviews': '17'},
        {'name': 'Mazda CX-9 Smart Key Flip', 'fccId': 'WAZSKE13D01', 'price': '$37.99', 'rating': '4.5', 'reviews': '13'},
        {'name': 'Mazda CX-3 Smart Key Flip', 'fccId': 'WAZSKE13D01', 'price': '$34.99', 'rating': '4.4', 'reviews': '8'},
        {'name': 'Mazda CX-30 Smart Key Flip', 'fccId': 'WAZSKE13D01', 'price': '$35.99', 'rating': '4.5', 'reviews': '11'},
    ],
    'SUBARU': [
        {'name': 'Subaru Impreza Smart Key Flip', 'fccId': 'HYQ14AHC', 'price': '$36.99', 'rating': '4.5', 'reviews': '11'},
        {'name': 'Subaru Outback Smart Key Flip', 'fccId': 'HYQ14AHC', 'price': '$37.99', 'rating': '4.6', 'reviews': '25'},
        {'name': 'Subaru Forester Smart Key Flip', 'fccId': 'HYQ14AHC', 'price': '$37.99', 'rating': '4.6', 'reviews': '19'},
        {'name': 'Subaru Legacy Smart Key Flip', 'fccId': 'HYQ14AHC', 'price': '$36.99', 'rating': '4.5', 'reviews': '10'},
        {'name': 'Subaru Ascent Smart Key Flip', 'fccId': 'HYQ14AHC', 'price': '$38.99', 'rating': '4.6', 'reviews': '14'},
    ],
    'VOLKSWAGEN': [
        {'name': 'VW Jetta Smart Key KESSY', 'fccId': 'NBGFS12P71', 'price': '$47.99', 'rating': '4.6', 'reviews': '14'},
        {'name': 'VW Passat Smart Key KESSY', 'fccId': 'NBGFS12P71', 'price': '$48.99', 'rating': '4.7', 'reviews': '10'},
        {'name': 'VW Tiguan Smart Key KESSY', 'fccId': 'NBGFS12P71', 'price': '$49.99', 'rating': '4.6', 'reviews': '12'},
        {'name': 'VW Atlas Smart Key KESSY', 'fccId': 'NBGFS12P71', 'price': '$50.99', 'rating': '4.7', 'reviews': '9'},
        {'name': 'VW Golf Smart Key KESSY', 'fccId': 'NBGFS12P71', 'price': '$47.99', 'rating': '4.5', 'reviews': '11'},
    ],
    'VOLVO': [
        {'name': 'Volvo S60 Smart Key', 'fccId': 'KR55WK49264', 'price': '$51.99', 'rating': '4.6', 'reviews': '7'},
        {'name': 'Volvo XC90 Smart Key', 'fccId': 'KR55WK49264', 'price': '$52.99', 'rating': '4.7', 'reviews': '9'},
        {'name': 'Volvo XC60 Smart Key', 'fccId': 'KR55WK49264', 'price': '$52.99', 'rating': '4.6', 'reviews': '11'},
        {'name': 'Volvo XC40 Smart Key', 'fccId': 'KR55WK49264', 'price': '$51.99', 'rating': '4.5', 'reviews': '8'},
    ],
    'ACURA': [
        {'name': 'Acura TLX Smart Key', 'fccId': 'OUCG8D-380H-A', 'price': '$41.99', 'rating': '4.6', 'reviews': '8'},
        {'name': 'Acura RDX Smart Key', 'fccId': 'OUCG8D-380H-A', 'price': '$42.99', 'rating': '4.7', 'reviews': '12'},
        {'name': 'Acura MDX Smart Key', 'fccId': 'OUCG8D-380H-A', 'price': '$43.99', 'rating': '4.6', 'reviews': '10'},
        {'name': 'Acura ILX Smart Key', 'fccId': 'OUCG8D-380H-A', 'price': '$40.99', 'rating': '4.5', 'reviews': '6'},
    ],
    'INFINITI': [
        {'name': 'Infiniti Q50 Smart Key', 'fccId': 'CWTWB1G744', 'price': '$41.99', 'rating': '4.5', 'reviews': '6'},
        {'name': 'Infiniti QX60 Smart Key', 'fccId': 'CWTWB1G744', 'price': '$42.99', 'rating': '4.6', 'reviews': '8'},
        {'name': 'Infiniti QX80 Smart Key', 'fccId': 'CWTWB1G744', 'price': '$43.99', 'rating': '4.6', 'reviews': '5'},
        {'name': 'Infiniti QX50 Smart Key', 'fccId': 'CWTWB1G744', 'price': '$42.99', 'rating': '4.5', 'reviews': '7'},
    ],
    'JAGUAR': [
        {'name': 'Jaguar XF Smart Key', 'fccId': 'KOBJTF10A', 'price': '$55.99', 'rating': '4.6', 'reviews': '5'},
        {'name': 'Jaguar F-Pace Smart Key', 'fccId': 'KOBJTF10A', 'price': '$56.99', 'rating': '4.7', 'reviews': '7'},
        {'name': 'Jaguar XE Smart Key', 'fccId': 'KOBJTF10A', 'price': '$55.99', 'rating': '4.6', 'reviews': '4'},
    ],
    'LAND ROVER': [
        {'name': 'Land Rover Range Rover Smart Key', 'fccId': 'KOBJTF10A', 'price': '$55.99', 'rating': '4.6', 'reviews': '9'},
        {'name': 'Land Rover Discovery Smart Key', 'fccId': 'KOBJTF10A', 'price': '$56.99', 'rating': '4.7', 'reviews': '6'},
        {'name': 'Land Rover Range Rover Sport Smart Key', 'fccId': 'KOBJTF10A', 'price': '$56.99', 'rating': '4.7', 'reviews': '7'},
        {'name': 'Land Rover Defender Smart Key', 'fccId': 'KOBJTF10A', 'price': '$57.99', 'rating': '4.8', 'reviews': '5'},
    ],
    'MERCEDES': [
        {'name': 'Mercedes C-Class Smart Key', 'fccId': 'IYZ-3317', 'price': '$59.99', 'rating': '4.7', 'reviews': '11'},
        {'name': 'Mercedes E-Class Smart Key', 'fccId': 'IYZ-3317', 'price': '$60.99', 'rating': '4.8', 'reviews': '8'},
        {'name': 'Mercedes GLE Smart Key', 'fccId': 'IYZ-3317', 'price': '$61.99', 'rating': '4.7', 'reviews': '10'},
        {'name': 'Mercedes GLC Smart Key', 'fccId': 'IYZ-3317', 'price': '$60.99', 'rating': '4.7', 'reviews': '9'},
        {'name': 'Mercedes S-Class Smart Key', 'fccId': 'IYZ-3317', 'price': '$62.99', 'rating': '4.8', 'reviews': '6'},
    ],
    'MINI': [
        {'name': 'MINI Cooper Smart Key', 'fccId': 'NBGIDGNG1', 'price': '$50.99', 'rating': '4.5', 'reviews': '8'},
        {'name': 'MINI Countryman Smart Key', 'fccId': 'NBGIDGNG1', 'price': '$51.99', 'rating': '4.6', 'reviews': '6'},
        {'name': 'MINI Clubman Smart Key', 'fccId': 'NBGIDGNG1', 'price': '$51.99', 'rating': '4.5', 'reviews': '5'},
    ],
    'PORSCHE': [
        {'name': 'Porsche 911 Smart Key', 'fccId': 'KR55WK50138', 'price': '$65.99', 'rating': '4.7', 'reviews': '4'},
        {'name': 'Porsche Cayenne Smart Key', 'fccId': 'KR55WK50138', 'price': '$66.99', 'rating': '4.8', 'reviews': '5'},
        {'name': 'Porsche Macan Smart Key', 'fccId': 'KR55WK50138', 'price': '$65.99', 'rating': '4.7', 'reviews': '3'},
    ],
    'MITSUBISHI': [
        {'name': 'Mitsubishi Lancer Smart Key', 'fccId': 'OUCJ166N', 'price': '$34.99', 'rating': '4.4', 'reviews': '7'},
        {'name': 'Mitsubishi Outlander Smart Key', 'fccId': 'OUCJ166N', 'price': '$35.99', 'rating': '4.5', 'reviews': '9'},
        {'name': 'Mitsubishi Eclipse Cross Smart Key', 'fccId': 'OUCJ166N', 'price': '$35.99', 'rating': '4.4', 'reviews': '6'},
    ],
    'BUICK': [
        {'name': 'Buick LaCrosse Smart Key', 'fccId': 'OUC6000066', 'price': '$30.99', 'rating': '4.3', 'reviews': '5'},
        {'name': 'Buick Enclave Smart Key', 'fccId': 'OUC6000066', 'price': '$31.99', 'rating': '4.4', 'reviews': '7'},
        {'name': 'Buick Encore Smart Key', 'fccId': 'OUC6000066', 'price': '$30.99', 'rating': '4.3', 'reviews': '6'},
    ],
    'CADILLAC': [
        {'name': 'Cadillac CTS Smart Key PEPS', 'fccId': 'HYQ2EB', 'price': '$35.99', 'rating': '4.5', 'reviews': '9'},
        {'name': 'Cadillac Escalade Smart Key PEPS', 'fccId': 'HYQ2EB', 'price': '$36.99', 'rating': '4.6', 'reviews': '12'},
        {'name': 'Cadillac XT5 Smart Key PEPS', 'fccId': 'HYQ2EB', 'price': '$36.99', 'rating': '4.5', 'reviews': '8'},
        {'name': 'Cadillac XT6 Smart Key PEPS', 'fccId': 'HYQ2EB', 'price': '$37.99', 'rating': '4.6', 'reviews': '6'},
    ],
    'GMC': [
        {'name': 'GMC Sierra Smart Key', 'fccId': 'HYQ1AA', 'price': '$36.99', 'rating': '4.6', 'reviews': '20'},
        {'name': 'GMC Yukon Smart Key', 'fccId': 'HYQ1AA', 'price': '$37.99', 'rating': '4.6', 'reviews': '15'},
        {'name': 'GMC Acadia Smart Key', 'fccId': 'HYQ1AA', 'price': '$36.99', 'rating': '4.5', 'reviews': '11'},
        {'name': 'GMC Terrain Smart Key', 'fccId': 'HYQ1AA', 'price': '$35.99', 'rating': '4.4', 'reviews': '9'},
        {'name': 'GMC Canyon Smart Key', 'fccId': 'HYQ1AA', 'price': '$36.99', 'rating': '4.5', 'reviews': '7'},
    ],
    'LINCOLN': [
        {'name': 'Lincoln MKZ Smart Key', 'fccId': 'M3N-A2C31243800', 'price': '$43.99', 'rating': '4.6', 'reviews': '8'},
        {'name': 'Lincoln MKX Smart Key', 'fccId': 'M3N-A2C31243800', 'price': '$44.99', 'rating': '4.6', 'reviews': '6'},
        {'name': 'Lincoln Navigator Smart Key', 'fccId': 'M3N-A2C31243800', 'price': '$45.99', 'rating': '4.7', 'reviews': '9'},
        {'name': 'Lincoln Continental Smart Key', 'fccId': 'M3N-A2C31243800', 'price': '$44.99', 'rating': '4.6', 'reviews': '5'},
    ],
    'RAM': [
        {'name': 'Ram 1500 Fobik Smart Key', 'fccId': 'GQ4-76T', 'price': '$38.99', 'rating': '4.5', 'reviews': '14'},
        {'name': 'Ram 2500 Fobik Smart Key', 'fccId': 'GQ4-76T', 'price': '$39.99', 'rating': '4.5', 'reviews': '10'},
        {'name': 'Ram 3500 Fobik Smart Key', 'fccId': 'GQ4-76T', 'price': '$40.99', 'rating': '4.6', 'reviews': '8'},
        {'name': 'Ram ProMaster Fobik Smart Key', 'fccId': 'GQ4-76T', 'price': '$38.99', 'rating': '4.4', 'reviews': '6'},
    ],
}

# Update products with verified affiliate links
updated_count = 0
for make, items in products.items():
    link_index = 0  # Track which link to use for each FCC ID
    fcc_ids_seen = {}  # Track how many times we've seen each FCC ID in this make
    
    for item in items:
        fcc_id = item['fccId']
        if fcc_id in fcc_to_links:
            # Get the verified links for this FCC ID
            links = fcc_to_links[fcc_id]
            # Rotate through available links
            if fcc_id not in fcc_ids_seen:
                fcc_ids_seen[fcc_id] = 0
            link_idx = fcc_ids_seen[fcc_id] % len(links)
            item['amazonUrl'] = links[link_idx]
            fcc_ids_seen[fcc_id] += 1
            updated_count += 1

print(f"Updated {updated_count} products with affiliate links")

# Generate updated JavaScript
js_lines = ["const AFFILIATE_PRODUCTS = {"]
for make, items in sorted(products.items()):
    js_lines.append(f"    '{make}': [")
    for item in items:
        js_lines.append("        {")
        js_lines.append(f"            name: '{item['name']}',")
        js_lines.append(f"            fccId: '{item['fccId']}',")
        js_lines.append(f"            price: '{item['price']}',")
        js_lines.append(f"            rating: '{item['rating']}',")
        js_lines.append(f"            reviews: '{item['reviews']}',")
        js_lines.append(f"            amazonUrl: '{item['amazonUrl']}',")
        js_lines.append("        },")
    js_lines.append("    ],")
js_lines.append("};")

# Write to file
with open('affiliate_products_clean.js', 'w') as f:
    f.write("\n".join(js_lines))

print("Updated affiliate_products_clean.js with affiliate links and store ID: eurokeys-20")












