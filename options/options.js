
function setLiveUpdate(enable) {
    let elevenSettingsForm = document.getElementById('elevenSettingsForm')
    if (enable) {
        elevenSettingsForm.addEventListener('input', saveSettings)
    } else {
        elevenSettingsForm.removeEventListener('input', saveSettings)
    }
}

/**
 * @description Limit a number to a range
 * @param {number} number The value to limit
 * @param {number} min The minimum value
 * @param {number} max The maximum value
 * @returns The number, limited to the range
 */
function minMax(number, min, max) {
    if (typeof number !== "number") {
        number = 0
    }
    if (typeof min !== "number") {
        min = 0
    }
    if (typeof max !== "number") {
        max = 1
    }
    return Math.min(Math.max(number, min), max)
}

function saveSettings() {
    // console.log('saving settings')
    let settings = {
        // Update the settings live
        live: document.querySelector('#live').checked,
        // Use the compressor
        enabled: document.querySelector('#enabled').checked,
        // attack: The amount of time (in seconds) to reduce the gain by 10dB
        // Its default value is 0.003
        // This parameter is k-rate
        // Its nominal range is [0, 1]
        attack: minMax(document.querySelector('#attack').valueAsNumber, 0, 1),
        // knee: A decibel value representing the range above the threshold where the curve smoothly transitions to the "ratio" portion
        // Its default value is 30
        // This parameter is k-rate
        // Its nominal range is [0, 40]
        knee: minMax(document.querySelector('#knee').valueAsNumber, 0, 40),
        // ratio: The amount of dB change in input for a 1 dB change in output
        // Its default value is 12
        // This parameter is k-rate
        // Its nominal range is [1, 20]
        ratio: minMax(document.querySelector('#ratio').valueAsNumber, 1, 20),
        // release: The amount of time (in seconds) to increase the gain by 10dB
        // Its default value is 0.25
        // This parameter is k-rate
        // Its nominal range is [0, 1]
        release: minMax(document.querySelector('#release').valueAsNumber, 0, 1),
        // threshold: The decibel value above which the compression will start taking effect
        // Its default value is -24
        // This parameter is k-rate
        // Its nominal range is [-100, 0]
        threshold: minMax(document.querySelector('#threshold').valueAsNumber, -100, 0),
        // gain: Additional gain to offset the compressor
        gain: minMax(document.querySelector('#gain').valueAsNumber, -1, 10)
    }

    browser.storage.local.set(settings)
    setLiveUpdate(settings.live)
}

function preventFormSubmit(e) {
    e.preventDefault()
}

function restoreOptions() {
    let gettingItem = browser.storage.local.get()
    gettingItem.then((res) => {
        document.querySelector('#live').checked = res.live || true
        document.querySelector('#enabled').checked = res.enabled || true
        document.querySelector('#attack').value = res.attack || 0.25
        document.querySelector('#knee').value = res.knee || 20
        document.querySelector('#ratio').value = res.ratio || 10
        document.querySelector('#release').value = res.release || 0.25
        document.querySelector('#threshold').value = res.threshold || -50
        document.querySelector('#gain').value = res.gain || 1
        setLiveUpdate(res.live || true)
    })
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.querySelector('form').addEventListener('submit', saveSettings)
