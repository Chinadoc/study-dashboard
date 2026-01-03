# Locksmith "Pearl Protocol" Research Prompt

**Instructions for User:**
Copy and paste the text below into Gemini Deep Research. Replace `[YEAR] [MAKE] [MODEL]` with your target vehicle.

---

I need deep technical research for the **[YEAR] [MAKE] [MODEL]** for my automotive locksmith database.

**[FOCUS_AREA]**

Please conduct a deep forensic analysis of the **[YEAR] [MAKE] [MODEL]** to answer the following 8 specific locksmith questions:

1.  **Architecture & Immobilizer**: Determine the specific security architecture (e.g., GM Global B, Toyota Smart Key 3.0, BMW FEM, Ford PATS). Identify the specific chip type (e.g., Hitag Pro, AES, DST-AES).
2.  **Part Data**: Search for valid FCC IDs, OEM Part Numbers, and Operating Frequencies (315/433/868/902 MHz). Note differences between trims (e.g., base key vs proximity).
3.  **Mechanical Specs**: Identify the keyway profile (e.g., HU100, TOY48), correct Lishi tool, code series, and emergency slot location.
4.  **Add-Key Procedure**: Detail the exact steps for "Add-Key". Is it OBD-only? Is there an onboard procedure with 1 or 2 working keys?
5.  **All Keys Lost (AKL)**: Research the AKL procedure. Does it require a PIN (rolling/fixed)? Does it require removing modules (EEPROM)? Which tools support it (Autel, SmartPro)? Is an internet connection (NASTF/TIS) required?
6.  **Security Barriers**: Is there a Security Gateway (SGW)? Where is it? Is a breakdown or bypass cable required? Is CAN FD required? What are the battery voltage requirements?
7.  **Troubleshooting**: Find common failure points (e.g., "Service Theft System", "No Key Detected", BCM bricking risks).
8.  **Cross-Reference**: What other vehicles share this system or key?

---

### **OUTPUT FORMAT (Strictly Follow This Structure)**

We need to ingest this data programmatically. You must output your findings in the following **Markdown** format:

# [YEAR] [MAKE] [MODEL] Locksmith Intelligence

## 🚨 CRITICAL ALERTS (Must Stop Work)
*List 1-3 critical risks that could cost money or damage the car. If none, verify and leave empty.*
- **Title**: [Short Title, e.g., BCM Bricking Risk]
- **Level**: [CRITICAL / WARNING / INFO]
- **Content**: [Description of risk]
- **Mitigation**: [How to avoid it]

## 💎 PROGRAMMING PEARLS (The "6-8" Key Insights)
*Synthesize your research into 6-8 high-value pearls. Cover the Architecture, SGW, specific Tool quirks, and Procedures found above.*
1. **[Insight Title]**: [Detailed explanation]
2. **[Insight Title]**: [Detailed explanation]
...

## 🔑 MAPPING DATA
- **FCC ID(s)**: [List all confirmed IDs]
- **Chip Type**: [e.g., ID46, 4A, MQB48]
- **Frequency**: [e.g., 315MHz]
- **Keyway/Blade**: [e.g., HU66]
- **System Type**: [e.g., CAS4, FEM]
- **Battery**: [e.g., CR2032]
- **Lishi Tool**: [e.g., HU100 (10-cut)]

## 🛠️ TOOLS & PROCEDURES
- **Preferred Tool**: [Tool with highest success rate]
- **Best Method**: [e.g., AKL vs Add Key]
- **Pincode**: [How is it obtained? OBD / Dealer / NASTF]
- **SGW Bypass**: [Required? Location?]
- **Voltage Requirement**: [Specific voltage needs]
