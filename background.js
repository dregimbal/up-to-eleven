let port

function onResult(settings) {
    // console.log("sending", settings)
    port.postMessage(settings)
}

function onError(error) {
    console.warn(`Error: ${error}`)
}

function storageChange(changes) {
    let changedItems = Object.keys(changes)
    let changed = false
    for (let item of changedItems) {
        if (changes[item].oldValue !== changes[item].newValue) {
            // console.log(`${item}: ${changes[item].oldValue} -> ${changes[item].newValue}`)
            changed = true
            break
        }
    }
    if (changed) {
        let getStoredSettings = browser.storage.local.get()
        getStoredSettings.then(onResult, onError)
    }
}


function connected(p) {
    port = p
    let gettingStoredSettings = browser.storage.local.get()
    gettingStoredSettings.then(onResult, onError)
}

browser.runtime.onConnect.addListener(connected)
browser.storage.onChanged.addListener(storageChange)
