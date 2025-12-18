INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('ford-f-150-2015-2020', 'Ford', 'F 150', 2015, 2020, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
            <h2 class="text-2xl font-bold text-white mb-4">Ford F-150 2015-2020</h2>
            <div class="space-y-6">
                <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
                    <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
                    <p class="text-slate-300"><b>Section 1: Add a Smart Key (Proximity)</b><br>Autel IM508, new proximity key.<br><br><b>Section 2: All Keys Lost (Smart Key)</b><br>Autel IM508, at least TWO new smart keys, Wi-Fi connection.<br><br><b>Section 3: Add a Bladed Key (Keyed Ignition)</b><br>Autel IM608, original key, new cut key.</p>
                </div>
                <div>
                    <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
                    <ol class="list-decimal list-inside space-y-2 text-slate-300">
                        <li><b>Section 1: Add a Smart Key (Proximity)</b><br>Navigate: Ford -> Manual Selection -> F-150 ->2018-2020 -> Smart Key.</li>
                        <li>Select Hot Function -> Add smart key (guided).Press Start.</li>
                        <li>Confirm no factory alarm is active.</li>
                        <li>Wait for security access (approx. 3-10 minutes).</li>
                        <li>When prompted, place the new smart key intothe programming slot located at the bottom ofthe front cup holder.</li>
                        <li>Press OK. Door locks will cycle to confirm.</li>
                        <li>Select NO when asked to learn another key.Test functions.</li><br><li><b>Section 2: All Keys Lost (Smart Key)</b><br>Place one new key in the cup holder slot.</li>
                        <li>Navigate: Control Unit -> Keyless System -> KeyLearning -> All smart keys lost.</li>
                        <li>This erases all keys. Select YES.</li>
                        <li>Wait for the 10-minute security access.</li>
                        <li>Tool confirms all keys are erased (key count is 0).</li>
                        <li>With first key in slot, press OK. Locks cycle.</li>
                        <li>Select YES for next key. Remove first key, placesecond key in slot. Press OK. Locks cycle.</li>
                        <li>Repeat for others. Select NO when finished.</li><br><li><b>Section 3: Add a Bladed Key (Keyed Ignition)</b><br>With original key, turn ignition to ON.</li>
                        <li>On programmer, check number of keys.</li>
                        <li>Select Add a key (guided). Press Start.</li>
                        <li>Gain security access (3-10 minutes).</li>
                        <li>When prompted, remove original key and insertNEW key. Turn ignition ON.</li>
                        <li>Press OK. Locks will cycle to confirm.</li>
                        <li>Select NO for another key. Test new key.</li>
                    </ol>
                </div>
                
                <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
                    <p class="text-red-200/80 text-sm"><b>Section 1:</b> The programming slot is in the front cup holder; remove the rubber mat. The instrument cluster may go black during the process.<br><br><b>Section 2:</b> You MUST program at least two keys for the vehicle to start in an All Keys Lost situation.<br><br><b>Section 3:</b> This procedure requires one working original key.</p>
                </div>
            </div>
        </div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('toyota-venza-2009-2015', 'Toyota', 'Venza', 2009, 2015, '<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Toyota Venza 2009-2015 Programming Guide</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        h1,
        h2,
        h3 {
            color: #0056b3;
        }

        .warning {
            background: #fff3cd;
            border-left: 5px solid #ffca28;
            padding: 15px;
            margin: 20px 0;
        }

        .tip {
            background: #d1ecf1;
            border-left: 5px solid #0dcaf0;
            padding: 15px;
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th,
        td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }

        th {
            background: #f8f9fa;
        }

        code {
            background: #f1f1f1;
            padding: 2px 4px;
            border-radius: 4px;
        }
    </style>
</head>

<body>
    <h1>Toyota Venza 2009-2015 AKL Programming Guide</h1>

    <p>This guide covers All Keys Lost (AKL) procedures for the 1st Generation Toyota Venza (2009-2015) equipped with
        Push-Button Start.</p>

    <div class="tip">
        <strong>Compatibility:</strong> The Venza 2009-2015 shares its Smart Key architecture with the 2007-2011 Camry
        and 2008-2013 Highlander.
    </div>

    <h2>Key Specifications (Smart Key)</h2>
    <table>
        <tr>
            <th>System Type</th>
            <td>Gen 1 Smart Key (Push-to-Start)</td>
        </tr>
        <tr>
            <th>FCC ID</th>
            <td><code>HYQ14AAB</code></td>
        </tr>
        <tr>
            <th>IC</th>
            <td>1551A-14AAB</td>
        </tr>
        <tr>
            <th>Frequency</th>
            <td>315 MHz</td>
        </tr>
        <tr>
            <th>Technical Value</th>
            <td>Page 1: <strong>98</strong></td>
        </tr>
        <tr>
            <th>Emergency Blade</th>
            <td>TR47 (8-cut)</td>
        </tr>
    </table>

    <div class="warning">
        <strong>Important:</strong> While the FCC ID is the same as the Avalon/Land Cruiser, the <strong>Page 1</strong>
        value (98) must match for the key to program.
    </div>

    <h2>Required Equipment</h2>
    <ul>
        <li><strong>Autel IM608 / IM508</strong> or <strong>Xhorse VVDI Key Tool Plus</strong></li>
        <li><strong>Autel APB112 Simulator</strong> (Highly recommended for AKL)</li>
        <li>New Toyota Smart Key (FCC: HYQ14AAB, Page 1: 98)</li>
    </ul>

    <h2>AKL Procedure (Using APB112 Simulator)</h2>
    <ol>
        <li><strong>Connect Tool:</strong> Plug the scanner into the OBD-II port.</li>
        <li><strong>Select Vehicle:</strong> Toyota -> Venza -> 2009-2015 -> Smart Key.</li>
        <li><strong>Backup IMMO:</strong> Select "Back up IMMO Data". This reads the security data from the Smart Box.
        </li>
        <li><strong>Generate Simulator:</strong> Select "Generate Simulator Key". Follow prompts to plug in the
            <strong>APB112</strong>.</li>
        <li><strong>Ignition:</strong> Use the APB112 to turn the ignition ON by touching it to the Start button.</li>
        <li><strong>Add Key:</strong> With the ignition ON (via simulator), select "Add Smart Key". Follow the prompts
            to touch the APB112 to the button, then the new key to the button.</li>
        <li><strong>Sync:</strong> Once registered, test the remote functions immediately.</li>
    </ol>

    <h2>Alternative 16-Minute Reset</h2>
    <p>If you lack a simulator, perform a "Smart Box Reset":</p>
    <ol>
        <li>Select "Immobilizer Reset" / "Smart Box Reset".</li>
        <li>Wait for the 16-minute security timer to finish.</li>
        <li>Once the timer expires and the security light turns solid, touch the new key to the Start button to
            register.</li>
    </ol>

    <div class="warning">
        <strong>Battery Stability:</strong> Keep a battery maintainer connected during the 16-minute reset to prevent
        voltage drops.
    </div>

</body>

</html>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('jeep-gladiator-2020-2024', 'Jeep', 'Gladiator', 2020, 2024, '<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Jeep Gladiator 2020-2024 Programming Guide</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        h1,
        h2,
        h3 {
            color: #0056b3;
        }

        .warning {
            background: #fff3cd;
            border-left: 5px solid #ffca28;
            padding: 15px;
            margin: 20px 0;
        }

        .tip {
            background: #d1ecf1;
            border-left: 5px solid #0dcaf0;
            padding: 15px;
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th,
        td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }

        th {
            background: #f8f9fa;
        }

        code {
            background: #f1f1f1;
            padding: 2px 4px;
            border-radius: 4px;
        }
    </style>
</head>

<body>
    <h1>Jeep Gladiator 2020-2024 AKL Programming Guide</h1>

    <div class="warning">
        <strong>CRITICAL:</strong> All 2020-2024 Jeep Gladiator models require a <strong>12+8 Security Gateway (SGW)
            Bypass Cable</strong> for any OBD-II programming.
    </div>

    <h2>Vehicle Specifications</h2>
    <table>
        <tr>
            <th>System Type</th>
            <td>Push-Button Start (Smart Key)</td>
        </tr>
        <tr>
            <th>Transponder Chip</th>
            <td>HITAG AES (4A Chip / NXP PCF7939M)</td>
        </tr>
        <tr>
            <th>Frequency</th>
            <td>433 MHz</td>
        </tr>
        <tr>
            <th>FCC ID</th>
            <td><code>OHT1130261</code></td>
        </tr>
        <tr>
            <th>Emergency Key</th>
            <td>SIP22 (High-Security Internal Cut)</td>
        </tr>
    </table>

    <h2>Required Equipment</h2>
    <ul>
        <li><strong>Autel IM608 Pro / IM508</strong> with XP400 Pro</li>
        <li><strong>FCA 12+8 Adapter</strong> (or Star Connector Cable)</li>
        <li>Programmable Jeep Smart Key (FCC: OHT1130261)</li>
    </ul>

    <h2>The "Locked" RFHub Issue (2021+ Models)</h2>
    <p>Vehicles built after mid-2021 often feature a "locked" Radio Frequency Hub (RFHub). In an All Keys Lost (AKL)
        scenario, the system may reject programming even with the correct PIN.</p>
    <ul>
        <li><strong>Symptoms:</strong> Tool reads PIN successfully but fails at the "Key Learning" step with a
            "Communication Error" or "Security Access Denied".</li>
        <li><strong>Solution:</strong> You may need to replace the RFHub with a "virgin" unit or use specialized
            software/bench tools to unlock the existing module.</li>
    </ul>

    <h2>Step-by-Step AKL Procedure (Autel IM608)</h2>
    <ol>
        <li><strong>Access the SGW:</strong> Connect your 12+8 bypass cable. The module is typically located behind the
            radio (remove bezel and 7mm screws) or tucked high above the OBD-II port.</li>
        <li><strong>Ignition:</strong> Ensure the ignition is OFF. Hazards should be ON to keep the bus active.</li>
        <li><strong>Connect Tool:</strong> Plug the Autel VCI into the 12+8 bypass cable and the OBD-II connector.</li>
        <li><strong>Vehicle Selection:</strong> Manual Selection -> Jeep -> Gladiator -> 2020-2024 -> Smart Key.</li>
        <li><strong>Read PIN:</strong> Select "Read PIN Code". The tool will communicate through the bypass and display
            the 5-digit code.</li>
        <li><strong>Key Learning (AKL):</strong> Select "All Keys Lost". Follow the prompts to cycle the ignition if
            requested (usually not possible in AKL, just proceed).</li>
        <li><strong>Programming:</strong> When prompted, place the new Smart Key against the "Start/Stop" button. Press
            "OK" on the tool and immediately start pressing the <strong>Lock/Unlock</strong> buttons on the fob
            repeatedly.</li>
        <li><strong>Verification:</strong> The tool should confirm "Success". Test the remote functions and ensure the
            vehicle starts.</li>
    </ol>

    <div class="tip">
        <strong>Pro Tip:</strong> If the programming fails at the final step, try holding the key fob directly against
        the Start/Stop button and rapidly pressing the buttons on the fob during the learning sequence.
    </div>

</body>

</html>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('honda-cr-v-2017-2022', 'Honda', 'Cr V', 2017, 2022, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
            <h2 class="text-2xl font-bold text-white mb-4">Honda CR-V 2017-2022</h2>
            <div class="space-y-6">
                <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
                    <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
                    <p class="text-slate-300">Pro Key Box Kit or Autel IM series, one working key, one new key.</p>
                </div>
                <div>
                    <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
                    <ol class="list-decimal list-inside space-y-2 text-slate-300">
                        <li>Connect the programmer to the OBD-II port.</li>
                        <li>Select Add a key.</li>
                        <li>Take ALL smart keys OUTSIDE the vehicle. Press Enter/OK.</li>
                        <li>Place your single WORKING smart key inside the vehicle. Press Enter/OK.</li>
                        <li>Press the Push to Start button TWICE to turn the ignition ON (do not start the engine). Press Enter/OK.</li>
                        <li>The programmer will configure the system.</li>
                        <li>Now, take the WORKING smart key OUT of the vehicle. Press Enter/OK.</li>
                        <li>Bring the NEW smart key INTO the vehicle. Press Enter/OK.</li>
                        <li>The tool will communicate. When you hear two beeps, the key has been added.</li>
                        <li>Follow the prompts to cycle the ignition OFF and ON multiple times to complete the process.</li>
                        <li>Unplug the tool and test all functions of the new key fob.</li>
                    </ol>
                </div>
                
                <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
                    <p class="text-red-200/80 text-sm">• You must have at least one working key to use the ''Add a Key'' function.<br>• Pay close attention to the prompts for moving keys in and out of the vehicle.<br>• The final registration is completed by cycling the ignition multiple times as directed.</p>
                </div>
            </div>
        </div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('toyota-avalon-2013-2018', 'Toyota', 'Avalon', 2013, 2018, '<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Toyota Avalon 2013-2018 Programming Guide</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        h1,
        h2,
        h3 {
            color: #0056b3;
        }

        .warning {
            background: #fff3cd;
            border-left: 5px solid #ffca28;
            padding: 15px;
            margin: 20px 0;
        }

        .tip {
            background: #d1ecf1;
            border-left: 5px solid #0dcaf0;
            padding: 15px;
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th,
        td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }

        th {
            background: #f8f9fa;
        }

        code {
            background: #f1f1f1;
            padding: 2px 4px;
            border-radius: 4px;
        }
    </style>
</head>

<body>
    <h1>Toyota Avalon 2013-2018 AKL Programming Guide</h1>

    <p>This guide covers All Keys Lost (AKL) procedures for the Toyota Avalon (2013-2018) equipped with the <strong>8A
            (H-Chip)</strong> Smart Key system.</p>

    <div class="tip">
        <strong>Hardware Note:</strong> This generation uses the <strong>8A</strong> platform. Ensure your scanner is
        updated to handle 8A Toyota models.
    </div>

    <h2>Key Specifications (Smart Key)</h2>
    <table>
        <tr>
            <th>System Type</th>
            <td>8A Smart Key (Push-to-Start)</td>
        </tr>
        <tr>
            <th>FCC ID</th>
            <td><code>HYQ14FBA</code></td>
        </tr>
        <tr>
            <th>IC</th>
            <td>1551A-14FBA</td>
        </tr>
        <tr>
            <th>Frequency</th>
            <td>315 MHz</td>
        </tr>
        <tr>
            <th>Technical Value</th>
            <td>Page 1: <strong>A8</strong></td>
        </tr>
        <tr>
            <th>Emergency Blade</th>
            <td>TR47 / SIP22 (Longer 8-cut)</td>
        </tr>
    </table>

    <div class="warning">
        <strong>Critical:</strong> Do not confuse this key with the older <code>HYQ14AAB</code> (Page 1: 94). They look
        identical but are NOT cross-compatible.
    </div>

    <h2>Required Equipment</h2>
    <ul>
        <li><strong>Autel IM608 / IM508</strong> or <strong>Xhorse VVDI Key Tool Plus</strong></li>
        <li><strong>Autel APB112</strong> or <strong>Xhorse Simulator</strong> (Recommended for AKL)</li>
        <li>New or Unlocked (Virgin) Smart Key (FCC: HYQ14FBA)</li>
    </ul>

    <h2>AKL Procedure (Using Autel APB112 Simulator)</h2>
    <ol>
        <li><strong>Connect Tool:</strong> Plug your Autel into the OBD-II port.</li>
        <li><strong>Select Vehicle:</strong> Toyota -> Avalon -> 2013-2018 -> Smart Key.</li>
        <li><strong>Backup Immobilizer:</strong> Select "Back up IMMO Data". This is the most critical step. The tool
            will save the "EEPROM" data from the Smart Box.</li>
        <li><strong>Generate Simulator:</strong> Select "Generate Simulator Key". Select the backup file from Step 3.
            Plug the APB112 into the tool''s USB port.</li>
        <li><strong>Verify Simulator:</strong> Use the APB112 to turn the ignition ON. If the car chirps or the dash
            lights up, you have a successful "Master Key".</li>
        <li><strong>Add Key:</strong> With the ignition ON via simulator, select "Add Smart Key". Follow the prompts to
            touch the APB112 to the button, then the new key to the button.</li>
    </ol>

    <h2>Common Issues</h2>
    <ul>
        <li><strong>Communication Error:</strong> Ensure the battery is above 12.5V. Toyota Smart Boxes are very
            sensitive to voltage.</li>
        <li><strong>Failed to Generate Simulator:</strong> Some 2017-2018 models have a newer Smart Box version. If
            APB112 fails, you may need to perform an <strong>OBD Reset</strong> (16 minutes) or pull the Smart Box for
            bench reading.</li>
    </ul>

</body>

</html>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('acura-mdx-2014-2018', 'Acura', 'Mdx', 2014, 2018, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
 <h2 class="text-2xl font-bold text-white mb-4">Acura MDX 2014-2018</h2>
 <div class="space-y-6">
  <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
   <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
   <p class="text-slate-300">XTOOL EZ400 Pro (or similar)<br>Programmed Smart Key<br>New Smart Key</p>
  </div>
  <div>
   <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
   <ol class="list-decimal list-inside space-y-2 text-slate-300">
    <li>Connect programmer to OBD-II port.</li>
    <li>Navigate: Immobilization -&gt; Acura -&gt; Smart Key System -&gt; [Key Type]. Select Add a smart key.</li>
    <li>Confirm ignition can be turned ON. Double-click the Start button to enter accessory mode.</li>
    <li>Follow prompt to take ALL smart keys (new and old) out of the vehicle (approx. 10-15 feet away).</li>
    <li>Bring ONE existing programmed smart key back into the vehicle and press OK.</li>
    <li>Wait for system configuration.</li>
    <li>Take the programmed smart key OUT of the vehicle again.</li>
    <li>Bring the NEW unprogrammed smart key INTO the vehicle and press OK.</li>
    <li>The programmer will communicate with the vehicle.</li>
    <li>Within 15 seconds, switch the ignition OFF (press Start button twice).</li>
    <li>Within 15 seconds, switch the ignition ON (press Start button twice).</li>
    <li>Repeat the OFF/ON cycle as prompted, confirming the security light on the dash goes out.</li>
    <li>Once ''Program Success'' is displayed, test all key functions.</li>
   </ol>
  </div>
  <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
   <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
   <p class="text-red-200/80 text-sm">All other keys must be removed from the vehicle''s vicinity for the system to recognize the single key being added.</p>
  </div>
 </div>
</div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('toyota-rav4-2019-2024', 'Toyota', 'Rav4', 2019, 2024, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
            <h2 class="text-2xl font-bold text-white mb-4">Toyota RAV4 2019-2024</h2>
            <div class="space-y-6">
                <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
                    <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
                    <p class="text-slate-300">Autel IM508, working key, new smart key.</p>
                </div>
                <div>
                    <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
                    <ol class="list-decimal list-inside space-y-2 text-slate-300">
                        <li>First, Backup Immobilizer Data. Navigate: Toyota -&gt; Control Unit -&gt;
Keyless System -&gt; Backup immobilizer data via OBD. Turn ignition OFF
and hazards ON. This saves an EEPROM file and allows function without a</li>
                        <li>If the system is full (max keys reached), you must Erase Keys.
* Navigate to Erase Keys. The tool will use the saved EEPROM file.
* Hold the key you wish to KEEP near the start button until it beeps
once. This key will be retained; all others will be erased.</li>
                        <li>To add a new key, navigate to Add Smart Key.</li>
                        <li>Turn ignition ON. The tool will use the backed-up data to bypass the
PIN.</li>
                        <li>Hold the working key near the start button (beeps once), then hold the
new key near the start button (beeps twice).</li>
                        <li>Follow final prompts to hold the new key to the button again to finalize.
"Learning succeeded" will be displayed.</li>
                        <li>* This procedure is identical to the Toyota Camry (2018-2024)
process.
* Part 1: Program Key Chip. Set programmer to KEY, ignition ON
with working key, plug in programmer, wait for solid red
security light, swap to new key, wait 60 seconds for light to go
out.
* Part 2: Program Remote. Set programmer to REMOTE,
ignition ON with working key, plug in programmer, wait for
beeps, open door, press Lock+Unlock then Lock on new
remote.</li>
                    </ol>
                </div>
                
                <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
                    <p class="text-red-200/80 text-sm">Backing up the immobilizer data is the critical first step. When erasing
keys, be extremely careful to keep the one you want to save; erased keys
cannot be re-learned.</p>
                </div>
            </div>
        </div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('jeep-grand-cherokee-2014-2021', 'Jeep', 'Grand Cherokee', 2014, 2021, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
            <h2 class="text-2xl font-bold text-white mb-4">Jeep Grand Cherokee 2014-2021</h2>
            <div class="space-y-6">
                <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
                    <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
                    <p class="text-slate-300">Tom''s Key Programmer (Bluetooth OBD device), smartphone with companion app,
working key fob, new key fob.</p>
                </div>
                <div>
                    <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
                    <ol class="list-decimal list-inside space-y-2 text-slate-300">
                        <li>Download the companion app to your smartphone and install it.</li>
                        <li>Plug the Bluetooth programmer into the vehicle''s OBD-II port. The light will turn green.</li>
                        <li>Open the app and scan the QR code on the programmer to pair via Bluetooth. Light turns blue.</li>
                        <li>The app may require a firmware update. Allow this to complete. The light will turn red during update.</li>
                        <li>Follow the in-app instructions:
• Select your vehicle (2015 Jeep Grand Cherokee).
• Turn ignition ON (press Start button twice without brake).
• Place your original working key in the vehicle and start the engine. Press Next in the app.
• Turn ignition OFF. Turn ignition back ON (without starting).
• Turn ignition OFF again and turn on the hazard lights.</li>
                        <li>The app will begin a 10-minute security communication process.</li>
                        <li>Once complete, remove ALL keys from the vehicle.</li>
                        <li>Place the NEW key to be paired on the center console near the designated sensor area.</li>
                        <li>Within 30 seconds, repeatedly press and release the UNLOCK button on the new key.</li>
                        <li>The vehicle''s doors will lock to confirm the pairing is complete.</li>
                        <li>Unplug the programmer, turn off hazards, and test the new key.</li>
                    </ol>
                </div>
                
                <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
                    <p class="text-red-200/80 text-sm">• This method requires a Bluetooth connection and a dedicated smartphone app.
• Ensure all other smart keys are far away from the vehicle during the final pairing step.
• The center console has a specific location where the new key must be placed to be detected.</p>
                </div>
            </div>
        </div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('toyota-camry-2018-2024', 'Toyota', 'Camry', 2018, 2024, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
            <h2 class="text-2xl font-bold text-white mb-4">Toyota Camry 2018-2024</h2>
            <div class="space-y-6">
                <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
                    <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
                    <p class="text-slate-300">Tom''s Car Key Programmer, working master key, new uncut key.</p>
                </div>
                <div>
                    <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
                    <ol class="list-decimal list-inside space-y-2 text-slate-300">
                        <li>Confirm you have a MASTER key: Insert the working key into the ignition. The red security light on the dash
should turn off immediately. (If it stays solid for 2 seconds, it''s a valet key and won''t work).</li>
                        <li>Slide the switch on the programmer to the KEY side.</li>
                        <li>Insert the working key and turn the ignition two clicks to the ON position (do not start car).</li>
                        <li>Plug the programmer into the OBD-II port. It will start beeping.</li>
                        <li>Watch the security light on the dash. When it turns SOLID RED, the system is in programming mode.</li>
                        <li>Remove the working key and insert the NEW, uncut key.</li>
                        <li>The security light will now blink slowly (once per second) for 60 seconds.</li>
                        <li>After 60 seconds, the light will stop blinking and turn off. The new key''s chip is now programmed.</li>
                        <li>Slide the switch on the programmer to the REMOTE side.</li>
                        <li>Insert the working key and turn the ignition two clicks to the ON position.</li>
                        <li>Plug in the programmer. It will start beeping.</li>
                        <li>When the beep pattern changes, OPEN the driver''s door.</li>
                        <li>On the NEW remote, press and hold the Lock and Unlock buttons together for 1 second, then release.</li>
                        <li>Immediately press the Lock button once.</li>
                        <li>The vehicle will beep or cycle the locks to confirm the remote is programmed.</li>
                    </ol>
                </div>
                
                <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
                    <p class="text-red-200/80 text-sm">The key chip and the remote must be programmed in two separate procedures. Ensure the programmer switch is in the correct
position for each part.</p>
                </div>
            </div>
        </div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('dodge-ram-1500-2019-2024', 'Dodge', 'Ram 1500', 2019, 2024, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
            <h2 class="text-2xl font-bold text-white mb-4">Dodge Ram 1500 2019-2024</h2>
            <div class="space-y-6">
                <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
                    <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
                    <p class="text-slate-300">Autel IM508/IM100 or AutoProPAD, Star Connector/Bypass Cable, new smart key, Wi-Fi connection.</p>
                </div>
                <div>
                    <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
                    <ol class="list-decimal list-inside space-y-2 text-slate-300">
                        <li>Locate the Security Gateway Module (SGM). On passenger side, connect the Star Connector / bypass cable. Connect the programmer to the OBD-II port via the cable.</li>
                        <li>Turn the vehicle''s hazard lights ON to wake up the BCM.</li>
                        <li>On the programmer, use Automatic Selection to read the VIN.</li>
                        <li>First, you must Read PIN Code. Navigate to Control Unit -> Immobilizer Password. This requires an internet connection and will take 1-10 minutes. The programmer will display a 5-digit PIN code.</li>
                        <li>Navigate: Control Unit -> Keyless System -> Key Learning.</li>
                        <li>(Optional) Select ''Number of keys'' to verify how many are currently programmed.</li>
                        <li>Select Key Learning.</li>
                        <li>Remove all existing keys far away from the vehicle. Keep only the new key inside.</li>
                        <li>The tool will auto-populate the PIN code. Confirm it is correct.</li>
                        <li>When prompted, press and hold the NEW smart key against the Start/Stop button.</li>
                        <li>Hold it there until the tool registers the key (approx. 30 seconds) and instructs you to release the button.</li>
                        <li>Press OK on the programmer. Learning is successful. Select NO when asked to learn another key.</li>
                        <li>Test all key functions.</li>
                    </ol>
                </div>
                
                <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
                    <p class="text-red-200/80 text-sm">* A Star Connector / Bypass Cable is MANDATORY for these vehicles. The standard OBD-II port will not work for key programming.<br>* A stable Wi-Fi connection is required to pull the PIN code from the server.<br>* When learning the new key, hold it firmly against the Start button.<br>* For some keys, the chip value must match the original (e.g., 7953 mary). If a key fails to program, verify the chip type.</p>
                </div>
            </div>
        </div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('chevrolet-silverado-2014-2018', 'Chevrolet', 'Silverado', 2014, 2018, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
            <h2 class="text-2xl font-bold text-white mb-4">Chevrolet Silverado 2014-2018</h2>
            <div class="space-y-6">
                <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
                    <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
                    <p class="text-slate-300"><b>Section 1: Program a Basic Remote (On-Board)</b><br>Advanced Diagnostics MVP Pro, programmed key.<br><br><b>Section 2: Add/Replace Key Fob (Bladed Key)</b><br>Autel IM608, new key fob.<br><br><b>Section 3: All Keys Lost (Keyed Ignition)</b><br>AutoProPAD G2 Turbo, two new keys.</p>
                </div>
                <div>
                    <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
                    <ol class="list-decimal list-inside space-y-2 text-slate-300">
                        <li><b>Section 1: Program a Basic Remote (On-Board)</b><br>Switch ignition ON with a working key.</li>
                        <li>On programmer, navigate: GM -> Remote ->By Vehicle -> [Select Silverado details).</li>
                        <li>Follow prompt: Press and hold Lock andUnlock on new remote for up to 8 seconds.</li>
                        <li>Listen for an audible beep, confirming success.</li>
                        <li>Turn ignition OFF and test remote.</li><br><li><b>Section 2: Add/Replace Key Fob (Bladed Key)</b><br>Connect programmer to OBD-II port.</li>
                        <li>Navigate: Hot Functions -> Immobilizer andKeys -> Add/Replace Fobs.</li>
                        <li>Select an empty fob slot (e.g., Fob 1).</li>
                        <li>Follow prompts and press Learn. Dash willshow "Remote Learning Pending."</li>
                        <li>Press and hold Lock and Unlock on new fobuntil you hear a beep.</li>
                        <li>Programmer confirms fob is learned. Exitand test.</li><br><li><b>Section 3: All Keys Lost (Keyed Ignition)</b><br>Read PIN: Go to Mobilization -> GM -> ReadSecurity Code -> BCM Read Pin Code. Note 4-digitPIN (internet required).</li>
                        <li>Navigate: Immobilizer -> By Vehicle -> Silverado-> 2017+ -> Program Keys without Smart.</li>
                        <li>Select All Keys Lost.</li>
                        <li>Turn ignition OFF and ON again. Enter 4-digit PIN.</li>
                        <li>A 10-minute security wait will begin. Wait for thecountdown.</li>
                        <li>When wait is over, theft light goes out.</li>
                        <li>Insert first key, turn ignition ON. Press OK.</li>
                        <li>Select YES to program another. Turn ignition OFF,swap to second key, turn ignition ON. Press OK.</li>
                        <li>Select NO to finish.</li>
                        <li>Test both keys.</li>
                    </ol>
                </div>
                
                <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
                    <p class="text-red-200/80 text-sm"><b>Section 1:</b> Some older models allowed on-board programming without a tool, but 2015+ models typically require a programmer.<br><br><b>Section 2:</b> This procedure replaces an existing fob slot with the new one.<br><br><b>Section 3:</b>A 10-minute security wait is mandatory. Requires programming a minimum of two keys.</p>
                </div>
            </div>
        </div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('toyota-sequoia-2008-2019', 'Toyota', 'Sequoia', 2008, 2019, '<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Toyota Sequoia 2008-2019 Programming Guide</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        h1,
        h2,
        h3 {
            color: #0056b3;
        }

        .warning {
            background: #fff3cd;
            border-left: 5px solid #ffca28;
            padding: 15px;
            margin: 20px 0;
        }

        .tip {
            background: #d1ecf1;
            border-left: 5px solid #0dcaf0;
            padding: 15px;
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th,
        td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }

        th {
            background: #f8f9fa;
        }

        code {
            background: #f1f1f1;
            padding: 2px 4px;
            border-radius: 4px;
        }
    </style>
</head>

<body>
    <h1>Toyota Sequoia 2008-2019 AKL Programming Guide</h1>

    <p>This guide covers All Keys Lost (AKL) procedures for the Toyota Sequoia (2008-2019). This vehicle primarily uses
        a <strong>Bladed Key</strong> system, but some premium trims feature a Smart Key.</p>

    <h2>Key Specifications (Bladed Key)</h2>
    <table>
        <tr>
            <th>Ignition Type</th>
            <td>Traditional Metal Blade (Flat 8-cut)</td>
        </tr>
        <tr>
            <th>Chip Type (2008-2010*)</th>
            <td><strong>4D-67</strong> (Identified by a "Dot" on the blade)</td>
        </tr>
        <tr>
            <th>Chip Type (2010*-2019)</th>
            <td><strong>G Chip</strong> (Identified by a "G" on the blade)</td>
        </tr>
        <tr>
            <th>Blade Profile</th>
            <td>TOY43</td>
        </tr>
        <tr>
            <th>Remote FCC ID</th>
            <td><code>GQ43VT20T</code></td>
        </tr>
    </table>

    <div class="warning">
        <strong>Important:</strong> 2010 was a transition year for the Sequoia. Verify the chip type (Dot or G) before
        cutting the key.
    </div>

    <h2>Smart Key Specifications (Limited/Platinum Trims)</h2>
    <table>
        <tr>
            <th>System Type</th>
            <td>Push-to-Start</td>
        </tr>
        <tr>
            <th>FCC ID</th>
            <td><code>HYQ14AAB</code> or <code>HYQ14ACX</code></td>
        </tr>
        <tr>
            <th>Technical Value</th>
            <td>Page 1: <strong>94</strong> or <strong>98</strong></td>
        </tr>
    </table>

    <h2>Required Equipment</h2>
    <ul>
        <li><strong>Autel IM608 Pro / IM508</strong> or <strong>Xhorse VVDI Key Tool Plus</strong></li>
        <li>Correct Transponder Blank (4D-67 or G)</li>
        <li>Key Cutting Machine (e.g., Xhorse Dolphin)</li>
    </ul>

    <h2>AKL Procedure (Bladed Key via OBD)</h2>
    <ol>
        <li><strong>Cut Master Key:</strong> Cut a new key to the mechanical code (Lishi TOY43).</li>
        <li><strong>Connect Tool:</strong> Plug the scanner into the OBD-II port.</li>
        <li><strong>Select Vehicle:</strong> Toyota -> Sequoia -> 2008-2019 -> Blade Key.</li>
        <li><strong>Immobilizer Reset:</strong> Select "All Keys Lost" or "Reset Immobilizer".</li>
        <li><strong>Security Wait:</strong> The tool will begin a 16-minute security reset. Ensure the key is in the
            <strong>ON</strong> position and the battery is stable.</li>
        <li><strong>Learning:</strong> After the 16 minutes, the security light will stop flashing. Remove the key and
            re-insert the Master Key. The security light should go out. Cycle the key to ON to finish.</li>
    </ol>

    <h2>Manual Remote Programming (Bladed Key)</h2>
    <ol>
        <li>Driver''s door open and unlocked. Key out of ignition.</li>
        <li>Insert and remove key twice within 5 seconds.</li>
        <li>Close and open driver''s door twice.</li>
        <li>Insert and remove key once.</li>
        <li>Close and open driver''s door twice.</li>
        <li>Insert key and close door.</li>
        <li>Turn ignition ON then OFF. Remove key.</li>
        <li>Locks should cycle. Press LOCK and UNLOCK on the remote for 1.5s, then LOCK for 1s.</li>
    </ol>

    <div class="tip">
        <strong>Pro Tip:</strong> For Smart Key variants, use the <strong>APB112 Simulator</strong> to bypass the
        16-minute wait by backing up the IMMO data and generating a simulator key first.
    </div>

</body>

</html>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('toyota-avalon-2007-2012', 'Toyota', 'Avalon', 2007, 2012, '<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Toyota Avalon 2007-2012 Programming Guide</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        h1,
        h2,
        h3 {
            color: #0056b3;
        }

        .warning {
            background: #fff3cd;
            border-left: 5px solid #ffca28;
            padding: 15px;
            margin: 20px 0;
        }

        .tip {
            background: #d1ecf1;
            border-left: 5px solid #0dcaf0;
            padding: 15px;
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th,
        td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }

        th {
            background: #f8f9fa;
        }

        code {
            background: #f1f1f1;
            padding: 2px 4px;
            border-radius: 4px;
        }
    </style>
</head>

<body>
    <h1>Toyota Avalon 2007-2012 AKL Programming Guide</h1>

    <p>This guide covers All Keys Lost (AKL) procedures for the Toyota Avalon (2007-2012) equipped with Push-Button
        Start.</p>

    <div class="tip">
        <strong>Time Saver:</strong> Using a <strong>Smart Key Simulator</strong> (like Autel APB112 or Xhorse Lonsdor)
        allows you to bypass the standard 16-minute security reset.
    </div>

    <h2>Key Specifications (Smart Key)</h2>
    <table>
        <tr>
            <th>System Type</th>
            <td>Gen 1 Smart Key (Push-to-Start)</td>
        </tr>
        <tr>
            <th>FCC ID</th>
            <td><code>HYQ14AAB</code> or <code>HYQ14AEM</code></td>
        </tr>
        <tr>
            <th>IC</th>
            <td>1551A-14AAB</td>
        </tr>
        <tr>
            <th>Frequency</th>
            <td>315 MHz</td>
        </tr>
        <tr>
            <th>Technical Value</th>
            <td>Page 1: <strong>94</strong></td>
        </tr>
        <tr>
            <th>Emergency Blade</th>
            <td>TR47 (8-cut)</td>
        </tr>
    </table>

    <div class="warning">
        <strong>Note:</strong> Some lower trims may use a Remote Head Key (FCC: GQ4-29T) with a 4D-67 chip. This guide
        focuses on the more common Smart Key system.
    </div>

    <h2>Required Equipment</h2>
    <ul>
        <li><strong>Autel IM608 / IM508</strong> or <strong>Xhorse VVDI Key Tool Plus</strong></li>
        <li><strong>Autel APB112</strong> (Optional: to bypass 16-min wait)</li>
        <li>New or Unlocked (Virgin) Smart Key (FCC: HYQ14AAB)</li>
    </ul>

    <h2>AKL Procedure (Using Autel APB112 Simulator)</h2>
    <ol>
        <li><strong>Connect Tool:</strong> Plug your Autel into the OBD-II port.</li>
        <li><strong>Select Vehicle:</strong> Toyota -> Avalon -> 2007-2012 -> Smart Key.</li>
        <li><strong>Backup Immobilizer:</strong> Select "Back up IMMO Data". This copies the data from the Smart Key
            box.</li>
        <li><strong>Generate Simulator:</strong> Select "Generate Simulator Key" (using the backup file). Plug the
            APB112 into the USB port of the tool.</li>
        <li><strong>Verify Simulator:</strong> Once generated, the APB112 acts as a working key. Tap the Start button
            with the APB112 to verify the ignition turns on.</li>
        <li><strong>Add Key:</strong> Select "Add Smart Key". Follow the prompts to touch the APB112 to the Start
            button, then touch the new key to the button.</li>
    </ol>

    <h2>AKL Procedure (Standard 16-Minute Reset)</h2>
    <p>If you do NOT have a simulator, you must perform a full reset:</p>
    <ol>
        <li>Select "Immobilizer Reset" or "Smart Box Reset".</li>
        <li>The tool will begin a timer (usually 16 minutes). Do NOT turn off the tool or disconnect the cable.</li>
        <li>Once the reset is complete, the Smart Box is in "Auto-Learn" mode. Touch the new key to the Start button to
            register it.</li>
    </ol>

    <div class="warning">
        <strong>Battery Stability:</strong> Always connect a battery maintainer during the 16-minute reset. If the
        voltage drops too low, the reset will fail and could potentially lock the Smart Box.
    </div>

</body>

</html>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('toyota-mirai-2016-2020', 'Toyota', 'Mirai', 2016, 2020, '<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Toyota Mirai 2016-2020 Programming Guide</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        h1,
        h2,
        h3 {
            color: #0056b3;
        }

        .warning {
            background: #fff3cd;
            border-left: 5px solid #ffca28;
            padding: 15px;
            margin: 20px 0;
        }

        .tip {
            background: #d1ecf1;
            border-left: 5px solid #0dcaf0;
            padding: 15px;
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th,
        td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }

        th {
            background: #f8f9fa;
        }

        code {
            background: #f1f1f1;
            padding: 2px 4px;
            border-radius: 4px;
        }
    </style>
</head>

<body>
    <h1>Toyota Mirai 2016-2020 AKL Programming Guide</h1>

    <p>This guide covers All Keys Lost (AKL) procedures for the Toyota Mirai Hydrogen Fuel Cell vehicle (2016-2020).
        This vehicle uses a high-security Smart Key system.</p>

    <div class="warning">
        <strong>Technical Requirement:</strong> The Mirai is a complex vehicle. Always use a battery maintainer! Low
        voltage can cause a complete lock-out of the Smart Box during programming.
    </div>

    <h2>Key Specifications (Smart Key)</h2>
    <table>
        <tr>
            <th>System Type</th>
            <td>8A Smart Key (DST-AES)</td>
        </tr>
        <tr>
            <th>FCC ID</th>
            <td><code>HYQ14FBE</code> (Common) or <code>HYQ14FBA</code></td>
        </tr>
        <tr>
            <th>Frequency</th>
            <td>315 MHz</td>
        </tr>
        <tr>
            <th>Technical Value</th>
            <td>Page 1: <strong>A8</strong></td>
        </tr>
        <tr>
            <th>Emergency Blade</th>
            <td>TR47 / SIP22 (8-cut)</td>
        </tr>
    </table>

    <h2>Required Equipment</h2>
    <ul>
        <li><strong>Autel IM608 Pro / IM508</strong></li>
        <li><strong>Autel G-Box2 or G-Box3</strong> (Required for fast data calculation)</li>
        <li><strong>Autel APB112 Smart Key Simulator</strong></li>
        <li>New Toyota Smart Key (FCC: HYQ14FBE)</li>
    </ul>

    <h2>AKL Procedure (Advanced OBD bypassing PIN)</h2>
    <ol>
        <li><strong>Backup:</strong> Connect the Autel to the OBD-II port. Connect the G-Box2/3 as per the tool''s
            on-screen diagram. Select "Backup IMMO Data".</li>
        <li><strong>Generate Simulator:</strong> Once data is backed up, the tool will prompt to generate a simulator
            key using the <strong>APB112</strong>. Plug the APB112 into the tool.</li>
        <li><strong>Initial Start:</strong> Once generated, press the Start button on the dash once, then hold the
            APB112 directly against the button. The car should "wake up" (Instrument cluster turns on).</li>
        <li><strong>Add Key:</strong> With the vehicle "awakened" by the simulator, select "Add Smart Key".</li>
        <li><strong>Learning:</strong> Follow the prompts to touch the APB112 to the button, then touch the <strong>New
                Key</strong> to the button. The dashboard will chirp or the hazard lights will flash to confirm
            registration.</li>
        <li><strong>Finalization:</strong> Test all remote buttons (Lock/Unlock) and the Proximity entry (handle touch).
        </li>
    </ol>

    <div class="tip">
        <strong>Autel G-Box Benefit:</strong> Using the G-Box allows the tool to read the data from the Smart Box much
        faster than a standard OBD read, significantly reducing the risk of a timeout.
    </div>

</body>

</html>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('toyota-prado-2010-2024', 'Toyota', 'Prado', 2010, 2024, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
    <h2 class="text-2xl font-bold text-white mb-4">Toyota Prado 2010-2024</h2>
    <div class="space-y-6">
        <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
            <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
            <p class="text-slate-300">Autel IM508/IM608, Xhorse Key Tool Plus, or similar. For AKL: APB112 Emulator /
                G-Box may be required.</p>
        </div>
        <div>
            <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
            <ol class="list-decimal list-inside space-y-2 text-slate-300">
                <li><b>Add Key (with working key):</b><br>Connect programmer to OBD-II. Navigate to: Toyota -> Prado ->
                    Smart Key system.</li>
                <li>Select "Add Smart Key". Turn ignition ON.</li>
                <li>Follow prompts: Hold working key to Start button (hear 1 beep).</li>
                <li>Immediately hold NEW key to Start button (hear 2 beeps).</li>
                <li>Wait for "Learning Succeeded" message.</li>
                <br>
                <li><b>All Keys Lost (AKL):</b><br><b>Method A (2010-2017 "G" or early Smart):</b> often requires a
                    16-minute Immo Reset.</li>
                <li><b>Method B (2018+ "8A" Smart):</b> Requires "Back up IMMO Data" via OBD.</li>
                <li>Connect programmer to OBD. Select "Back up IMMO Data" (Internet required).</li>
                <li>Save the file. Go to "Generate Simulator Key".</li>
                <li>Load the file and place APB112 Emulator in the programmer coil.</li>
                <li>The Emulator now acts as a working Master Key. Use it to turn ignition ON.</li>
                <li>Proceed to "Add Smart Key" using the Emulator as the working key.</li>
            </ol>
        </div>
        <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
            <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
            <p class="text-red-200/80 text-sm">Most 2018+ models use the <b>14FCF</b> FCC ID (433MHz). Ensure you have
                the correct frequency. 8A chip systems generally do NOT support a simple "Reset" without an emulator or
                seed code.</p>
        </div>
    </div>
</div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('nissan-altima-2013-2018', 'Nissan', 'Altima', 2013, 2018, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
            <h2 class="text-2xl font-bold text-white mb-4">Nissan Altima 2013-2018</h2>
            <div class="space-y-6">
                <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
                    <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
                    <p class="text-slate-300">Simple Key Programmer (Tom''s Key), one working key fob, new key fob.</p>
                </div>
                <div>
                    <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
                    <ol class="list-decimal list-inside space-y-2 text-slate-300">
                        <li>Look up the activation code in the user guide (e.g., code 42 for a 2015 Altima).</li>
                        <li>Press and hold the top (Lock) and bottom (Panic) buttons on the new fob simultaneously until
a solid blue light appears.</li>
                        <li>Enter the first digit (4) by git (4) by pressing the top button that many times.</li>
                        <li>Enter the second digit (2) by pressing the second button that many times.</li>
                        <li>Press the bottom button for ~2 seconds. The fob will flash back the code to confirm success (4 flashes, pause, 2 flashes).</li>
                        <li>Set the dial on the programmer to the correct position (e.g., position 7).</li>
                        <li>Plug the programmer into the OBD-II port.</li>
                        <li>Open and close the driver door, then turn on the hazard lights. Press to continue on the programmer.</li>
                        <li>Press and hold the vehicle''s Start button until the dash lights turn on. Let go and press to continue.</li>
                        <li>Turn ignition OFF.</li>
                        <li>Press the Start button with the first remote (the working one). The security light on the dash will flash 5 times. This re-
pairs the existing remote. Press to continue.</li>
                        <li>Turn ignition OFF.</li>
                        <li>Choose to pair another key. Press and hold the button.</li>
                        <li>Press the Start button with the NEW remote. The security light will flash 5 times.</li>
                        <li>Turn ignition OFF. End the pairing process.</li>
                        <li>Follow the final prompts to turn the ignition ON and then OFF to complete registration.</li>
                    </ol>
                </div>
                
                <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
                    <p class="text-red-200/80 text-sm">Programming erases all fobs, so you must re-pair your existing working fob first, followed by the new one. Ensure the
battery is good and all accessories are off before starting.</p>
                </div>
            </div>
        </div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('bmw-3-series--e90----5-series--e60--2005-2013', 'Bmw', '3 Series  E90    5 Series  E60 ', 2005, 2013, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
 <h2 class="text-2xl font-bold text-white mb-4">BMW 3 Series (E90) & 5 Series (E60) 2005-2013</h2>
 <div class="space-y-6">
  <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
   <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
   <p class="text-slate-300">Autel IM series with XP400 programmer, working factory key, new key.</p>
  </div>
  <div>
   <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
   <ol class="list-decimal list-inside space-y-2 text-slate-300">
    <li>Connect the programmer to the OBD-II port and ensure an internet connection.</li>
    <li>Navigate: BMW -&gt; Smart Selection. The tool will identify the CAS3+ system.</li>
    <li>Select Key Operation -&gt; Add Key.</li>
    <li>The programmer will read RAM. Follow the prompt to remove the key from the ignition slot.</li>
    <li>The tool will back up the original key data. Save the file.</li>
    <li>The programmer will display available key slots. Select an empty one (e.g., slot 9).</li>
    <li>Follow the prompt: connect the XP400 programmer and place the WORKING key into the programmer''s key slot. Press OK.</li>
    <li>The tool reads the working key''s information.</li>
    <li>Remove the working key and place the NEW key into the XP400 programmer''s slot. Press OK.</li>
    <li>The tool will pre-process and write to the new key.</li>
    <li>Once generation is successful, remove the new key from the programmer, insert it into the vehicle''s ignition slot, press the brake, and start the car to complete programming.</li>
   </ol>
  </div>
  <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
   <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
   <p class="text-red-200/80 text-sm">An internet connection is required.<br>Backing up the original key data is a critical first step.<br>The remote functions (lock/unlock) are programmed simultaneously.</p>
  </div>
 </div>
</div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('bmw-5-series--f10--2012-2017', 'Bmw', '5 Series  F10 ', 2012, 2017, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
 <h2 class="text-2xl font-bold text-white mb-4">BMW 5 Series (F10) 2012-2017</h2>
 <div class="space-y-6">
  <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
   <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
   <p class="text-slate-300">Otofix IM1 with XP1 Pro (or similar advanced programmer), working key, new key.</p>
  </div>
  <div>
   <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
   <ol class="list-decimal list-inside space-y-2 text-slate-300">
    <li>Connect the programmer to the OBD-II port. Run an IMO Status Scan and clear all DTCs before starting. This is a critical first step.</li>
    <li>Select Key Add (Guided Function).</li>
    <li>Follow the tool''s detailed, multi-step process, which includes:<br>• Step 1: Pre-processing. This involves reading and saving ECU data and may require an internet connection. Follow all on-screen instructions carefully.<br>• Step 2: Generate a Key. This step writes the saved data to the new key.</li>
    <li>When prompted, place the new key close to the induction coil on the steering column.</li>
    <li>Press and hold the Start button for 10 seconds as directed.</li>
    <li>The tool will confirm when the key is learned successfully.</li>
    <li>Remove the original working key far from the vehicle and test starting the car with the new key.</li>
    <li>Test all remote and proximity functions.</li>
   </ol>
  </div>
  <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
   <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
   <p class="text-red-200/80 text-sm">Clearing all Diagnostic Trouble Codes (DTCs) before beginning is essential for success. This is a complex, multi-stage process; follow the guided steps on your specific programmer precisely.</p>
  </div>
 </div>
</div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('hyundai-sonata-2015-2019', 'Hyundai', 'Sonata', 2015, 2019, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
            <h2 class="text-2xl font-bold text-white mb-4">Hyundai Sonata 2015-2019</h2>
            <div class="space-y-6">
                <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
                    <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
                    <p class="text-slate-300">Autel KM100, new smart key, internet connection.</p>
                </div>
                <div>
                    <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
                    <ol class="list-decimal list-inside space-y-2 text-slate-300">
                        <li>Connect programmer to OBD-II port. Turn hazard lights ON and close the driver''s door.</li>
                        <li>First, you must Read PIN Code. Navigate: Control Unit -&gt; Read PIN code (select
8A for this model). An internet connection is required. The tool will display a
6-digit PIN code.</li>
                        <li>Navigate: Keyless System -&gt; Smart Key Learning.</li>
                        <li>Confirm that this process will delete existing keys.</li>
                        <li>Turn ignition OFF and open/close the driver''s door once. Press OK.</li>
                        <li>The tool will verify the PIN code it just read.</li>
                        <li>Within 5 seconds of pressing OK, press the NEW smart key against the
Start/Stop button. The tool will confirm success.</li>
                        <li>If programming a second key, press YES and repeat the process with the next
key.</li>
                        <li>Press NO when finished. Test all keys.</li>
                    </ol>
                </div>
                
                <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
                    <p class="text-red-200/80 text-sm">Reading the PIN code via the programmer is the essential first step and
requires an internet connection. You must hold the fob directly on the
start button for it to be recognized.</p>
                </div>
            </div>
        </div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('toyota-prius-2016-2022', 'Toyota', 'Prius', 2016, 2022, '<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Toyota Prius 2016-2022 Programming Guide</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        h1,
        h2,
        h3 {
            color: #0056b3;
        }

        .warning {
            background: #fff3cd;
            border-left: 5px solid #ffca28;
            padding: 15px;
            margin: 20px 0;
        }

        .tip {
            background: #d1ecf1;
            border-left: 5px solid #0dcaf0;
            padding: 15px;
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th,
        td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }

        th {
            background: #f8f9fa;
        }

        code {
            background: #f1f1f1;
            padding: 2px 4px;
            border-radius: 4px;
        }
    </style>
</head>

<body>
    <h1>Toyota Prius 2016-2022 AKL Programming Guide</h1>

    <p>This guide covers All Keys Lost (AKL) procedures for the 4th Generation Toyota Prius (2016-2022).</p>

    <div class="warning">
        <strong>2021-2022 Model Alert:</strong> Newer Prius models may use the <strong>8A-BA</strong> platform. These
        often require a specialized <strong>8A AKL Cable</strong> to connect directly to the Smart Key ECU (behind the
        dash) to bypass the security gateway.
    </div>

    <h2>Key Specifications (Smart Key)</h2>
    <table>
        <tr>
            <th>System Type</th>
            <td>8A Smart Key (DST-AES)</td>
        </tr>
        <tr>
            <th>FCC ID</th>
            <td><code>HYQ14FBE</code> or <code>HYQ14FBC</code></td>
        </tr>
        <tr>
            <th>Frequency</th>
            <td>315 MHz</td>
        </tr>
        <tr>
            <th>Technical Value</th>
            <td>Page 1: <strong>A8</strong></td>
        </tr>
        <tr>
            <th>Emergency Blade</th>
            <td>TR47 / SIP22 (8-cut)</td>
        </tr>
    </table>

    <h2>Required Equipment</h2>
    <ul>
        <li><strong>Autel IM608 Pro / IM508</strong></li>
        <li><strong>Autel APB112 Smart Key Simulator</strong></li>
        <li><strong>Toyota 8A AKL Cable</strong> (Commonly required for 2019+)</li>
        <li>New Toyota Smart Key (FCC: HYQ14FBE)</li>
    </ul>

    <h2>AKL Procedure (Standard 8A)</h2>
    <ol>
        <li><strong>Backup:</strong> Connect to the OBD-II port. Select "Backup IMMO Data". If the tool fails via OBD,
            you must use the 8A AKL cable to connect directly to the Smart Key box.</li>
        <li><strong>Generate Simulator:</strong> Use the backed-up data to generate a simulator key on the
            <strong>APB112</strong>.</li>
        <li><strong>Ignition:</strong> Use the APB112 as a "Master Key" to turn the ignition ON. The Prius "Ready" light
            may not come on, but the dash should illuminate.</li>
        <li><strong>Add Key:</strong> Select "Add Smart Key". Follow the tool''s instructions to touch the APB112 to the
            Start button, then the new key.</li>
        <li><strong>Verify:</strong> Ensure the car enters "READY" mode with the new key and all remote functions work.
        </li>
    </ol>

    <div class="tip">
        <strong>Expert Tip:</strong> If the vehicle is a 2021+ model and use of the APB112 fails, check if your tool
        supports the <strong>"PIN-Free"</strong> function via the specialized 8A-BA cable.
    </div>

</body>

</html>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('acura-tlx-2015-2018', 'Acura', 'Tlx', 2015, 2018, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
 <h2 class="text-2xl font-bold text-white mb-4">Acura TLX 2015-2018</h2>
 <div class="space-y-6">
  <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
   <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
   <p class="text-slate-300">Topdon T-Ninja Pro<br>Topdon T-Ninja Pro, original smart key, new smart key</p>
  </div>
  <div>
   <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
   <ol class="list-decimal list-inside space-y-2 text-slate-300">
    <li>Connect VCI to the OBD-II port and pair with the programmer.</li>
    <li>Navigate to Acura -&gt; [Model/Year] -&gt; Smart Key -&gt; Add Smart Key.</li>
    <li>Turn ignition ON (press Start button twice).</li>
    <li>Remove ALL smart keys from the vehicle. Press OK.</li>
    <li>Place the original smart key back into the vehicle. Press OK.</li>
    <li>Wait for communication, then remove the original key from the vehicle again.</li>
    <li>Place the NEW smart key into the car. Press OK.</li>
    <li>Follow on-screen prompts to cycle the ignition OFF and ON until the immobilizer security light goes out.</li>
    <li>When programming is complete, test the new remote''s functions.</li>
   </ol>
  </div>
  <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
   <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
   <p class="text-red-200/80 text-sm">Strictly follow the prompts for removing and introducing keys to the vehicle to avoid programming failure.</p>
  </div>
 </div>
</div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('toyota-venza-2021-2024', 'Toyota', 'Venza', 2021, 2024, '<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Toyota Venza 2021-2024 Programming Guide</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        h1,
        h2,
        h3 {
            color: #0056b3;
        }

        .warning {
            background: #fff3cd;
            border-left: 5px solid #ffca28;
            padding: 15px;
            margin: 20px 0;
        }

        .tip {
            background: #d1ecf1;
            border-left: 5px solid #0dcaf0;
            padding: 15px;
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th,
        td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }

        th {
            background: #f8f9fa;
        }

        code {
            background: #f1f1f1;
            padding: 2px 4px;
            border-radius: 4px;
        }
    </style>
</head>

<body>
    <h1>Toyota Venza 2021-2024 AKL Programming Guide</h1>

    <p>This guide covers All Keys Lost (AKL) procedures for the 2nd Generation Toyota Venza (2021-2024). This vehicle
        uses the <strong>8A-BA</strong> Smart Key architecture with a Security Gateway.</p>

    <div class="warning">
        <strong>Hardware Required:</strong> Standard OBD programming is NOT possible for AKL on this vehicle. You MUST
        have a <strong>Toyota 30-pin Bypass Cable</strong> to connect directly to the Smart Key ECU.
    </div>

    <h2>Key Specifications (Smart Key)</h2>
    <table>
        <tr>
            <th>System Type</th>
            <td>8A-BA Smart Key (TMLF19D)</td>
        </tr>
        <tr>
            <th>FCC ID</th>
            <td><code>HYQ14FBN</code></td>
        </tr>
        <tr>
            <th>Frequency</th>
            <td>315 MHz</td>
        </tr>
        <tr>
            <th>Emergency Blade</th>
            <td>TR47 / SIP22 (8-cut)</td>
        </tr>
    </table>

    <h2>Required Equipment</h2>
    <ul>
        <li><strong>Autel IM608 Pro II / IM508S</strong> or <strong>VVDI Key Tool Plus</strong></li>
        <li><strong>Toyota 30-pin Bypass Cable</strong></li>
        <li><strong>Autel APB112</strong> or <strong>Xhorse Toyota Emulator</strong></li>
        <li>New Toyota Smart Key (FCC: HYQ14FBN)</li>
    </ul>

    <h2>Preparation & Location</h2>
    <ol>
        <li><strong>Locate Smart Box:</strong> The Smart Key ECU is located behind the <strong>Glove Box</strong>.</li>
        <li><strong>Access:</strong> Open the glove box, remove the dampener arm, and squeeze the sides to drop the
            door. Remove the plastic trim panel behind it.</li>
        <li><strong>Connection:</strong> Locate the <strong>30-pin connector</strong> on the Smart Key ECU. Unplug the
            factory harness and plug your <strong>30-pin Bypass Cable</strong> in-line (or directly, depending on the
            cable type).</li>
    </ol>

    <h2>AKL Procedure</h2>
    <ol>
        <li><strong>Backup:</strong> Connect your tool to the 30-pin bypass cable. Select "Backup IMMO Data". The tool
            will read the data directly from the ECU without needing a PIN code.</li>
        <li><strong>Generate Simulator:</strong> Use the backed-up data to generate an "Emergency Key" on your simulator
            (APB112/Xhorse).</li>
        <li><strong>Waking the Vehicle:</strong> Touch the simulator key to the Start button. The instrument cluster
            should light up.</li>
        <li><strong>Add Key:</strong> Select "Add Smart Key". Follow prompts to touch the simulator to the button, then
            the <strong>New Key</strong>.</li>
        <li><strong>ID Registration:</strong> If the remote functions don''t work after programming, perform "ECU
            Communication ID Registration" via the tool''s Special Functions.</li>
    </ol>

    <div class="tip">
        <strong>Time Optimization:</strong> Ensure you have a stable internet connection on your tool, as many 8A-BA
        operations require server-side calculation of the backup data.
    </div>

</body>

</html>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('toyota-tundra-2008-2018', 'Toyota', 'Tundra', 2008, 2018, '<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Toyota Tundra 2008-2018 Programming Guide</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        h1,
        h2,
        h3 {
            color: #0056b3;
        }

        .warning {
            background: #fff3cd;
            border-left: 5px solid #ffca28;
            padding: 15px;
            margin: 20px 0;
        }

        .tip {
            background: #d1ecf1;
            border-left: 5px solid #0dcaf0;
            padding: 15px;
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th,
        td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }

        th {
            background: #f8f9fa;
        }

        code {
            background: #f1f1f1;
            padding: 2px 4px;
            border-radius: 4px;
        }
    </style>
</head>

<body>
    <h1>Toyota Tundra 2008-2018 AKL Programming Guide</h1>

    <p>This guide covers All Keys Lost (AKL) procedures for the Toyota Tundra (2008-2018). This vehicle primarily uses a
        <strong>Bladed Key</strong> system.</p>

    <h2>Key Specifications (Bladed Key)</h2>
    <table>
        <tr>
            <th>Ignition Type</th>
            <td>Traditional Metal Blade (Flat 8-cut)</td>
        </tr>
        <tr>
            <th>Chip Type (2007-2009)</th>
            <td><strong>4D-67</strong> (Identified by a "Dot" on the blade)</td>
        </tr>
        <tr>
            <th>Chip Type (2010-2017)</th>
            <td><strong>G Chip</strong> (Identified by a "G" on the blade)</td>
        </tr>
        <tr>
            <th>Chip Type (2018+)</th>
            <td><strong>H Chip</strong> (Identified by an "H" on the blade)</td>
        </tr>
        <tr>
            <th>Blade Profile</th>
            <td>TOY43</td>
        </tr>
        <tr>
            <th>Remote FCC ID</th>
            <td><code>GQ43VT20T</code> (Standard) or <code>GQ4-52T</code> (H-Chip models)</td>
        </tr>
    </table>

    <div class="warning">
        <strong>Important:</strong> Always verify the stamp on the original key blade (Dot, G, or H) to ensure you are
        using the correct transponder chip.
    </div>

    <h2>Required Equipment</h2>
    <ul>
        <li><strong>Autel IM608 Pro / IM508</strong> or <strong>Xhorse VVDI Key Tool Plus</strong></li>
        <li>Correct Transponder Blank (4D-67, G, or H)</li>
        <li>Key Cutting Machine</li>
    </ul>

    <h2>AKL Procedure (OBD Programming)</h2>
    <ol>
        <li><strong>Cut Master Key:</strong> Cut a new key to the mechanical code using a Lishi TOY43 2-in-1 or by VIN.
        </li>
        <li><strong>Connect Tool:</strong> Plug the scanner into the OBD-II port.</li>
        <li><strong>Select Vehicle:</strong> Toyota -> Tundra -> 2008-2018.</li>
        <li><strong>Immobilizer Reset:</strong> Select "All Keys Lost" or "Reset Immobilizer".</li>
        <li><strong>Security Wait:</strong>
            <ul>
                <li><strong>4D/G Chips:</strong> Standard 16-minute reset. Ignition must be ON.</li>
                <li><strong>H-Chips (2018):</strong> May require an <strong>8A AKL Cable</strong> or a specific bypass
                    depending on the tool. Some tools can reset via OBD in ~10 minutes.</li>
            </ul>
        </li>
        <li><strong>Learning:</strong> Once the reset is complete, follow the on-screen prompts to register the new
            Master Key by inserting it into the ignition. The security light should go out.</li>
    </ol>

    <h2>Manual Remote Programming (Standard)</h2>
    <ol>
        <li>Driver''s door open and unlocked. Key out of ignition.</li>
        <li>Insert and remove key twice within 5 seconds.</li>
        <li>Close and open driver''s door twice.</li>
        <li>Insert and remove key once.</li>
        <li>Close and open driver''s door twice.</li>
        <li>Insert key and close door.</li>
        <li>Turn ignition ON then OFF. Remove key.</li>
        <li>Locks should cycle. Press LOCK and UNLOCK on the remote for 1.5s, then LOCK for 1s.</li>
    </ol>

    <div class="tip">
        <strong>Pro Tip:</strong> If the ignition won''t turn to ON without a programmed chip (rare on these models), use
        a <strong>simulator key</strong> or jumper the ignition relay if instructed by your tool.
    </div>

</body>

</html>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('honda-civic-2016-2021', 'Honda', 'Civic', 2016, 2021, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
            <h2 class="text-2xl font-bold text-white mb-4">Honda Civic 2016-2021</h2>
            <div class="space-y-6">
                <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
                    <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
                    <p class="text-slate-300"><b>Section 1: Add a Smart Key</b><br>XTOOL Programmer, one working smart key, one new smart key.<br><br><b>Section 2: All Keys Lost (AKL)</b><br>Autel IM608 Pro, one new smart key.</p>
                </div>
                <div>
                    <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
                    <ol class="list-decimal list-inside space-y-2 text-slate-300">
                        <li><b>Section 1: Add a Smart Key</b><br>Connect programmer to OBD-II port. Navigate: Honda -> Smart Key System -> Add smart keys.</li>
                        <li>Turn ignition ON with the working key inside the car.</li>
                        <li>When prompted, take the WORKING smart key OUT of the car.</li>
                        <li>Bring the NEW smart key INTO the car. Press OK.</li>
                        <li>The tool will communicate. Hold the back of the new key up to the The tool will communicate. Hold the back of the new key up to the Start button.</li>
                        <li>Follow the prompts precisely: Turn ignition OFF. Turn ignition ON. Check if security indicator light is off. Turn ignition OFF. Turn ignition ON.</li>
                        <li>''Programming success'' will be displayed. Test the new key.</li><br><li><b>Section 2: All Keys Lost (AKL)</b><br>Turn emergency/hazard lights ON.</li>
                        <li>Navigate to Smart Key -> All keys lost.</li>
                        <li>Place the new key to be learned inside the vehicle. Take all other keys far away.</li>
                        <li>The ignition will be off. Select NO when asked if it''s on.</li>
                        <li>Press and hold the vehicle''s Start button until thedashboard/cluster turns on (accessory mode). Release the buttonand press OK on the programmer.</li>
                        <li>Confirm the vehicle model year (e.g., it is NOT after 2020).</li>
                        <li>The programmer will communicate and display ''Key programsuccess.''</li>
                        <li>Follow the on-screen prompts to cycle the ignition OFF and ONseveral times to complete registration.</li>
                        <li>Do NOT put your foot on the brake during the ignition cycling.</li>
                    </ol>
                </div>
                
                <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
                    <p class="text-red-200/80 text-sm"><b>Section 1:</b> The sequence of removing and adding keys must be followed exactly. Holding the key near the start button can improve communication.<br><br><b>Section 2:</b> For AKL, you must press and hold the start button to force the car into accessory mode. Pressing the start button once turns it off; pressing twice (without brake) turns it on.</p>
                </div>
            </div>
        </div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('bmw-1-series-2008-2014', 'Bmw', '1 Series', 2008, 2014, '<div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
 <h2 class="text-2xl font-bold text-white mb-4">BMW 1 Series 2008-2014</h2>
 <div class="space-y-6">
  <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
   <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
   <p class="text-slate-300">Pro Key Box Kit (or similar programmer), original key, new key fob.</p>
  </div>
  <div>
   <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
   <ol class="list-decimal list-inside space-y-2 text-slate-300">
    <li>Connect the programmer to the OBD-II port.</li>
    <li>On the programmer, navigate: Key Program -&gt; CAS3 -&gt; Keyless -&gt; Learn Key.</li>
    <li>Press the vehicle''s Push to Start button ONCE (do not start the engine). Press OK on the programmer.</li>
    <li>Select an empty key slot (e.g., Status free). Press OK.</li>
    <li>Press the vehicle''s Push to Start button ONCE again. Press OK on the programmer.</li>
    <li>The programmer will read the vehicle data.</li>
    <li>Select the correct key type (Remote Key or Keyless Go for Comfort Access).</li>
    <li>Place the NEW key into the programmer''s coil/slot as directed. Press OK.</li>
    <li>Press the vehicle''s Push to Start button ONCE. Press OK on the programmer.</li>
    <li>Wait for programming to finish.</li>
    <li>Insert the newly programmed key into the vehicle''s key slot and start the engine to finalize.</li>
    <li>To sync remote functions: Shut engine off, open driver''s door, start engine again for a few seconds, shut off, remove key, close door. Test remote buttons.</li>
   </ol>
  </div>
  <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
   <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
   <p class="text-red-200/80 text-sm">You must have one working key. This procedure uses a physical slot on the programming tool itself to write data to the new key.</p>
  </div>
 </div>
</div>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, content) 
VALUES ('toyota-matrix-2009-2013', 'Toyota', 'Matrix', 2009, 2013, '<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Toyota Matrix 2009-2013 Programming Guide</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        h1,
        h2,
        h3 {
            color: #0056b3;
        }

        .warning {
            background: #fff3cd;
            border-left: 5px solid #ffca28;
            padding: 15px;
            margin: 20px 0;
        }

        .tip {
            background: #d1ecf1;
            border-left: 5px solid #0dcaf0;
            padding: 15px;
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th,
        td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }

        th {
            background: #f8f9fa;
        }

        code {
            background: #f1f1f1;
            padding: 2px 4px;
            border-radius: 4px;
        }
    </style>
</head>

<body>
    <h1>Toyota Matrix 2009-2013 AKL Programming Guide</h1>

    <p>This guide covers All Keys Lost (AKL) procedures for the Toyota Matrix (2009-2013). This vehicle uses a
        traditional <strong>Bladed Key</strong> system with an Immobilizer chip.</p>

    <h2>Key Specifications</h2>
    <table>
        <tr>
            <th>Key Type</th>
            <td>Transponder Key (Master)</td>
        </tr>
        <tr>
            <th>Chip Type (2009-2010*)</th>
            <td><strong>4D-67</strong> (Identified by a "Dot" on the blade)</td>
        </tr>
        <tr>
            <th>Chip Type (2010*-2013)</th>
            <td><strong>G Chip</strong> (Identified by a "G" on the blade)</td>
        </tr>
        <tr>
            <th>Blade Profile</th>
            <td>TOY43 (Flat 8-cut)</td>
        </tr>
        <tr>
            <th>Remote FCC ID</th>
            <td><code>GQ4-29T</code></td>
        </tr>
    </table>

    <div class="warning">
        <strong>Important:</strong> 2010 was a transition year. Always check the original key blade or attempt to
        auto-detect the chip type with your tool.
    </div>

    <h2>Equipment Needed</h2>
    <ul>
        <li><strong>Autel IM608 / IM508</strong> or <strong>Xhorse VVDI</strong></li>
        <li>Correct Transponder Key (4D-67 or G, matching the vehicle)</li>
        <li>Key Cutting Machine</li>
    </ul>

    <h2>AKL Procedure (Transponder)</h2>
    <ol>
        <li><strong>Cut Experimental Key:</strong> Cut the new key to the vehicle''s mechanical code using a Lishi TOY43
            2-in-1 or by VIN.</li>
        <li><strong>Connect Tool:</strong> Plug the scanner into the OBD-II port.</li>
        <li><strong>Select Vehicle:</strong> Toyota -> Matrix -> 2009-2013.</li>
        <li><strong>Immobilizer Reset:</strong> Select "All Keys Lost" or "Control Unit Reset".</li>
        <li><strong>Security Wait:</strong> The tool will begin a 16-minute security reset. Keep the ignition in the
            <strong>ON</strong> position (the dash may not light up, but the key must be turned).</li>
        <li><strong>Register Master Key:</strong> Once the 16 minutes are up, the security light will stop flashing or
            turn solid. Remove the key and re-insert the new Master Key. The security light should go out within 5
            seconds.</li>
    </ol>

    <h2>Manual Remote Programming (Lock/Unlock)</h2>
    <p>If the remote functions do not program automatically via OBD, use this manual procedure:</p>
    <ol>
        <li>Start with driver''s door OPEN and UNLOCKED. Key is NOT in ignition.</li>
        <li>Insert and remove key from ignition twice within 5 seconds.</li>
        <li>Close and open driver''s door twice.</li>
        <li>Insert and remove key once.</li>
        <li>Close and open driver''s door twice.</li>
        <li>Insert key and close door.</li>
        <li>Turn ignition ON then OFF. Remove key.</li>
        <li>Door locks should cycle to confirm entrance into programming mode.</li>
        <li>Press LOCK and UNLOCK on the remote simultaneously for 1.5s, then press LOCK for 1s.</li>
    </ol>

    <div class="tip">
        <strong>Pro Tip:</strong> Many 2009-2013 Matrix models are essentially the same as the Corolla. If "Matrix" is
        not listed in your tool, try the <strong>Corolla</strong> menu.
    </div>

</body>

</html>')
ON CONFLICT(id) DO UPDATE SET 
content = excluded.content,
make = excluded.make,
model = excluded.model,
year_start = excluded.year_start,
year_end = excluded.year_end;