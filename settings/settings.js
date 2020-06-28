
/**
 * @description Limit a number to a range
 * @param {number} number The value to limit
 * @param {number} min The minimum value
 * @param {number} max The maximum value
 * @returns {number} The number, limited to the range
 */
function minMax(number = 0, min = 0, max = 1) {
    return Math.min(Math.max(number, min), max)
}

function getValuesFromForm() {
    let values = {
        // Use the compressor
        enabled: document.querySelector('#enabled').checked,
        // threshold: The decibel value above which the compression will start taking effect
        // Its default value is -24
        // This parameter is k-rate
        // Its nominal range is [-100, 0]
        threshold: minMax(document.querySelector('#threshold').valueAsNumber, -100, 0),
        // knee: A decibel value representing the range above the threshold where the curve smoothly transitions to the "ratio" portion
        // Its default value is 30
        // This parameter is k-rate
        // Its nominal range is [0, 40]
        knee: minMax(document.querySelector('#knee').valueAsNumber, 0, 40),
        // attack: The amount of time (in seconds) to reduce the gain by 10dB
        // Its default value is 0.003
        // This parameter is k-rate
        // Its nominal range is [0, 1]
        attack: minMax(document.querySelector('#attack').valueAsNumber, 0, 1),
        // release: The amount of time (in seconds) to increase the gain by 10dB
        // Its default value is 0.25
        // This parameter is k-rate
        // Its nominal range is [0, 1]
        release: minMax(document.querySelector('#release').valueAsNumber, 0, 1),
        // ratio: The amount of dB change in input for a 1 dB change in output
        // Its default value is 12
        // This parameter is k-rate
        // Its nominal range is [1, 20]
        ratio: minMax(document.querySelector('#ratio').valueAsNumber, 1, 20),
        // gain: Additional gain to offset the compressor
        gain: minMax(document.querySelector('#gain').valueAsNumber, -1, 10)
    }
    return values
}

function saveSettings() {
    let settings = getValuesFromForm()

    browser.storage.local.set({ defaults: settings })
}

function updateValueDisplay() {
    let values = getValuesFromForm()
    document.getElementById('thresholdValue').innerText = `${values.threshold.toFixed(1)}dB`
    document.getElementById('kneeValue').innerText = `${values.knee.toFixed(1)}dB`
    document.getElementById('attackValue').innerText = `${values.attack.toFixed(3)}s`
    document.getElementById('releaseValue').innerText = `${values.release.toFixed(3)}s`
    document.getElementById('ratioValue').innerText = `1:${values.ratio.toFixed(1)}`
    document.getElementById('gainValue').innerText = `${values.gain.toFixed(1)}`
}

function restoreOptions() {
    let gettingItem = browser.storage.local.get('defaults')
    gettingItem.then((res) => {
        document.querySelector('#enabled').checked = res.enabled
        document.querySelector('#threshold').value = res.threshold || -60
        document.querySelector('#knee').value = res.knee || 30.0
        document.querySelector('#attack').value = res.attack || 0.150
        document.querySelector('#release').value = res.release || 0.25
        document.querySelector('#ratio').value = res.ratio || 10.0
        document.querySelector('#gain').value = res.gain || 1.0
    })
}
function setDefaults() {
    document.querySelector('#enabled').checked = true
    document.querySelector('#threshold').value = -60
    document.querySelector('#knee').value = 30.0
    document.querySelector('#attack').value = 0.150
    document.querySelector('#release').value = 0.250
    document.querySelector('#ratio').value = 10.0
    document.querySelector('#gain').value = 1.0
}

document.addEventListener('DOMContentLoaded', restoreOptions)

let elevenSettingsForm = document.getElementById('elevenSettingsForm')
elevenSettingsForm.addEventListener('input', updateValueDisplay)

let resetBtn = document.getElementById('resetDefaults')
resetBtn.addEventListener('click', setDefaults)

let saveDefaultsBtn = document.getElementById('save')
saveDefaultsBtn.addEventListener('click', saveSettings)
