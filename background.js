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


let optionPort
let contentPorts = []

function pushSettings(tabId, settings) {
    // console.log(`Sending settings to ${tabId}, settings:`, settings)
    // showProps(settings, 'settings')
    for (let port of contentPorts) {
        // console.log(port.sender.tab.id)
        // showProps(port.sender, "port.sender")
        if (port.sender.tab.id === tabId) {
            // console.log(`Tab id ${tabId} is correct`)
            port.postMessage({ command: 'settings', settings: settings })
        }
    }
}

function pushReset(tabId) {
    for (let port of contentPorts) {
        if (port.sender.tab.id === tabId) {
            // console.log(`Tab id ${tabId} is correct`)
            port.postMessage({ command: 'reset' })
        }
    }
}

function onError(error) {
    console.warn(`Error: ${error}`)
}

function optionsMessage(message, sender, sendResponse) {
    // showProps(message, "message")
    // showProps(sender, "sender")
    // showProps(sendResponse, "sendResponse")
    if (message.command === 'reset') {
        pushReset(message.tab)
    } else if (message.command === 'settings') {
        pushSettings(message.tab, message.settings)
    }
}

function disconnected(p) {
    let tabId = p.sender.tab.id
    console.log('Tab disconnected: ', tabId)
    contentPorts = contentPorts.filter(port => port.sender.tab.id !== tabId)
    browser.storage.local.remove(`${tabId}`)
}

function connected(p) {
    if (p.name === 'options-port') {
        optionPort = p
        optionPort.onMessage.addListener(optionsMessage)
    } else {
        p.onDisconnect.addListener(disconnected)
        contentPorts.push(p)
        browser.storage.local.get('defaults')
            .then((settings) => pushSettings(p.sender.tab.id, settings.defaults), onError)
    }
}

browser.runtime.onConnect.addListener(connected)

function handleInstalled(details) {
    showProps(details, 'OnInstalled')
    browser.storage.local.get('defaults')
        .then(store => {
            let defaults = store.defaults
            if (typeof defaults === 'undefined' || (Object.keys(defaults).length === 0 && defaults.constructor === Object)) {
                let settings = {}
                settings.enabled = true
                settings.threshold = -60
                settings.knee = 30.0
                settings.attack = 0.150
                settings.release = 0.25
                settings.ratio = 10.0
                settings.gain = 1.0

                console.log('Setting new defaults', settings)
                let save = browser.storage.local.set({ defaults: settings })
                save.then((res) => {
                    console.log('Defaults set')
                })
            } else {
                console.log('Defaults already set:', defaults)
            }
        })
}

browser.runtime.onInstalled.addListener(handleInstalled)
