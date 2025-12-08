// Variable to store the selected MIDI output port
let midiOutput = null;

// --- MIDI CC numbers for parameters ---

// Global / Modulation
const CC_MODULATION = 1;
const CC_PORTAMENTO_TIME = 5;

// Oscillator (OSC)
const CC_OSC_BALANCE = 29;
const CC_OSC1_WAVE = 24;
const CC_OSC2_WAVE = 25;
const CC_OSC1_COARSE = 115;
const CC_OSC2_COARSE = 116;
const CC_OSC1_FINE = 111;
const CC_OSC2_FINE = 112;
const CC_OSC1_PWM_DETUNE = 113; // PWM/Supersaw Detune/FM Feedback
const CC_OSC2_PWM = 114;

// Filter (VCF)
const CC_VCF_CUTOFF = 74;
const CC_VCF_RESONANCE = 71;
const CC_VCF_ENV_AMOUNT = 47; 
const CC_VCF_ATTACK = 85;
const CC_VCF_DECAY = 86;
const CC_VCF_SUSTAIN = 87;
const CC_VCF_RELEASE = 88;

// Amplifier (VCA)
const CC_VCA_ATTACK = 81;
const CC_VCA_DECAY = 82;
const CC_VCA_SUSTAIN = 83;
const CC_VCA_RELEASE = 84;

// LFO
const CC_LFO1_AMOUNT = 70;
const CC_LFO2_AMOUNT = 28;
const CC_LFO1_RATE = 72;
const CC_LFO2_RATE = 73;
const CC_LFO1_WAVE = 54;
const CC_LFO2_WAVE = 55;
const CC_LFO1_DEST = 56;

// Ring Modulation
const CC_RING_MOD_AMT = 95;
const CC_RING_MOD_ONOFF = 96;

// --- INIT PATCH DEFAULTS ---
// This array defines the default state for a 'Basic' or 'Init' patch
const INIT_PATCH_DEFAULTS = [
    // Global / Modulation
    { id: 'mod-wheel', cc: CC_MODULATION, value: 0 },
    { id: 'portamento-time', cc: CC_PORTAMENTO_TIME, value: 0 },

    // Oscillator
    { id: 'osc-balance', cc: CC_OSC_BALANCE, value: 64 }, // Center
    { id: 'osc1-wave', cc: CC_OSC1_WAVE, value: 0 },
    { id: 'osc2-wave', cc: CC_OSC2_WAVE, value: 0 },
    { id: 'osc1-coarse', cc: CC_OSC1_COARSE, value: 64 }, // Center
    { id: 'osc2-coarse', cc: CC_OSC2_COARSE, value: 64 }, // Center
    { id: 'osc1-fine', cc: CC_OSC1_FINE, value: 64 }, // Center
    { id: 'osc2-fine', cc: CC_OSC2_FINE, value: 64 }, // Center
    { id: 'osc1-pwm-detune', cc: CC_OSC1_PWM_DETUNE, value: 0 },
    { id: 'osc2-pwm', cc: CC_OSC2_PWM, value: 0 },

    // Ring Modulation
    { id: 'ring-mod-amount', cc: CC_RING_MOD_AMT, value: 0 },
    // Checkbox: value 0 (unchecked) sends 0
    { id: 'ring-mod-onoff', cc: CC_RING_MOD_ONOFF, value: 0, isCheckbox: true }, 

    // LFO
    { id: 'lfo1-amount', cc: CC_LFO1_AMOUNT, value: 0 },
    { id: 'lfo2-amount', cc: CC_LFO2_AMOUNT, value: 0 },
    { id: 'lfo1-rate', cc: CC_LFO1_RATE, value: 64 }, // Center
    { id: 'lfo2-rate', cc: CC_LFO2_RATE, value: 64 }, // Center
    { id: 'lfo1-wave', cc: CC_LFO1_WAVE, value: 0 },
    { id: 'lfo2-wave', cc: CC_LFO2_WAVE, value: 0 },
    { id: 'lfo1-dest', cc: CC_LFO1_DEST, value: 0 },

    // Filter Main
    { id: 'vcf-cutoff', cc: CC_VCF_CUTOFF, value: 80 },
    { id: 'vcf-resonance', cc: CC_VCF_RESONANCE, value: 10 },
    { id: 'vcf-env-amount', cc: CC_VCF_ENV_AMOUNT, value: 64 }, // Center

    // VCF Envelope (ADSR)
    { id: 'vcf-attack', cc: CC_VCF_ATTACK, value: 0 },
    { id: 'vcf-decay', cc: CC_VCF_DECAY, value: 64 }, // Mid-range decay
    { id: 'vcf-sustain', cc: CC_VCF_SUSTAIN, value: 0 }, // No sustain
    { id: 'vcf-release', cc: CC_VCF_RELEASE, value: 0 },
    
    // VCA Envelope (ADSR)
    { id: 'vca-attack', cc: CC_VCA_ATTACK, value: 0 },
    { id: 'vca-decay', cc: CC_VCA_DECAY, value: 64 }, // Mid-range decay
    { id: 'vca-sustain', cc: CC_VCA_SUSTAIN, value: 127 }, // Full sustain (gate open)
    { id: 'vca-release', cc: CC_VCA_RELEASE, value: 0 }
];

