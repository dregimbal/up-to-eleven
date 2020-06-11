(function () {
    // see: https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/DynamicsCompressorNode
    let elevenAudioOptions = {
        // attack: The amount of time (in seconds) to reduce the gain by 10dB. Its default value is 0.003. This parameter is k-rate. Its nominal range is [0, 1].
        attack: 0.003,
        // knee: A decibel value representing the range above the threshold where the curve smoothly transitions to the "ratio" portion. Its default value is 30. This parameter is k-rate. Its nominal range is [0, 40].
        knee: 30,
        // ratio: The amount of dB change in input for a 1 dB change in output. Its default value is 12. This parameter is k-rate. Its nominal range is [1, 20].
        ratio: 12.0,
        // release: The amount of time (in seconds) to increase the gain by 10dB. Its default value is 0.250. This parameter is k-rate. Its nominal range is [0, 1].
        release: 0.250,
        // threshold: The decibel value above which the compression will start taking effect. Its default value is -24. This parameter is k-rate. Its nominal range is [-100, 0].
        threshold: -24
    }

    let compressor = new DynamicsCompressorNode(window.ElevenAudioContext, elevenAudioOptions)

    // Increase the gain to reclaim some volume from the compressor stage
    let gain = new GainNode(window.ElevenAudioContext, { gain: 5.0 })

    if (!window.ElevenAudioSource) {
        let element = document.querySelector('video')
        window.ElevenAudioSource = new MediaElementAudioSourceNode(
            window.ElevenAudioContext,
            {
                mediaElement: element
            })
    } else {
        window.ElevenAudioSource.disconnect()
    }
    window.ElevenAudioSource.connect(gain).connect(compressor).connect(window.ElevenAudioContext.destination)
}())
