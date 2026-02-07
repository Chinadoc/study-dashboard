// ============================================
// AKS Image Migration Script  
// ============================================
// Paste this in your browser console while on americankeysupply.com
// It downloads each missing image via fetch() (uses your browser's CF clearance)
// and POSTs it to our R2 upload endpoint.

const WORKER = "https://euro-keys.jeremy-samuels17.workers.dev";
const AUTH_KEY = "aks-migrate-2026";
const CONCURRENCY = 3;
const DELAY_MS = 500;

// [item_number, image_url, r2_key]
const MISSING = [
  ["10090", "https://images.americankeysupply.com/resize/276/10090_BRK-SK-CHR-14_022022.jpg", "aks-products/10090_BRK-SK-CHR-14_022022.jpg"],
  ["10800", "https://images.americankeysupply.com/resize/276/10800_HYU-95440-J3000_012022.jpg", "aks-products/10800_HYU-95440-J3000_012022.jpg"],
  ["1090", "https://images.americankeysupply.com/resize/276/3028_BRK-CHP-09_092020.jpg", "aks-products/3028_BRK-CHP-09_092020.jpg"],
  ["10922", "https://images.americankeysupply.com/resize/276/10922-STR-5938211_1000x1000.jpg", "aks-products/10922-STR-5938211_1000x1000.jpg"],
  ["1093", "https://images.americankeysupply.com/resize/276/589_BRK-CHP-29_092020.jpg", "aks-products/589_BRK-CHP-29_092020.jpg"],
  ["1095", "https://images.americankeysupply.com/resize/276/425_BRK-CHP-05-4_092020.jpg", "aks-products/425_BRK-CHP-05-4_092020.jpg"],
  ["1122", "https://images.americankeysupply.com/resize/276/1122-JMA-TP00GM-27.P-102020.jpg", "aks-products/1122-JMA-TP00GM-27.P-102020.jpg"],
  ["11417", "https://images.americankeysupply.com/resize/276/11417_HYU-95430-2S201-B_022022-2.jpg", "aks-products/11417_HYU-95430-2S201-B_022022-2.jpg"],
  ["11457", "https://images.americankeysupply.com/resize/276/11457_CHR-68105078AG-RS_112021.jpg", "aks-products/11457_CHR-68105078AG-RS_112021.jpg"],
  ["1148", "https://images.americankeysupply.com/resize/276/1148-ILC-H59-112020.jpg", "aks-products/1148-ILC-H59-112020.jpg"],
  ["11496", "https://images.americankeysupply.com/resize/276/11496_HYU-95440-F2002_012022.jpg", "aks-products/11496_HYU-95440-F2002_012022.jpg"],
  ["11512", "https://images.americankeysupply.com/resize/276/11512_HYU-95440-K9000_012022.jpg", "aks-products/11512_HYU-95440-K9000_012022.jpg"],
  ["11599", "https://images.americankeysupply.com/resize/276/11599_HYU-95440-3N470_012022.jpg", "aks-products/11599_HYU-95440-3N470_012022.jpg"],
  ["11637", "https://images.americankeysupply.com/resize/276/11637_BRK-FB-CHR-17_062021.jpg", "aks-products/11637_BRK-FB-CHR-17_062021.jpg"],
  ["11747", "https://images.americankeysupply.com/resize/276/11747-BRK-SKS-TOY-03-112020.jpg", "aks-products/11747-BRK-SKS-TOY-03-112020.jpg"],
  ["11749", "https://images.americankeysupply.com/resize/276/11749-BRK-SKS-TOY-04-112020.jpg", "aks-products/11749-BRK-SKS-TOY-04-112020.jpg"],
  ["11754", "https://images.americankeysupply.com/resize/276/11754-BRK-SKS-TOY-05-112020.jpg", "aks-products/11754-BRK-SKS-TOY-05-112020.jpg"],
  ["11764", "https://images.americankeysupply.com/resize/276/11764-BRK-RMS-GM-01.4.2-102020.jpg", "aks-products/11764-BRK-RMS-GM-01.4.2-102020.jpg"],
  ["11792", "https://images.americankeysupply.com/resize/276/11792_BRK-SK-TOY-23-BLK_020525_JK - 1.jpg", "aks-products/11792_BRK-SK-TOY-23-BLK_020525_JK - 1.jpg"],
  ["11853", "https://images.americankeysupply.com/resize/276/9257_FOR-164-R8162-B_122021.jpg", "aks-products/9257_FOR-164-R8162-B_122021.jpg"],
  ["11898", "https://images.americankeysupply.com/resize/276/11898_ACU-72147-SEP-A62-RS_122021.jpg", "aks-products/11898_ACU-72147-SEP-A62-RS_122021.jpg"],
  ["11923", "https://images.americankeysupply.com/resize/276/11923 NO LOGO.png", "aks-products/11923 NO LOGO.png"],
  ["12015", "https://images.americankeysupply.com/resize/276/12015_RAM-56046956AG-HITAG-RS_012022.jpg", "aks-products/12015_RAM-56046956AG-HITAG-RS_012022.jpg"],
  ["12091", "https://images.americankeysupply.com/resize/276/12091_BRK-SK-CHR-18_022725_JK.jpg", "aks-products/12091_BRK-SK-CHR-18_022725_JK.jpg"],
  ["12093", "https://images.americankeysupply.com/resize/276/6440_ILC-Y170-PT_082020.jpg", "aks-products/6440_ILC-Y170-PT_082020.jpg"],
  ["12095", "https://images.americankeysupply.com/resize/276/12095_CHR-68143502AC-RS_012022.jpg", "aks-products/12095_CHR-68143502AC-RS_012022.jpg"],
  ["12183", "https://images.americankeysupply.com/resize/276/12700_KIA-95440-1U500-C_022022.jpg", "aks-products/12700_KIA-95440-1U500-C_022022.jpg"],
  ["12221", "https://images.americankeysupply.com/resize/276/12221 NO LOGO.png", "aks-products/12221 NO LOGO.png"],
  ["12250", "https://images.americankeysupply.com/resize/276/9659_FOR-164-R8197-B_012022.jpg", "aks-products/9659_FOR-164-R8197-B_012022.jpg"],
  ["12274", "https://images.americankeysupply.com/resize/276/12274.jpg", "aks-products/12274.jpg"],
  ["12389", "https://images.americankeysupply.com/resize/276/12389_BRK-SKS-ACU-01_100924_JK.jpg", "aks-products/12389_BRK-SKS-ACU-01_100924_JK.jpg"],
  ["12398", "https://images.americankeysupply.com/resize/276/12398_BRK-SKS-INF-01_120924_JK.jpg", "aks-products/12398_BRK-SKS-INF-01_120924_JK.jpg"],
  ["12403", "https://images.americankeysupply.com/resize/276/12403_BRK-SKS-INF-03_120924_JK.jpg", "aks-products/12403_BRK-SKS-INF-03_120924_JK.jpg"],
  ["12482", "https://images.americankeysupply.com/resize/276/5785_GM-21997127-RS_022022.jpg", "aks-products/5785_GM-21997127-RS_022022.jpg"],
  ["12502", "https://images.americankeysupply.com/resize/276/13017_NIS-285E3-JA05A-RS_112021.jpg", "aks-products/13017_NIS-285E3-JA05A-RS_112021.jpg"],
  ["12548", "https://images.americankeysupply.com/resize/276/12548_CHR-68143504AC-RFB-A_012023.jpg", "aks-products/12548_CHR-68143504AC-RFB-A_012023.jpg"],
  ["1255", "https://images.americankeysupply.com/resize/276/1255_INF-285E3-EH12A-RS_042022.jpg", "aks-products/1255_INF-285E3-EH12A-RS_042022.jpg"],
  ["12566", "https://images.americankeysupply.com/resize/276/12566_ACU-35113-TK4-A00-MEM1-RS_032022.jpg", "aks-products/12566_ACU-35113-TK4-A00-MEM1-RS_032022.jpg"],
  ["12618", "https://images.americankeysupply.com/resize/276/12618_JEP-68141580AG-RS_022022.jpg", "aks-products/12618_JEP-68141580AG-RS_022022.jpg"],
  ["12642", "https://images.americankeysupply.com/resize/276/12642_INF-285E3-6HE6A_012022.jpg", "aks-products/12642_INF-285E3-6HE6A_012022.jpg"],
  ["12683", "https://images.americankeysupply.com/resize/276/12683_BRK-RH-HYU-03_042021.jpg", "aks-products/12683_BRK-RH-HYU-03_042021.jpg"],
  ["12691", "https://images.americankeysupply.com/resize/276/12691_BRK-RM-HYU-17_012022.jpg", "aks-products/12691_BRK-RM-HYU-17_012022.jpg"],
  ["12726", "https://images.americankeysupply.com/resize/276/12726(corrected)_STR-5922035_2142022.jpg", "aks-products/12726(corrected)_STR-5922035_2142022.jpg"],
  ["12732", "https://images.americankeysupply.com/resize/276/14359_MAZ-TDY2-67-5RYA-RS_122021.jpg", "aks-products/14359_MAZ-TDY2-67-5RYA-RS_122021.jpg"],
  ["12745", "https://images.americankeysupply.com/resize/276/12745_OLS-2IN1-HON2020_053024_JK.jpg", "aks-products/12745_OLS-2IN1-HON2020_053024_JK.jpg"],
  ["12747", "https://images.americankeysupply.com/resize/276/12747_ STR-5941425_020624SH.jpg", "aks-products/12747_ STR-5941425_020624SH.jpg"],
  ["12761", "https://images.americankeysupply.com/resize/276/12761_ STR-5941439_102423SH.jpg", "aks-products/12761_ STR-5941439_102423SH.jpg"],
  ["12769", "https://images.americankeysupply.com/resize/276/12769_STR-5941417_082021.jpg", "aks-products/12769_STR-5941417_082021.jpg"],
  ["12773", "https://images.americankeysupply.com/resize/276/12773_STR-5941416_082021.jpg", "aks-products/12773_STR-5941416_082021.jpg"],
  ["12835", "https://images.americankeysupply.com/resize/276/12835_BRK-FBS-CHR-07LG_012022.jpg", "aks-products/12835_BRK-FBS-CHR-07LG_012022.jpg"],
  ["13070", "https://images.americankeysupply.com/resize/276/13070_ACU-72147-S0K-A13-MEM1-RS_032022.jpg", "aks-products/13070_ACU-72147-S0K-A13-MEM1-RS_032022.jpg"],
  ["13109", "https://images.americankeysupply.com/resize/276/13109_ACU-72147-S0K-A13-MEM2-RS_032022.jpg", "aks-products/13109_ACU-72147-S0K-A13-MEM2-RS_032022.jpg"],
  ["13136", "https://images.americankeysupply.com/resize/276/13136_BRK-SK-BMW-10_042022.jpg", "aks-products/13136_BRK-SK-BMW-10_042022.jpg"],
  ["13181", "https://images.americankeysupply.com/resize/276/14416_BRK-RH-KIA-02_102021.jpg", "aks-products/14416_BRK-RH-KIA-02_102021.jpg"],
  ["13204", "https://images.americankeysupply.com/resize/276/13204_INF-285E3-1LA5A-C_042022.jpg", "aks-products/13204_INF-285E3-1LA5A-C_042022.jpg"],
  ["13208", "https://images.americankeysupply.com/resize/276/13208_CHR-68394195AA-AES-RS_022022.jpg", "aks-products/13208_CHR-68394195AA-AES-RS_022022.jpg"],
  ["13267", "https://images.americankeysupply.com/resize/276/13267_HYU-95440-3J600-RS_012022.jpg", "aks-products/13267_HYU-95440-3J600-RS_012022.jpg"],
  ["13318", "https://images.americankeysupply.com/resize/276/hyu40.png", "aks-products/hyu40.png"],
  ["13347", "https://images.americankeysupply.com/resize/276/13347_BRK-SK-INF-02_032022.jpg", "aks-products/13347_BRK-SK-INF-02_032022.jpg"],
  ["13370", "https://images.americankeysupply.com/resize/276/13370_BRK-SKS-CHR-04_012025_JK.jpg", "aks-products/13370_BRK-SKS-CHR-04_012025_JK.jpg"],
  ["13439", "https://images.americankeysupply.com/resize/276/13439_BRK-RHS-HYU-08_032021.jpg", "aks-products/13439_BRK-RHS-HYU-08_032021.jpg"],
  ["13502", "https://images.americankeysupply.com/resize/276/13502_BRK-RH-ACU-04_072021.jpg", "aks-products/13502_BRK-RH-ACU-04_072021.jpg"],
  ["13503", "https://images.americankeysupply.com/resize/276/13503_BRK-RM-ACU-01_122021.jpg", "aks-products/13503_BRK-RM-ACU-01_122021.jpg"],
  ["13505", "https://images.americankeysupply.com/resize/276/11869_FOR-164-R8162-C_102021.jpg", "aks-products/11869_FOR-164-R8162-C_102021.jpg"],
  ["13611", "https://images.americankeysupply.com/resize/276/13611_GM-13530752-B_012022.jpg", "aks-products/13611_GM-13530752-B_012022.jpg"],
  ["13675", "https://images.americankeysupply.com/resize/276/13675_ACU-72147-S6M-A02-RS_032022.jpg", "aks-products/13675_ACU-72147-S6M-A02-RS_032022.jpg"],
  ["13760", "https://images.americankeysupply.com/resize/276/13760_HYU-95440-C1001-B_102021.jpg", "aks-products/13760_HYU-95440-C1001-B_102021.jpg"],
  ["13779", "https://images.americankeysupply.com/resize/276/13779_CHR-68105078AG_012022.jpg", "aks-products/13779_CHR-68105078AG_012022.jpg"],
  ["14035", "https://images.americankeysupply.com/resize/276/14035_CHR-56046706AG-RS_012022_V2.jpg", "aks-products/14035_CHR-56046706AG-RS_012022_V2.jpg"],
  ["14204", "https://images.americankeysupply.com/resize/276/14204_INF-285E3-6HE1A-RFB-RS_111224_JK.jpg", "aks-products/14204_INF-285E3-6HE1A-RFB-RS_111224_JK.jpg"],
  ["14252", "https://images.americankeysupply.com/resize/276/14252.png", "aks-products/14252.png"],
  ["14331", "https://images.americankeysupply.com/resize/276/2178_STR-5913397_082021.jpg", "aks-products/2178_STR-5913397_082021.jpg"],
  ["14522", "https://images.americankeysupply.com/resize/276/14522_GM-13508414-RFB-A_110824_JK.jpg", "aks-products/14522_GM-13508414-RFB-A_110824_JK.jpg"],
  ["14612", "https://images.americankeysupply.com/resize/276/14612_BRK-RM-ACU-03_122021.jpg", "aks-products/14612_BRK-RM-ACU-03_122021.jpg"],
  ["14614", "https://images.americankeysupply.com/resize/276/14614_BRK-RM-ACU-05_122021.jpg", "aks-products/14614_BRK-RM-ACU-05_122021.jpg"],
  ["14739", "https://images.americankeysupply.com/resize/276/14738_MBE-RHK-DOD-MER-3B-GMT46_122021_V2.jpg", "aks-products/14738_MBE-RHK-DOD-MER-3B-GMT46_122021_V2.jpg"],
  ["14751", "https://images.americankeysupply.com/resize/276/11795_GM-13508414-RS_122021.jpg", "aks-products/11795_GM-13508414-RS_122021.jpg"],
  ["14766", "https://images.americankeysupply.com/resize/276/14766_BRK-SK-HYU-13_011525_JK.jpg", "aks-products/14766_BRK-SK-HYU-13_011525_JK.jpg"],
  ["14805", "https://images.americankeysupply.com/resize/276/14805_INF-285E3-6HE6A-RFB-RS_071723.jpg", "aks-products/14805_INF-285E3-6HE6A-RFB-RS_071723.jpg"],
  ["14853", "https://images.americankeysupply.com/resize/276/14764_KIA-95430-2J200-RS_122021.jpg", "aks-products/14764_KIA-95430-2J200-RS_122021.jpg"],
  ["14887", "https://images.americankeysupply.com/resize/276/14887_BRK-SK-HYU-16_012022.jpg", "aks-products/14887_BRK-SK-HYU-16_012022.jpg"],
  ["14911", "https://images.americankeysupply.com/resize/276/5842_TOY-89742AE051-C_112021.jpg", "aks-products/5842_TOY-89742AE051-C_112021.jpg"],
  ["15002", "https://images.americankeysupply.com/resize/276/13792_KIA-95440-F6000-C_102021.jpg", "aks-products/13792_KIA-95440-F6000-C_102021.jpg"],
  ["15027", "https://images.americankeysupply.com/resize/276/12120_FOR-164-R7040-RS_122021.jpg", "aks-products/12120_FOR-164-R7040-RS_122021.jpg"],
  ["15082", "https://images.americankeysupply.com/resize/276/12378_TOY-89904-0E092-AG-B_012022.jpg", "aks-products/12378_TOY-89904-0E092-AG-B_012022.jpg"],
  ["15305", "https://images.americankeysupply.com/resize/276/14755_KIA-95430-D9100-RS_032022.jpg", "aks-products/14755_KIA-95430-D9100-RS_032022.jpg"],
  ["1532", "https://images.americankeysupply.com/resize/276/425_BRK-CHP-05-4_092020.jpg", "aks-products/425_BRK-CHP-05-4_092020.jpg"],
  ["15432", "https://images.americankeysupply.com/resize/276/BMW-BMW 9312523-04-RS_42022.png", "aks-products/BMW-BMW 9312523-04-RS_42022.png"],
  ["15474", "https://images.americankeysupply.com/resize/276/15474_BRK-EMG-HYU-20_042022.jpg", "aks-products/15474_BRK-EMG-HYU-20_042022.jpg"],
  ["15499", "https://images.americankeysupply.com/resize/276/15499_TOY-89742-07020 RS_042022.jpg", "aks-products/15499_TOY-89742-07020 RS_042022.jpg"],
  ["15502", "https://images.americankeysupply.com/resize/276/15502.JPG", "aks-products/15502.JPG"],
  ["15513", "https://images.americankeysupply.com/resize/276/15513.JPG", "aks-products/15513.JPG"],
  ["15558", "https://images.americankeysupply.com/resize/276/15558_BRK-SKS-BMW-05_101724_JK.jpg", "aks-products/15558_BRK-SKS-BMW-05_101724_JK.jpg"],
  ["15654", "https://images.americankeysupply.com/resize/276/toyota_15654.jpg", "aks-products/toyota_15654.jpg"],
  ["15691", "https://images.americankeysupply.com/resize/276/12261_GM-13522890_102021.jpg", "aks-products/12261_GM-13522890_102021.jpg"],
  ["15786", "https://images.americankeysupply.com/resize/276/5378_GM-15777636-C_022022.jpg", "aks-products/5378_GM-15777636-C_022022.jpg"],
  ["15889", "https://images.americankeysupply.com/resize/276/15889_BRK-SK-TOY-40_082022.jpg", "aks-products/15889_BRK-SK-TOY-40_082022.jpg"],
  ["15895", "https://images.americankeysupply.com/resize/276/13209_KIA-95430-M6000-C_012022.jpg", "aks-products/13209_KIA-95430-M6000-C_012022.jpg"],
  ["16032", "https://images.americankeysupply.com/resize/276/11369_TOY-8974206010-C_122021.jpg", "aks-products/11369_TOY-8974206010-C_122021.jpg"],
  ["16096", "https://images.americankeysupply.com/resize/276/9257_FOR-164-R8162-B_122021.jpg", "aks-products/9257_FOR-164-R8162-B_122021.jpg"],
  ["16110", "https://images.americankeysupply.com/resize/276/5772_VOL-8685150-B_102021.jpg", "aks-products/5772_VOL-8685150-B_102021.jpg"],
  ["16113", "https://images.americankeysupply.com/resize/276/16113_JEP-68105087AJ-RFB-A_031324_JK.jpg", "aks-products/16113_JEP-68105087AJ-RFB-A_031324_JK.jpg"],
  ["16117", "https://images.americankeysupply.com/resize/276/16117 NO LOGO.PNG", "aks-products/16117 NO LOGO.PNG"],
  ["16118", "https://images.americankeysupply.com/resize/276/12070_CHR-68217832AC-RS_112021.jpg", "aks-products/12070_CHR-68217832AC-RS_112021.jpg"],
  ["16124", "https://images.americankeysupply.com/resize/276/16124.png", "aks-products/16124.png"],
  ["16135", "https://images.americankeysupply.com/resize/276/16135_CHR-68105083-OEM_052023.jpg", "aks-products/16135_CHR-68105083-OEM_052023.jpg"],
  ["16137", "https://images.americankeysupply.com/resize/276/16137_CHR-68143505AC-OEM_042023.jpg", "aks-products/16137_CHR-68143505AC-OEM_042023.jpg"],
  ["16196", "https://images.americankeysupply.com/resize/276/16196_HYU-95440-3N470-RFB-RS_052023.jpg", "aks-products/16196_HYU-95440-3N470-RFB-RS_052023.jpg"],
  ["16202", "https://images.americankeysupply.com/resize/276/16202_LEX-89904-53E70-OEM_071923.jpg", "aks-products/16202_LEX-89904-53E70-OEM_071923.jpg"],
  ["16256", "https://images.americankeysupply.com/resize/276/16256_INF-285E3-6HE1A-OEM_071923.jpg", "aks-products/16256_INF-285E3-6HE1A-OEM_071923.jpg"],
  ["16437", "https://images.americankeysupply.com/resize/276/16437_ACU-72147-TZ3-A51-OEM_071923.jpg", "aks-products/16437_ACU-72147-TZ3-A51-OEM_071923.jpg"],
  ["16438", "https://images.americankeysupply.com/resize/276/16438_ACU-72147-TZ3-A61-OEM_071923.jpg", "aks-products/16438_ACU-72147-TZ3-A61-OEM_071923.jpg"],
  ["16440", "https://images.americankeysupply.com/resize/276/16440_LEX-89904-11010_092022.jpg", "aks-products/16440_LEX-89904-11010_092022.jpg"],
  ["16453", "https://images.americankeysupply.com/resize/276/16453_BRK-SK-INF-09_082022.jpg", "aks-products/16453_BRK-SK-INF-09_082022.jpg"],
  ["16614", "https://images.americankeysupply.com/resize/276/13791_HYU-95440-K9000-C_102021.jpg", "aks-products/13791_HYU-95440-K9000-C_102021.jpg"],
  ["16971", "https://images.americankeysupply.com/resize/276/16971 LOGO.png", "aks-products/16971 LOGO.png"],
  ["17008", "https://images.americankeysupply.com/resize/276/13858_GM-13537962-B_102021.jpg", "aks-products/13858_GM-13537962-B_102021.jpg"],
  ["17237", "https://images.americankeysupply.com/resize/276/11894_GM-13508276-B_112021.jpg", "aks-products/11894_GM-13508276-B_112021.jpg"],
  ["17243", "https://images.americankeysupply.com/resize/276/17243_GM-13508414-OEM_072823.jpg", "aks-products/17243_GM-13508414-OEM_072823.jpg"],
  ["17287", "https://images.americankeysupply.com/resize/276/17287_HYU-95430-J3000-OEM_111124__JK.jpg", "aks-products/17287_HYU-95430-J3000-OEM_111124__JK.jpg"],
  ["17382", "https://images.americankeysupply.com/resize/276/17382_BRK-SK-INF-11_052023.jpg", "aks-products/17382_BRK-SK-INF-11_052023.jpg"],
  ["17383", "https://images.americankeysupply.com/resize/276/17383_BRK-SK-CHR-34_072823.jpg", "aks-products/17383_BRK-SK-CHR-34_072823.jpg"],
  ["17459", "https://images.americankeysupply.com/resize/276/17459.png", "aks-products/17459.png"],
  ["1755", "https://images.americankeysupply.com/resize/276/1755_BRK-RHS-BMW-02_092022.jpg", "aks-products/1755_BRK-RHS-BMW-02_092022.jpg"],
  ["17601", "https://images.americankeysupply.com/resize/276/17601_ACU-72147-TX6-C51-OEM072023.jpg", "aks-products/17601_ACU-72147-TX6-C51-OEM072023.jpg"],
  ["17603", "https://images.americankeysupply.com/resize/276/17603_JEP-68051666AI-OEM_052023.jpg", "aks-products/17603_JEP-68051666AI-OEM_052023.jpg"],
  ["17754", "https://images.americankeysupply.com/resize/276/7291_KIA-95440-3W000_012022.jpg", "aks-products/7291_KIA-95440-3W000_012022.jpg"],
  ["17792", "https://images.americankeysupply.com/resize/276/17792_HYU-95430-3J500-OEM_072023.jpg", "aks-products/17792_HYU-95430-3J500-OEM_072023.jpg"],
  ["17796", "https://images.americankeysupply.com/resize/276/17796_CHR-68105081AG-OEM_052023.jpg", "aks-products/17796_CHR-68105081AG-OEM_052023.jpg"],
  ["17886", "https://images.americankeysupply.com/resize/276/17886_BRK-SK-HYU-28_072023.jpg", "aks-products/17886_BRK-SK-HYU-28_072023.jpg"],
  ["17903", "https://images.americankeysupply.com/resize/276/5389_HYU-95430-J9500-OS-B_012022.jpg", "aks-products/5389_HYU-95430-J9500-OS-B_012022.jpg"],
  ["18000", "https://images.americankeysupply.com/resize/276/18000_ACU-72147-TZ3-A11-OEM_072023.jpg", "aks-products/18000_ACU-72147-TZ3-A11-OEM_072023.jpg"],
  ["18047", "https://images.americankeysupply.com/resize/276/18047_HYU-95430-J3010-RFB-RS_091423SH.jpg", "aks-products/18047_HYU-95430-J3010-RFB-RS_091423SH.jpg"],
  ["18175", "https://images.americankeysupply.com/resize/276/13996_GM-13530713-B_022022.jpg", "aks-products/13996_GM-13530713-B_022022.jpg"],
  ["18401", "https://images.americankeysupply.com/resize/276/18401_CHR-05026346AD-RFB-RS_102824_JK.jpg", "aks-products/18401_CHR-05026346AD-RFB-RS_102824_JK.jpg"],
  ["18422", "https://images.americankeysupply.com/resize/276/18422_BRK-SKS-BMW-08_101724_jk.jpg", "aks-products/18422_BRK-SKS-BMW-08_101724_jk.jpg"],
  ["18440", "https://images.americankeysupply.com/resize/276/18440_BRK-SKS-BMW-10_101724_JK.jpg", "aks-products/18440_BRK-SKS-BMW-10_101724_JK.jpg"],
  ["18501", "https://images.americankeysupply.com/resize/276/18501_BRK-SKS-INF-05_120924_JK.jpg", "aks-products/18501_BRK-SKS-INF-05_120924_JK.jpg"],
  ["18691", "https://images.americankeysupply.com/resize/276/noimage.jpg", "aks-products/noimage.jpg"],
  ["18900", "https://images.americankeysupply.com/resize/276/18900_BRK-FB-CHR-27_082023_V2.jpg", "aks-products/18900_BRK-FB-CHR-27_082023_V2.jpg"],
  ["18901", "https://images.americankeysupply.com/resize/276/18901_BRK-FB-CHR-28_082023.jpg", "aks-products/18901_BRK-FB-CHR-28_082023.jpg"],
  ["1945", "https://images.americankeysupply.com/resize/276/1945_BRK-RH-VW-03_082020.jpg", "aks-products/1945_BRK-RH-VW-03_082020.jpg"],
  ["19729", "https://images.americankeysupply.com/resize/276/18657_GM-13522899-RFB-A_060523.jpg", "aks-products/18657_GM-13522899-RFB-A_060523.jpg"],
  ["19731", "https://images.americankeysupply.com/resize/276/18657_GM-13522899-RFB-A_060523.jpg", "aks-products/18657_GM-13522899-RFB-A_060523.jpg"],
  ["19767", "https://images.americankeysupply.com/resize/276/19767_BRK-SKS-BMW-11_101724_JK.jpg", "aks-products/19767_BRK-SKS-BMW-11_101724_JK.jpg"],
  ["19806", "https://images.americankeysupply.com/resize/276/noimage.jpg", "aks-products/noimage.jpg"],
  ["20107", "https://images.americankeysupply.com/resize/276/19329_GM-13522902-RFB-A_080323.jpg", "aks-products/19329_GM-13522902-RFB-A_080323.jpg"],
  ["20108", "https://images.americankeysupply.com/resize/276/19329_GM-13522902-RFB-A_080323.jpg", "aks-products/19329_GM-13522902-RFB-A_080323.jpg"],
  ["20260", "https://images.americankeysupply.com/resize/276/20260_ILC-POD-LAL-4B10_01172024AH.jpg", "aks-products/20260_ILC-POD-LAL-4B10_01172024AH.jpg"],
  ["20261", "https://images.americankeysupply.com/resize/276/20261_ILC-POD-LAL-4B9_01172024AH.jpg", "aks-products/20261_ILC-POD-LAL-4B9_01172024AH.jpg"],
  ["20262", "https://images.americankeysupply.com/resize/276/20262_ILC-POD-LAL-5B7_01172024AH.jpg", "aks-products/20262_ILC-POD-LAL-5B7_01172024AH.jpg"],
  ["20264", "https://images.americankeysupply.com/resize/276/20264_ILC-POD-LAL-6B3_01172024AH.jpg", "aks-products/20264_ILC-POD-LAL-6B3_01172024AH.jpg"],
  ["20275", "https://images.americankeysupply.com/resize/276/20275_BRK-SKS-ACU-07_100924_JK.jpg", "aks-products/20275_BRK-SKS-ACU-07_100924_JK.jpg"],
  ["20283", "https://images.americankeysupply.com/resize/276/2-20283_ILC-RKE-GM-5B5_01172024AH.jpg", "aks-products/2-20283_ILC-RKE-GM-5B5_01172024AH.jpg"],
  ["20419", "https://images.americankeysupply.com/resize/276/20419_BRK-SK-FOR-32_020124SH.jpg", "aks-products/20419_BRK-SK-FOR-32_020124SH.jpg"],
  ["20625", "https://images.americankeysupply.com/resize/276/20625_BRK-SK-TOY-63_030824SH1.jpg", "aks-products/20625_BRK-SK-TOY-63_030824SH1.jpg"],
  ["20635", "https://images.americankeysupply.com/resize/276/20635_ACU-72147-TX6-A22-RFB-RS_031124SH.jpg", "aks-products/20635_ACU-72147-TX6-A22-RFB-RS_031124SH.jpg"],
  ["2064", "https://images.americankeysupply.com/resize/276/2064_ILC-B57_072020.jpg", "aks-products/2064_ILC-B57_072020.jpg"],
  ["20704", "https://images.americankeysupply.com/resize/276/20704_ILC-PRX-HYUN-4B12_032724_JK.jpg", "aks-products/20704_ILC-PRX-HYUN-4B12_032724_JK.jpg"],
  ["21068", "https://images.americankeysupply.com/resize/276/noimage.jpg", "aks-products/noimage.jpg"],
  ["2131", "https://images.americankeysupply.com/resize/276/2131_ACU-72147-S0K-A13_0112021.jpg", "aks-products/2131_ACU-72147-S0K-A13_0112021.jpg"],
  ["2133", "https://images.americankeysupply.com/resize/276/2133_ACU-72147-SEP-A52_112021.jpg", "aks-products/2133_ACU-72147-SEP-A52_112021.jpg"],
  ["21388", "https://images.americankeysupply.com/resize/276/21388_BRK-SKS-NIS-20_062024_SH.jpg", "aks-products/21388_BRK-SKS-NIS-20_062024_SH.jpg"],
  ["21440", "https://images.americankeysupply.com/resize/276/21440_FOR- 164-R8162-OEM_062624__SH.jpg", "aks-products/21440_FOR- 164-R8162-OEM_062624__SH.jpg"],
  ["21463", "https://images.americankeysupply.com/resize/276/21463_BRK-SK-HYU-58_102424_JK.jpg", "aks-products/21463_BRK-SK-HYU-58_102424_JK.jpg"],
  ["21534", "https://images.americankeysupply.com/resize/276/21534_ACU-72147-TZ3-A01-RFB-A_071524_JK.jpg", "aks-products/21534_ACU-72147-TZ3-A01-RFB-A_071524_JK.jpg"],
  ["21536", "https://images.americankeysupply.com/resize/276/21536_ACU-72147-TZ3-A11-RFB-A_071524_JK.jpg", "aks-products/21536_ACU-72147-TZ3-A11-RFB-A_071524_JK.jpg"],
  ["21551", "https://images.americankeysupply.com/resize/276/noimage.jpg", "aks-products/noimage.jpg"],
  ["21659", "https://images.americankeysupply.com/resize/276/21659_ACU-72147-TYB-C21-OEM_071824_JK.jpg", "aks-products/21659_ACU-72147-TYB-C21-OEM_071824_JK.jpg"],
  ["21661", "https://images.americankeysupply.com/resize/276/21661_ACU-72147-TYB-C31 -OEM_071824_JK.jpg", "aks-products/21661_ACU-72147-TYB-C31 -OEM_071824_JK.jpg"],
  ["21931", "https://images.americankeysupply.com/resize/276/21931_HYU-95430-2E200-OEM_081924_SH.jpg", "aks-products/21931_HYU-95430-2E200-OEM_081924_SH.jpg"],
  ["2201", "https://images.americankeysupply.com/resize/276/2201_ STR-59212852_031524SH.jpg", "aks-products/2201_ STR-59212852_031524SH.jpg"],
  ["22143", "https://images.americankeysupply.com/resize/276/22143_ILC-PRX-HYUN-4B19_091324_JK.jpg", "aks-products/22143_ILC-PRX-HYUN-4B19_091324_JK.jpg"],
  ["22941", "https://images.americankeysupply.com/resize/276/22941_ACU-72147-TYA-C01-OEM_020725_JK.jpg", "aks-products/22941_ACU-72147-TYA-C01-OEM_020725_JK.jpg"],
  ["22942", "https://images.americankeysupply.com/resize/276/22942_ACU-72147-TYA-C11-OEM_020725_JK.jpg", "aks-products/22942_ACU-72147-TYA-C11-OEM_020725_JK.jpg"],
  ["22943", "https://images.americankeysupply.com/resize/276/22943_ACU-72147-TZ3-A01-OEM_020725_JK.jpg", "aks-products/22943_ACU-72147-TZ3-A01-OEM_020725_JK.jpg"],
  ["22960", "https://images.americankeysupply.com/resize/276/noimage.jpg", "aks-products/noimage.jpg"],
  ["22977", "https://images.americankeysupply.com/resize/276/22977_LEX-89904-11700-OEM_021225_JK.jpg", "aks-products/22977_LEX-89904-11700-OEM_021225_JK.jpg"],
  ["23122", "https://images.americankeysupply.com/resize/276/23112_HON-72147-TK8-A81-RFB-A_040125_SH.jpg", "aks-products/23112_HON-72147-TK8-A81-RFB-A_040125_SH.jpg"],
  ["23423", "https://images.americankeysupply.com/resize/276/noimage.jpg", "aks-products/noimage.jpg"],
  ["23564", "https://images.americankeysupply.com/resize/276/noimage.jpg", "aks-products/noimage.jpg"],
  ["2399", "https://images.americankeysupply.com/resize/276/2399_JMA-GM-44D_032022.jpg", "aks-products/2399_JMA-GM-44D_032022.jpg"],
  ["2418", "https://images.americankeysupply.com/resize/276/2418_ILC-B59_032022.jpg", "aks-products/2418_ILC-B59_032022.jpg"],
  ["2516", "https://images.americankeysupply.com/resize/276/2516_GM-13508414-B_032022.jpg", "aks-products/2516_GM-13508414-B_032022.jpg"],
  ["2679", "https://images.americankeysupply.com/resize/276/2679_ILC-B54_022022.jpg", "aks-products/2679_ILC-B54_022022.jpg"],
  ["2684", "https://images.americankeysupply.com/resize/276/2684-ILC-H70-112020.jpg", "aks-products/2684-ILC-H70-112020.jpg"],
  ["269", "https://images.americankeysupply.com/resize/276/1946_BRK-RH-VW-05_012022.jpg", "aks-products/1946_BRK-RH-VW-05_012022.jpg"],
  ["2795", "https://images.americankeysupply.com/resize/276/2795_ACU-72147-SZ3-A92_112021.jpg", "aks-products/2795_ACU-72147-SZ3-A92_112021.jpg"],
  ["2811", "https://images.americankeysupply.com/resize/276/2811_BRK-FB-CHR-07_022022.jpg", "aks-products/2811_BRK-FB-CHR-07_022022.jpg"],
  ["3080", "https://images.americankeysupply.com/resize/276/3080-BRK-RMS-GM-0214.jpg", "aks-products/3080-BRK-RMS-GM-0214.jpg"],
  ["3415", "https://images.americankeysupply.com/resize/276/3415_INF-285E3-ZQ31B_012022.jpg", "aks-products/3415_INF-285E3-ZQ31B_012022.jpg"],
  ["3489", "https://images.americankeysupply.com/resize/276/3489_ STR-7012479_092923SH.jpg", "aks-products/3489_ STR-7012479_092923SH.jpg"],
  ["371", "https://images.americankeysupply.com/resize/276/3028_BRK-CHP-09_092020.jpg", "aks-products/3028_BRK-CHP-09_092020.jpg"],
  ["3745", "https://images.americankeysupply.com/resize/276/3745_JMA-GM-47D_062124_JK.jpg", "aks-products/3745_JMA-GM-47D_062124_JK.jpg"],
  ["385", "https://images.americankeysupply.com/resize/276/3157_BRK-CHP-SUB40_092020.jpg", "aks-products/3157_BRK-CHP-SUB40_092020.jpg"],
  ["386", "https://images.americankeysupply.com/resize/276/370_BRK-CHP-07_092020.jpg", "aks-products/370_BRK-CHP-07_092020.jpg"],
  ["393", "https://images.americankeysupply.com/resize/276/393_BRK-TRK-HON58RT6_062021.jpg", "aks-products/393_BRK-TRK-HON58RT6_062021.jpg"],
  ["4185", "https://images.americankeysupply.com/resize/276/4185_GM-13508275-RS_022022.jpg", "aks-products/4185_GM-13508275-RS_022022.jpg"],
  ["422", "https://images.americankeysupply.com/resize/276/370_BRK-CHP-07_092020.jpg", "aks-products/370_BRK-CHP-07_092020.jpg"],
  ["4431", "https://images.americankeysupply.com/resize/276/4431_ACU-35113-TK4-A00_112021.jpg", "aks-products/4431_ACU-35113-TK4-A00_112021.jpg"],
  ["446", "https://images.americankeysupply.com/resize/276/446-ILC-H75-112020.jpg", "aks-products/446-ILC-H75-112020.jpg"],
  ["4465", "https://images.americankeysupply.com/resize/276/4465_CHR-68105083AG-RFB-A_022023.jpg", "aks-products/4465_CHR-68105083AG-RFB-A_022023.jpg"],
  ["4466", "https://images.americankeysupply.com/resize/276/4466_CHR-56046733AH_072022.jpg", "aks-products/4466_CHR-56046733AH_072022.jpg"],
  ["4467", "https://images.americankeysupply.com/resize/276/4467_CHR-68051664AI_012022.jpg", "aks-products/4467_CHR-68051664AI_012022.jpg"],
  ["447", "https://images.americankeysupply.com/resize/276/447-JMA-GM-8E-112020.jpg", "aks-products/447-JMA-GM-8E-112020.jpg"],
  ["4486", "https://images.americankeysupply.com/resize/276/4486_CHR-68143502AC-RFB-A_012023.jpg", "aks-products/4486_CHR-68143502AC-RFB-A_012023.jpg"],
  ["4498", "https://images.americankeysupply.com/resize/276/4498-STR-5913978-102020.jpg", "aks-products/4498-STR-5913978-102020.jpg"],
  ["4749", "https://images.americankeysupply.com/resize/276/14188_CHR-05-05026378-RS_012022.jpg", "aks-products/14188_CHR-05-05026378-RS_012022.jpg"],
  ["5226", "https://images.americankeysupply.com/resize/276/5226_CHR-68066848AD_112021.jpg", "aks-products/5226_CHR-68066848AD_112021.jpg"],
  ["5390", "https://images.americankeysupply.com/resize/276/5390_HYU-95430-3K202-B_022022.jpg", "aks-products/5390_HYU-95430-3K202-B_022022.jpg"],
  ["5402", "https://images.americankeysupply.com/resize/276/5402_CHR-68273340AC_112021.jpg", "aks-products/5402_CHR-68273340AC_112021.jpg"],
  ["6437", "https://images.americankeysupply.com/resize/276/6437_ILC-NI05T_081524_JK.jpg", "aks-products/6437_ILC-NI05T_081524_JK.jpg"],
  ["6597", "https://images.americankeysupply.com/resize/276/6597_ STR-5921295_110923SH.jpg", "aks-products/6597_ STR-5921295_110923SH.jpg"],
  ["6609", "https://images.americankeysupply.com/resize/276/6609-BRK-RH-VOL-01-072020.jpg", "aks-products/6609-BRK-RH-VOL-01-072020.jpg"],
  ["6771", "https://images.americankeysupply.com/resize/276/12477_HON-35111-SVA-305-RS_102021.jpg", "aks-products/12477_HON-35111-SVA-305-RS_102021.jpg"],
  ["698", "https://images.americankeysupply.com/resize/276/425_BRK-CHP-05-4_092020.jpg", "aks-products/425_BRK-CHP-05-4_092020.jpg"],
  ["7043", "https://images.americankeysupply.com/resize/276/7043_CHR-68143500AC_012022.jpg", "aks-products/7043_CHR-68143500AC_012022.jpg"],
  ["7122", "https://images.americankeysupply.com/resize/276/370_BRK-CHP-07_092020.jpg", "aks-products/370_BRK-CHP-07_092020.jpg"],
  ["7750", "https://images.americankeysupply.com/resize/276/7750_HON-08E61-S01-100_112021.jpg", "aks-products/7750_HON-08E61-S01-100_112021.jpg"],
  ["7767", "https://images.americankeysupply.com/resize/276/13209_KIA-95430-M6000-C_012022.jpg", "aks-products/13209_KIA-95430-M6000-C_012022.jpg"],
  ["7947", "https://images.americankeysupply.com/resize/276/7947_INF-H0561-AR200_012022.jpg", "aks-products/7947_INF-H0561-AR200_012022.jpg"],
  ["7975", "https://images.americankeysupply.com/resize/276/7975_KDY-BLADE13Y_062724_JK.jpg", "aks-products/7975_KDY-BLADE13Y_062724_JK.jpg"],
  ["805", "https://images.americankeysupply.com/resize/276/805-JMA-FO-20DE-092020.jpg", "aks-products/805-JMA-FO-20DE-092020.jpg"],
  ["8598", "https://images.americankeysupply.com/resize/276/3028_BRK-CHP-09_092020.jpg", "aks-products/3028_BRK-CHP-09_092020.jpg"],
  ["8619", "https://images.americankeysupply.com/resize/276/8619_BRK-SK-HYU-01_062023.jpg", "aks-products/8619_BRK-SK-HYU-01_062023.jpg"],
  ["8636", "https://images.americankeysupply.com/resize/276/8636_BRK-SK-NIS-13_062023.jpg", "aks-products/8636_BRK-SK-NIS-13_062023.jpg"],
  ["8669", "https://images.americankeysupply.com/resize/276/8669_BRK-RM-HYU-03_080323SH.jpg", "aks-products/8669_BRK-RM-HYU-03_080323SH.jpg"],
  ["8845", "https://images.americankeysupply.com/resize/276/463_HYU-95430-1M100-B_022022.jpg", "aks-products/463_HYU-95430-1M100-B_022022.jpg"],
  ["8964", "https://images.americankeysupply.com/resize/276/BRK-RMS-SUZ-01.jpg", "aks-products/BRK-RMS-SUZ-01.jpg"],
  ["9080", "https://images.americankeysupply.com/resize/276/9080_BRK-SK-CHR-09_062023.jpg", "aks-products/9080_BRK-SK-CHR-09_062023.jpg"],
  ["922", "https://images.americankeysupply.com/resize/276/922_JMA-GM-4E_062124_JK.jpg", "aks-products/922_JMA-GM-4E_062124_JK.jpg"],
  ["9323", "https://images.americankeysupply.com/resize/276/12614_HYU-95430-F2300-RS_122021.jpg", "aks-products/12614_HYU-95430-F2300-RS_122021.jpg"],
  ["9509", "https://images.americankeysupply.com/resize/276/9509_JEP-68105087AG-B_012022.jpg", "aks-products/9509_JEP-68105087AG-B_012022.jpg"],
  ["9652", "https://images.americankeysupply.com/resize/276/9652_BRK-SK-CHR-11_052023.jpg", "aks-products/9652_BRK-SK-CHR-11_052023.jpg"],
  ["995", "https://images.americankeysupply.com/resize/276/3028_BRK-CHP-09_092020.jpg", "aks-products/3028_BRK-CHP-09_092020.jpg"]
];

