let compressorSetup = false
function setupCompressor() {
    if (!window.ElevenAudioContext) {
        window.ElevenAudioContext = new AudioContext()
    }
    if (!window.ElevenAudioCompressorNode) {
        window.ElevenAudioCompressorNode = new DynamicsCompressorNode(window.ElevenAudioContext)
    }
    if (!window.ElevenAudioGainNode) {
        window.ElevenAudioGainNode = window.ElevenAudioContext.createGain()
    }

    if (!window.ElevenAudioSource) {
        let element = document.querySelector('video')
        window.ElevenAudioSource = window.ElevenAudioContext.createMediaElementSource(element)
    }

    window.ElevenAudioSource.connect(window.ElevenAudioCompressorNode)
    window.ElevenAudioCompressorNode.connect(window.ElevenAudioGainNode)
    window.ElevenAudioGainNode.connect(window.ElevenAudioContext.destination)

    compressorSetup = true
}
function disableCompressor() {
    window.ElevenAudioSource.disconnect(window.ElevenAudioCompressorNode)
    window.ElevenAudioCompressorNode.disconnect(window.ElevenAudioGainNode)
    window.ElevenAudioGainNode.disconnect(window.ElevenAudioContext.destination)
    window.ElevenAudioSource.connect(window.ElevenAudioContext.destination)
    compressorSetup = false
}

function updateCompressor(settings) {
    window.ElevenAudioCompressorNode.attack.setValueAtTime(settings.attack, window.ElevenAudioContext.currentTime)
    window.ElevenAudioCompressorNode.knee.setValueAtTime(settings.knee, window.ElevenAudioContext.currentTime)
    window.ElevenAudioCompressorNode.ratio.setValueAtTime(settings.ratio, window.ElevenAudioContext.currentTime)
    window.ElevenAudioCompressorNode.release.setValueAtTime(settings.release, window.ElevenAudioContext.currentTime)
    window.ElevenAudioCompressorNode.threshold.setValueAtTime(settings.threshold, window.ElevenAudioContext.currentTime)
    window.ElevenAudioGainNode.gain.setValueAtTime(settings.gain, window.ElevenAudioContext.currentTime)
}

function reinitializeCompressor() {
    disableCompressor()
    let element = document.querySelector('video')
    window.ElevenAudioSource = window.ElevenAudioContext.createMediaElementSource(element)
    setupCompressor()
}

function showProps(obj, objName, depth = 0) {
    var result = ``
    for (var i in obj) {
        // obj.hasOwnProperty() is used to filter out properties from the object's prototype chain
        if (obj.hasOwnProperty(i)) {
            if (typeof obj[i] === 'object' && depth < 3) {
                showProps(obj[i], `${objName}.${i}`, depth + 1)
            } else {
                result += `${objName}.${i} = ${obj[i]}\n`
            }
        }
    }
    console.log(result)
}

let myPort = browser.runtime.connect({ name: "content-script-port" })
myPort.onMessage.addListener((message, sender, sendResponse) => {
    // showProps(message, "message")
    // showProps(sender, "sender")
    // showProps(sendResponse, "sendResponse")
    if (message.command === "reset") {
        console.log("Resetting")
        reinitializeCompressor()
    } else {
        if (message.settings.enabled) {
            if (!compressorSetup) {
                setupCompressor()
            }
            updateCompressor(message.settings)
        } else if (compressorSetup) {
            disableCompressor()
        }
    }
})
