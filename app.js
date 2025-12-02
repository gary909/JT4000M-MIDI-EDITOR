// Variable to store the selected MIDI output port
let midiOutput = null; 

// MIDI CC numbers for parameters
const CC_VCA_ATTACK = 81;

// initially check for midi access
if (navigator.requestMIDIAccess){
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

// if no midi access failure:
function onMIDIFailure(){
    console.log("Could not access your MIDI devices.");
    // Display error message on the page
    document.body.innerHTML += '<p style="color: red;">ERROR: Could not access your MIDI devices. Check permissions and connections.</p>';
}

// if midi success:
function onMIDISuccess(midiAccess){
    // console.log(midiAccess);
    midiAccess.addEventListener('statechange', updateDevices);

    const outputs = midiAccess.outputs; // Use outputs to send data
    console.log(outputs);

    // --- MIDI OUTPUT SELECTION ---
    // You'll need to find your JT-4000M's port. This selects the first available port.
    // **NOTE:** For production, you should let the user select the port by name!
    if (outputs.size > 0) {
        // Get the first output device.
        midiOutput = outputs.values().next().value;
        console.log(`Selected MIDI output: ${midiOutput.name}`);

        // --- ATTACH SLIDER LISTENER ---
        const slider = document.getElementById('vca-attack');
        if (slider) {
            // Use 'input' event for continuous updates as the user drags
            slider.addEventListener('input', (event) => {
                const ccValue = parseInt(event.target.value);
                sendMidiCC(CC_VCA_ATTACK, ccValue);
            });
        }
    } else {
        console.log("No MIDI output devices found.");
    }
    
    // Original input logging (can be removed later)
    const inputs = midiAccess.inputs;
    inputs.forEach((input) => {
        // console.log(input);
    });
}

// Function to send a MIDI CC message
function sendMidiCC(ccNumber, value) {
    if (midiOutput) {
        // MIDI CC message format:
        // [176 + channel, CC number, value]
        // 176 (0xB0 in hex) is the status byte for Channel 1 Control Change
        const midiMessage = [0xB0, ccNumber, value]; 
        midiOutput.send(midiMessage);
        console.log(`Sent CC ${ccNumber} with value ${value}`);
    } else {
        console.log("MIDI output device not selected. Cannot send message.");
    }
}


function updateDevices(event){
    // console.log(event);
    console.log(`Name: ${event.port.name}, Brand: ${event.port.manufacturer}, State: ${event.port.state}, Type: ${event.port.type}`);
}