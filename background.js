let optionPort
let contentPorts = []

function pushSettings(tabId, settings) {
    // console.log("sending", settings)
    console.log(tabId)
    for (let port of contentPorts) {
        // console.log(port.sender.tab.id)
        // showProps(port.sender, "port.sender")
        if (port.sender.tab.id === tabId) {
            // console.log(`Tab id ${tabId} is correct`)
            port.postMessage({ command: "settings", settings: settings })
        }
    }
}

function pushReset(tabId) {
    for (let port of contentPorts) {
        if (port.sender.tab.id === tabId) {
            // console.log(`Tab id ${tabId} is correct`)
            port.postMessage({ command: "reset" })
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
    if (message.command === "reset") {
        pushReset(message.tab)
    } else if (message.command === "settings") {
        pushSettings(message.tab, message.settings)
    }
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

function connected(p) {
    if (p.name === "options-port") {
        optionPort = p
        optionPort.onMessage.addListener(optionsMessage)
    } else {
        p.onDisconnect.addListener(disconnected)
        contentPorts.push(p)
        browser.storage.local.get('defaults')
            .then((settings) => pushSettings(p.sender.tab.id, settings), onError)
    }
}

function disconnected(p) {
    let tabId = p.sender.tab.id
    console.log(tabId)
    contentPorts = contentPorts.filter(port => port.sender.tab.id !== tabId)
    browser.storage.local.remove(`${tabId}`)
}

browser.runtime.onConnect.addListener(connected)