let completed = 0;
let failed = 0;
const errors = [];

async function migrateOne(item, imageUrl, r2Key) {
  try {
    const imgResp = await fetch(imageUrl);
    if (!imgResp.ok) throw new Error("Download failed: " + imgResp.status);
    const blob = await imgResp.blob();
    if (blob.size < 100) throw new Error("Image too small (" + blob.size + "b)");

    const uploadUrl = WORKER + "/api/r2-upload?key=" + AUTH_KEY 
      + "&item=" + encodeURIComponent(item) 
      + "&r2key=" + encodeURIComponent(r2Key);
    const uploadResp = await fetch(uploadUrl, {
      method: "POST",
      body: blob,
      headers: { "Content-Type": blob.type || "image/jpeg" }
    });

    if (!uploadResp.ok) {
      const errText = await uploadResp.text();
      throw new Error("Upload failed: " + uploadResp.status + " " + errText);
    }

    completed++;
    console.log("✅ [" + completed + "/" + MISSING.length + "] Item " + item + " → " + r2Key + " (" + (blob.size/1024).toFixed(1) + "KB)");
    return true;
  } catch (err) {
    failed++;
    errors.push({ item, url: imageUrl, error: err.message });
    console.error("❌ Item " + item + ": " + err.message);
    return false;
  }
}

async function runMigration() {
  console.log("🚀 Starting AKS Image Migration");
  console.log("   Total: " + MISSING.length + " images, Concurrency: " + CONCURRENCY);

  const startTime = Date.now();
  for (let i = 0; i < MISSING.length; i += CONCURRENCY) {
    const batch = MISSING.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(([item, url, r2key]) => migrateOne(item, url, r2key)));
    if (i + CONCURRENCY < MISSING.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n📊 Migration Complete in " + elapsed + "s");
  console.log("   ✅ Uploaded: " + completed);
  console.log("   ❌ Failed: " + failed);
  if (errors.length > 0) {
    console.log("   Failed items:");
    errors.forEach(e => console.log("   - Item " + e.item + ": " + e.error));
  }
}

runMigration();
