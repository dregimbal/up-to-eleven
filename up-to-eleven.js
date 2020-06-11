let enabled = false

function doit() {
    browser.tabs.executeScript({
        file: 'prepare-eq.js'
    })
    if (enabled) {
        browser.tabs.executeScript({
            file: 'disable-eq.js'
        })
        browser.browserAction.setIcon({
            path: {
                48: 'icons/uptoeleven-disabled.png',
                96: 'icons/uptoeleven-disabled.png'
            }
        })
    } else {
        browser.tabs.executeScript({
            file: 'enable-eq.js'
        })
        browser.browserAction.setIcon({
            path: {
                48: 'icons/uptoeleven-enabled.png',
                96: 'icons/uptoeleven-enabled.png'
            }
        })
    }
    enabled = !enabled
}

browser.browserAction.onClicked.addListener(doit)
