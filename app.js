// Variable to store the selected MIDI output port
let midiOutput = null;

// MIDI CC numbers for parameters
const CC_VCA_ATTACK = 81;
const CC_VCA_DECAY = 82;
const CC_VCA_SUSTAIN = 83;
const CC_VCA_RELEASE = 84;

const CC_VCF_ATTACK = 85;
const CC_VCF_DECAY = 86;
const CC_VCF_SUSTAIN = 87;
const CC_VCF_RELEASE = 88;

const CC_VCF_CUTOFF = 74;
const CC_VCF_RESONANCE = 71;

const CC_VCF_ENV_AMOUNT = 47;

// --- INITIALIZATION ---
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

// --- FAILURE HANDLER ---
function onMIDIFailure() {
    console.log("Could not access your MIDI devices.");
    document.body.innerHTML += '<p style="color: red;">ERROR: Could not access your MIDI devices. Check permissions and connections.</p>';
}

// --- SUCCESS HANDLER (MAIN LOGIC) ---
function onMIDISuccess(midiAccess) {
    // 1. Initialize the MIDI Output list on load
    populateOutputDevices(midiAccess);
    
    // 2. Add listeners for device hot-plugging
    midiAccess.addEventListener('statechange', () => populateOutputDevices(midiAccess));

    // 3. Add event listener to the dropdown for user selection
    document.getElementById('midi-output-select').addEventListener('change', (event) => {
        connectToSelectedOutput(event.target.value, midiAccess);
    });

    // 4. Attach slider listener (VCA Attack)
    const attackSlider = document.getElementById('vca-attack');
    if (attackSlider) {
        // Use 'input' event for continuous updates as the user drags
        attackSlider.addEventListener('input', (event) => {
            const ccValue = parseInt(event.target.value);
            // Send the CC message
            sendMidiCC(CC_VCA_ATTACK, ccValue);
            
            // Optional: Update a text display of the value if you add one
            // console.log(`Slider value: ${ccValue}`); 
        });
    }

    // VCA Decay (CC 82) Listener - NEW
    const decaySlider = document.getElementById('vca-decay');
    if (decaySlider) {
        decaySlider.addEventListener('input', (event) => {
            const ccValue = parseInt(event.target.value);
            sendMidiCC(CC_VCA_DECAY, ccValue);
        });
    }

    // VCA Sustain (CC 83) Listener - NEW
    const sustainSlider = document.getElementById('vca-sustain');
    if (sustainSlider) {
        sustainSlider.addEventListener('input', (event) => {
            const ccValue = parseInt(event.target.value);
            sendMidiCC(CC_VCA_SUSTAIN, ccValue);
        });
    }
    
    // VCA Release (CC 84) Listener - NEW
    const releaseSlider = document.getElementById('vca-release');
    if (releaseSlider) {
        releaseSlider.addEventListener('input', (event) => {
            const ccValue = parseInt(event.target.value);
            sendMidiCC(CC_VCA_RELEASE, ccValue);
        });
    }

    // VCF Cutoff (CC 74) Listener - NEW
    const cutoffSlider = document.getElementById('vcf-cutoff');
    if (cutoffSlider) {
        cutoffSlider.addEventListener('input', (event) => {
            const ccValue = parseInt(event.target.value);
            sendMidiCC(CC_VCF_CUTOFF, ccValue);
        });
    }

    // VCF Resonance (CC 71) Listener - NEW
    const resonanceSlider = document.getElementById('vcf-resonance');
    if (resonanceSlider) {
        resonanceSlider.addEventListener('input', (event) => {
            const ccValue = parseInt(event.target.value);
            sendMidiCC(CC_VCF_RESONANCE, ccValue);
        });
    }

    // Filter Env Amount (CC 47) Listener - NEW
    const envAmountSlider = document.getElementById('vcf-env-amount');
    if (envAmountSlider) {
        envAmountSlider.addEventListener('input', (event) => {
            const ccValue = parseInt(event.target.value);
            sendMidiCC(CC_VCF_ENV_AMOUNT, ccValue);
        });
    }

    // --- VCF ENVELOPE LISTENERS (CC 85-88) ---

    // VCF Attack (CC 85) Listener - NEW
    const vcfAttackSlider = document.getElementById('vcf-attack');
    if (vcfAttackSlider) {
        vcfAttackSlider.addEventListener('input', (event) => {
            const ccValue = parseInt(event.target.value);
            sendMidiCC(CC_VCF_ATTACK, ccValue);
        });
    }

    // VCF Decay (CC 86) Listener - NEW
    const vcfDecaySlider = document.getElementById('vcf-decay');
    if (vcfDecaySlider) {
        vcfDecaySlider.addEventListener('input', (event) => {
            const ccValue = parseInt(event.target.value);
            sendMidiCC(CC_VCF_DECAY, ccValue);
        });
    }

    // VCF Sustain (CC 87) Listener - NEW
    const vcfSustainSlider = document.getElementById('vcf-sustain');
    if (vcfSustainSlider) {
        vcfSustainSlider.addEventListener('input', (event) => {
            const ccValue = parseInt(event.target.value);
            sendMidiCC(CC_VCF_SUSTAIN, ccValue);
        });
    }
    
    // VCF Release (CC 88) Listener - NEW
    const vcfReleaseSlider = document.getElementById('vcf-release');
    if (vcfReleaseSlider) {
        vcfReleaseSlider.addEventListener('input', (event) => {
            const ccValue = parseInt(event.target.value);
            sendMidiCC(CC_VCF_RELEASE, ccValue);
        });
    }
}

// --- HELPER FUNCTION: POPULATE DROPDOWN ---
function populateOutputDevices(midiAccess) {
    const select = document.getElementById('midi-output-select');
    // Save the current selection (if any) to re-select it after refreshing
    const currentId = select.value; 
    select.innerHTML = ''; // Clear previous options

    if (midiAccess.outputs.size === 0) {
        select.innerHTML = '<option value="">-- No Devices Found --</option>';
        midiOutput = null;
        return;
    }

    let foundSelection = false;
    midiAccess.outputs.forEach((output) => {
        const option = document.createElement('option');
        option.value = output.id;
        option.textContent = output.name;
        select.appendChild(option);

        // Check if this port matches the previous selection OR if it's the JT-4000M
        if (output.id === currentId || output.name.includes("JT-4000M")) {
            option.selected = true;
            foundSelection = true;
        }
    });

    // Connect to the selected/first port automatically on load/refresh
    connectToSelectedOutput(select.value, midiAccess);
}

// --- HELPER FUNCTION: HANDLE CONNECTION ---
function connectToSelectedOutput(portId, midiAccess) {
    if (portId) {
        midiOutput = midiAccess.outputs.get(portId);
        console.log(`Now connected to: ${midiOutput.name}`);
        // Consider enabling UI elements here if you want them disabled when disconnected
    } else {
        midiOutput = null;
        console.log("No valid MIDI output selected.");
        // Consider disabling UI elements here
    }
}

// --- HELPER FUNCTION: SEND MIDI CC ---
function sendMidiCC(ccNumber, value) {
    if (midiOutput) {
        // MIDI CC format for Channel 1 Control Change: [0xB0, CC number, value]
        const midiMessage = [0xB0, ccNumber, value];
        midiOutput.send(midiMessage);
        console.log(`Sent CC ${ccNumber} with value ${value}`);
    } else {
        console.log("MIDI output device not selected. Cannot send message.");
    }
}

// --- REMOVED/DEPRECATED: Old updateDevices function is replaced by logic in onMIDISuccess/populateOutputDevices.
// function updateDevices(event) { ... }