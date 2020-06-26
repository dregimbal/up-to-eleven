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

function saveDefaultSettings(settings) {
    console.log('Saving default settings')
    let save = browser.storage.local.set({ defaults: settings })
    save.then(() => { console.log("okay") })
}

function saveTabSettings(tabId, settings) {
    settings.tabId = tabId
    browser.storage.local.set({ [tabId]: settings })
}

function postSettings() {
    let settings = getValuesFromForm()
    updateValueDisplay(settings)
    browser.tabs.query({ currentWindow: true, active: true })
        .then((tabs) => {
            let tabId = tabs[0].id
            saveTabSettings(tabId, settings)
            port.postMessage({ command: "settings", tab: tabId, settings: settings })
        })
}

function updateValueDisplay(values) {
    document.getElementById('thresholdValue').innerText = `${values.threshold.toFixed(1)}dB`
    document.getElementById('kneeValue').innerText = `${values.knee.toFixed(1)}dB`
    document.getElementById('attackValue').innerText = `${values.attack.toFixed(3)}s`
    document.getElementById('releaseValue').innerText = `${values.release.toFixed(3)}s`
    document.getElementById('ratioValue').innerText = `1:${values.ratio.toFixed(1)}`
    document.getElementById('gainValue').innerText = `${values.gain.toFixed(1)}`
}

function getTabId() {
    return browser.tabs.query({ currentWindow: true, active: true })
        .then(tabs => {
            return new Promise((resolve, reject) => {
                resolve(tabs[0].id)
            })
        })
}

function loadTabSettings(tabId) {
    return browser.storage.local.get(`${tabId}`)
        .then(settings => {
            return new Promise((resolve, reject) => {
                if (typeof settings[tabId] === 'undefined' || settings[tabId].tabId !== tabId) {
                    reject(`No data for tab ${tabId} found`)
                } else {
                    resolve(settings[tabId])
                }
            })
        })
}

function setInputValues(settings) {
    // console.log(settings)
    document.querySelector('#enabled').checked = settings.enabled || true
    document.querySelector('#threshold').value = settings.threshold || -60
    document.querySelector('#knee').value = settings.knee || 30.0
    document.querySelector('#attack').value = settings.attack || 0.150
    document.querySelector('#release').value = settings.release || 0.25
    document.querySelector('#ratio').value = settings.ratio || 10.0
    document.querySelector('#gain').value = settings.gain || 1.0
    updateValueDisplay(settings)
}

function domLoaded() {
    browser.storage.local.get('defaults')
        .then(defaults => setInputValues(defaults.defaults))
        .catch(err => console.log(err))
        .then(getTabId)
        .then(tabId => loadTabSettings(tabId))
        .then(settings => setInputValues(settings))
        .catch(err => console.log(err))

}

function resetToDefaults() {
    browser.storage.local.get('defaults')
        .then(defaults => {
            setInputValues(defaults.defaults)
            getTabId()
                .then(tabId => saveTabSettings(tabId, defaults.defaults))
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
}

function saveAsDefaults() {
    let settings = getValuesFromForm()
    saveDefaultSettings(settings)
}

function reInit() {
    browser.tabs.query({ currentWindow: true, active: true })
        .then((tabs) => {
            port.postMessage({ command: "reset", tab: tabs[0].id })
        })
}

let port = browser.runtime.connect({ name: "options-port" })

document.addEventListener('DOMContentLoaded', domLoaded)

let elevenSettingsForm = document.getElementById('elevenSettingsForm')
elevenSettingsForm.addEventListener('input', postSettings)

let resetBtn = document.getElementById('resetToDefault')
resetBtn.addEventListener('click', resetToDefaults)

let saveBtn = document.getElementById('saveAsDefaults')
saveBtn.addEventListener('click', saveAsDefaults)

let reInitBtn = document.getElementById('reInit')
reInitBtn.addEventListener('click', reInit)
