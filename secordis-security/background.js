fetch(chrome.runtime.getURL("config.json"))
.then(beg => beg.json())
.then(beg => {
    if (beg.lockdown == true) {
    const targetExtID = beg.target;

    function triggerLockdown() {
        // redir existing tabs which is basically just good enough :shrug:
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                const securityPageUrl = chrome.runtime.getURL('security.html');
                if (!tab.url.startsWith(securityPageUrl)) {
                    chrome.tabs.update(tab.id, {
                        url: securityPageUrl
                    });
                }
            });
        });
    
    
        /*
        // don't use webRequestBlocking, replace with declarativeNetRequestWithHostAccess. the existing code may be good enough since a 1 second countdown is hard to bypass. *IF* it is deemed necessary, implement declarativeNetRequest blocking.
        chrome.webRequest.onBeforeRequest.addListener(
            (details) => {
                if (!details.url.startsWith(chrome.runtime.getURL(''))) {
                    return {
                        cancel: true
                    };
                }
                return {};
            }, {
                urls: ["<all_urls>"]
            },
            ["blocking"]
        );
        */
    }
    
    function checkExtensionStatus() {
    
        chrome.management.getAll(function(extensions) {
            let doesExtensionExist = false;
            extensions.forEach(function(extension) {
                if (extension.id == targetExtID) {
                    doesExtensionExist = true;
                    if (extension.enabled !== true) {
                        handlePossibleBlockerBypass("not enabled");
                    } else {
                        // disable lockdown
                    }
                }
            });
            if (!doesExtensionExist) {
                handlePossibleBlockerBypass("never installed");
            } else {
                // disable lockdown
            }
        });
    
    
        let messageReceived = false;
    
        chrome.runtime.sendMessage(targetExtID, {
            type: 'ping'
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error: ', chrome.runtime.lastError);
                handlePossibleBlockerBypass("no response");
            } else if (response && response.status === 'ok') {
                messageReceived = true;
                // it is up
            }
        });
    
        // trigger lockdown if there is no response
        setTimeout(() => {
            if (!messageReceived) {
                handlePossibleBlockerBypass("no response within 5 seconds");
            }
        }, 5000);
    }
    
    function handlePossibleBlockerBypass(reason) {
        triggerLockdown();
    }
    
    chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
        if (sender.id === targetExtID && message.type === 'reportIssue') { // the extension reported a blocked site to add to the blocked file
            console.log(`report from target ${targetExtID}: ${message.message}`);
            // send blocked url to self hosted api
        }
    
    
    });
    
    setInterval(checkExtensionStatus, 1000);
    console.log("Started");

    function handleExternalMessage(message, sender, sendResponse) {
        if (message.type === 'ping') {
            sendResponse({ status: 'ok' });
        }
        return true;
    }

    chrome.runtime.onMessageExternal.addListener(handleExternalMessage);

    }  
})