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


let myPort = browser.runtime.connect({ name: "content-script-port" })

myPort.onMessage.addListener(settings => {
    if (settings.enabled) {
        if (!compressorSetup) {
            setupCompressor()
        }
        updateCompressor(settings)
    } else if (compressorSetup) {
        disableCompressor()
    }
})