// --- INIT PATCH FUNCTION ---
function initPatch() {
    console.log("Initializing patch...");
    INIT_PATCH_DEFAULTS.forEach(param => {
        const element = document.getElementById(param.id);
        if (element) {
            let midiValue = param.value;
            
            if (param.isCheckbox) {
                // For Checkboxes (like Ring Mod ON/OFF), 0 is off (false)
                element.checked = (param.value === 127);
            } else {
                // For Sliders
                element.value = param.value;
            }
            
            // Send the MIDI CC message
            sendMidiCC(param.cc, midiValue);
        }
    });
    console.log("Patch initialized and MIDI messages sent.");
}

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

    // 4. Attach INIT PATCH button listener (NEW)
    const initButton = document.getElementById('init-patch-button');
    if (initButton) {
        initButton.addEventListener('click', initPatch);
    }

    // 5. Attach all parameter listeners
    
    // Helper to attach listeners to all continuous sliders
    const attachSliderListener = (ccNumber, elementId) => {
        const slider = document.getElementById(elementId);
        if (slider) {
            slider.addEventListener('input', (event) => {
                const ccValue = parseInt(event.target.value);
                sendMidiCC(ccNumber, ccValue);
            });
        }
    };
    
    // Global / Modulation
    attachSliderListener(CC_MODULATION, 'mod-wheel');
    attachSliderListener(CC_PORTAMENTO_TIME, 'portamento-time');

    // Oscillator
    attachSliderListener(CC_OSC_BALANCE, 'osc-balance');
    attachSliderListener(CC_OSC1_WAVE, 'osc1-wave');
    attachSliderListener(CC_OSC2_WAVE, 'osc2-wave');
    attachSliderListener(CC_OSC1_COARSE, 'osc1-coarse');
    attachSliderListener(CC_OSC2_COARSE, 'osc2-coarse');
    attachSliderListener(CC_OSC1_FINE, 'osc1-fine');
    attachSliderListener(CC_OSC2_FINE, 'osc2-fine');
    attachSliderListener(CC_OSC1_PWM_DETUNE, 'osc1-pwm-detune');
    attachSliderListener(CC_OSC2_PWM, 'osc2-pwm');

    // Filter Main
    attachSliderListener(CC_VCF_CUTOFF, 'vcf-cutoff');
    attachSliderListener(CC_VCF_RESONANCE, 'vcf-resonance');
    attachSliderListener(CC_VCF_ENV_AMOUNT, 'vcf-env-amount');

    // VCF Envelope
    attachSliderListener(CC_VCF_ATTACK, 'vcf-attack');
    attachSliderListener(CC_VCF_DECAY, 'vcf-decay');
    attachSliderListener(CC_VCF_SUSTAIN, 'vcf-sustain');
    attachSliderListener(CC_VCF_RELEASE, 'vcf-release');
    
    // VCA Envelope
    attachSliderListener(CC_VCA_ATTACK, 'vca-attack');
    attachSliderListener(CC_VCA_DECAY, 'vca-decay');
    attachSliderListener(CC_VCA_SUSTAIN, 'vca-sustain');
    attachSliderListener(CC_VCA_RELEASE, 'vca-release');

    // LFO
    attachSliderListener(CC_LFO1_AMOUNT, 'lfo1-amount');
    attachSliderListener(CC_LFO2_AMOUNT, 'lfo2-amount');
    attachSliderListener(CC_LFO1_RATE, 'lfo1-rate');
    attachSliderListener(CC_LFO2_RATE, 'lfo2-rate');
    attachSliderListener(CC_LFO1_WAVE, 'lfo1-wave');
    attachSliderListener(CC_LFO2_WAVE, 'lfo2-wave');
    attachSliderListener(CC_LFO1_DEST, 'lfo1-dest');

    // Ring Modulation Amount
    attachSliderListener(CC_RING_MOD_AMT, 'ring-mod-amount');

    // Ring Modulation ON/OFF (CC 96) - Special Checkbox Listener
    const ringModOnOff = document.getElementById('ring-mod-onoff');
    if (ringModOnOff) {
        ringModOnOff.addEventListener('change', (event) => {
            // Send 127 if checked (on), 0 if unchecked (off)
            const ccValue = event.target.checked ? 127 : 0;
            sendMidiCC(CC_RING_MOD_ONOFF, ccValue);
        });
    }
}

// --- HELPER FUNCTION: POPULATE DROPDOWN ---
function populateOutputDevices(midiAccess) {
    const select = document.getElementById('midi-output-select');
    const currentId = select.value; 
    select.innerHTML = ''; 

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

        if (output.id === currentId || output.name.includes("JT-4000M")) {
            option.selected = true;
            foundSelection = true;
        }
    });

    connectToSelectedOutput(select.value, midiAccess);
}

// --- HELPER FUNCTION: HANDLE CONNECTION ---
function connectToSelectedOutput(portId, midiAccess) {
    if (portId) {
        midiOutput = midiAccess.outputs.get(portId);
        console.log(`Now connected to: ${midiOutput.name}`);
    } else {
        midiOutput = null;
        console.log("No valid MIDI output selected.");
    }
}

// --- HELPER FUNCTION: SEND MIDI CC ---
function sendMidiCC(ccNumber, value) {
    if (midiOutput) {
        const midiMessage = [0xB0, ccNumber, value];
        midiOutput.send(midiMessage);
        console.log(`Sent CC ${ccNumber} with value ${value}`);
    } else {
        console.log("MIDI output device not selected. Cannot send message.");
    }
}