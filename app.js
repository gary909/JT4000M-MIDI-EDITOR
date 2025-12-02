// check for midi access
if (navigator.requestMIDIAccess){
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

// if midi access:
function onMIDISuccess(midiAccess){
    console.log("MIDI ready!");
    var inputs = midiAccess.inputs; 
}

// if no midi access:
function onMIDIFailure(){
    console.log("Could not access your MIDI devices.");
}



