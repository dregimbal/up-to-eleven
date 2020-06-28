if (typeof window.wrappedJSObject.ElevenAudioCompressorConnected === 'undefined') {
    window.wrappedJSObject.ElevenAudioCompressorConnected = false
}

function showProps(obj, objName, depth = 0) {
    let result = ``
    for (let i in obj) {
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

function createAudioNodes() {
    return new Promise((resolve, reject) => {
        // console.log('createAudio')
        let videoElement = document.querySelector('video')
        if (typeof videoElement !== 'undefined' && videoElement !== null) {
            if (!window.wrappedJSObject.ElevenAudioContext) {
                window.wrappedJSObject.ElevenAudioContext = new AudioContext()
            }

            if (!window.wrappedJSObject.ElevenAudioSource || window.wrappedJSObject.ElevenAudioSource.mediaElement.src !== videoElement.src) {
                window.wrappedJSObject.ElevenAudioSource = window.wrappedJSObject.ElevenAudioContext.createMediaElementSource(videoElement)
            }

            if (!window.wrappedJSObject.ElevenAudioCompressorNode) {
                window.wrappedJSObject.ElevenAudioCompressorNode = new DynamicsCompressorNode(window.wrappedJSObject.ElevenAudioContext)
            }

            if (!window.wrappedJSObject.ElevenAudioGainNode) {
                window.wrappedJSObject.ElevenAudioGainNode = window.wrappedJSObject.ElevenAudioContext.createGain()
            }
            resolve()
        } else {
            console.log('no video')
            setTimeout(function () {
                createAudioNodes()
            }, 1000)
        }
    })
}

function connectCompressorNodes() {
    return new Promise((resolve, reject) => {
        // console.log('connectCompressor')
        if (!window.wrappedJSObject.ElevenAudioCompressorConnected) {
            try {
                window.wrappedJSObject.ElevenAudioSource.disconnect()
            } catch (error) {
                // console.log(error)
            }
            window.wrappedJSObject.ElevenAudioSource.connect(window.wrappedJSObject.ElevenAudioCompressorNode)
            window.wrappedJSObject.ElevenAudioCompressorNode.connect(window.wrappedJSObject.ElevenAudioGainNode)
            window.wrappedJSObject.ElevenAudioGainNode.connect(window.wrappedJSObject.ElevenAudioContext.destination)
            window.wrappedJSObject.ElevenAudioCompressorConnected = true
        }
        resolve()
    })
}

function disableCompressor() {
    if (window.wrappedJSObject.ElevenAudioSource) {
        if (window.wrappedJSObject.ElevenAudioCompressorConnected) {
            try {
                window.wrappedJSObject.ElevenAudioSource.disconnect()
            } catch (error) {
                // console.log(error)
            }
            window.wrappedJSObject.ElevenAudioCompressorNode.disconnect(window.wrappedJSObject.ElevenAudioGainNode)
            window.wrappedJSObject.ElevenAudioGainNode.disconnect(window.wrappedJSObject.ElevenAudioContext.destination)
            window.wrappedJSObject.ElevenAudioSource.connect(window.wrappedJSObject.ElevenAudioContext.destination)
            window.wrappedJSObject.ElevenAudioCompressorConnected = false
        }
    } else {
        console.log('No audio source')
    }
}

function updateCompressor(settings) {
    // console.log('updating compressor', settings)
    window.wrappedJSObject.ElevenAudioCompressorNode.attack.setValueAtTime(settings.attack, window.wrappedJSObject.ElevenAudioContext.currentTime)
    window.wrappedJSObject.ElevenAudioCompressorNode.knee.setValueAtTime(settings.knee, window.wrappedJSObject.ElevenAudioContext.currentTime)
    window.wrappedJSObject.ElevenAudioCompressorNode.ratio.setValueAtTime(settings.ratio, window.wrappedJSObject.ElevenAudioContext.currentTime)
    window.wrappedJSObject.ElevenAudioCompressorNode.release.setValueAtTime(settings.release, window.wrappedJSObject.ElevenAudioContext.currentTime)
    window.wrappedJSObject.ElevenAudioCompressorNode.threshold.setValueAtTime(settings.threshold, window.wrappedJSObject.ElevenAudioContext.currentTime)
    window.wrappedJSObject.ElevenAudioGainNode.gain.setValueAtTime(settings.gain, window.wrappedJSObject.ElevenAudioContext.currentTime)
}

function reinitializeCompressor() {
    // console.log('re-init')
    disableCompressor()
    createAudioNodes()
        .then(connectCompressorNodes)
}


let myPort = browser.runtime.connect({ name: 'content-script-port' })
myPort.onMessage.addListener((message, sender, sendResponse) => {
    // showProps(message, "message")
    // showProps(sender, "sender")
    // showProps(sendResponse, "sendResponse")
    if (message.command === 'reset') {
        // console.log('Resetting')
        reinitializeCompressor()
    } else if (message.command === 'settings') {
        if (message.settings.enabled) {
            createAudioNodes()
                .then(connectCompressorNodes)
                .then(res => {
                    updateCompressor(message.settings)
                })
        } else {
            // console.log('Disabling')
            disableCompressor()
        }
    } else {
        console.log('Unknown')
        showProps(message, 'message')
    }
})
