// check for midi access
if (navigator.requestMIDIAccess){
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

// if no midi access:
function onMIDIFailure(){
    console.log("Could not access your MIDI devices.");
}

// if midi access:
function onMIDISuccess(midiAccess){
    console.log(midiAccess);
    midiAccess.addEventListener('statechange', updateDevices);
}

function updateDevices(event){
    console.log(event);
    console.log(`Name: ${event.port.name}, Brand: ${event.port.manufacturer}, State: ${event.port.state}, Type: ${event.port.type}`);
}





