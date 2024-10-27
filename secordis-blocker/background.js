console.log("Background script starting");

let config = {};
let blocklist = new Map();
let allowlist = new Map();
let targetExtID = ''; // set by config
let categorizationCache = new Map();
let latesttolog = '' // ignore
function willthislog(content) { // ignore
    console.log(content)
}

async function initVD() { // vd = vital data
    try {
        const [configResponse, blocklistResponse, proxyListResponse, allowlistResponse] = await Promise.all([
            fetch(chrome.runtime.getURL("config.json")),
            fetch(chrome.runtime.getURL("blocked.txt")),
            fetch(chrome.runtime.getURL("proxies.txt")), // from https://github.com/hagezi/dns-blocklists || https://github.com/hagezi/dns-blocklists/blob/main/adblock/doh-vpn-proxy-bypass.txt
            // yes, proxies.txt has a lot of urls that aren't webproxies but I cannot find a specific plaintext list for web-proxies in particular
            fetch(chrome.runtime.getURL("allowlist.txt"))
        ]);

        config = await configResponse.json();
        targetExtID = config.security; // generated through the admin builder

        const blocklistText = await blocklistResponse.text(); 
        const proxyListText = await proxyListResponse.text();
        const allowlistText = await allowlistResponse.text();

        // parse blocked.txt format
        const blocklistItems = blocklistText.split("\n");
        for (let i = 0; i < blocklistItems.length; i++) {
            const [url, reason, global] = blocklistItems[i].split("[||]");
            blocklist.set(url, { reason, global });
        }

        // parse adblock proxies.txt format to usable for secordis
        const proxyItems = proxyListText.split("\n");
        for (let i = 0; i < proxyItems.length; i++) {
            const url = proxyItems[i];
            if (!url.trimStart().startsWith("!")) {
                blocklist.set(url.replace("||", "").replace("^", ""), { reason: "proxy", global: 'all' });
            }
        } 

        // allowlist.txt
        const allowlistItems = allowlistText.split("\n").filter(line => line.trim());
        for (let i = 0; i < allowlistItems.length; i++) {
            const domain = allowlistItems[i].trim();
            if (domain && !domain.startsWith("#")) {  // Skip empty lines and comments
                allowlist.set(domain, true);
            }
        }

        setupListeners();
        await loadCategorizationCache(); // lookups can get intensive since there is double lookups (root domain + visited domain) and even 3rd party APIs are used

    } catch (error) {
        console.error("Failed to initialize:", error);
        setTimeout(initVD, 1000); // this should NOT be necessary anymore since proxies.txt is local
    }
}

function setupListeners() {
    chrome.webNavigation.onCommitted.addListener(handleNavigation, { url: [{ schemes: ['http', 'https'] }] }); // navigation takes dominance
    chrome.webRequest.onBeforeRequest.addListener(handleBeforeRequest, { // webRequestBlocking is also used
        urls: ["<all_urls>"], 
        types: ['main_frame', 'sub_frame'] 
    }, ["blocking"]);
    chrome.runtime.onMessageExternal.addListener(handleExternalMessage); // this is from secordis security
    chrome.runtime.onMessage.addListener(handleProxyDetectionMessage); // proxy detection
}

async function handleNavigation(details) {
    const domain = grabDomain(details.url);
    const categorization = await getCategorization(domain);

    if (categorization === 'allowed') {
        return; // allow it to proceed
    }

    if (config.blockedCat && config.blockedCat.includes(categorization)) { // proxies blocked by default because duh
        chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL('blocked.html') });
    }
}

async function handleBeforeRequest(details) { 
    // theoretically this isnt doing anything since navigator takes dominance
    const domain = grabDomain(details.url);
    const categorization = await getCategorization(domain);

    if (categorization === 'allowed') {
        return { cancel: false };
    }

    console.log(categorization)
    console.log(config.blockedCat && config.blockedCat.includes(categorization));
    if (config.blockedCat && config.blockedCat.includes(categorization)) {
        if (details.type === 'main_frame' || details.type === 'sub_frame') {
            return { redirectUrl: chrome.runtime.getURL('blocked.html') };
        }
        return { cancel: true };
    }

    return { cancel: false };
}

function handleExternalMessage(message, sender, sendResponse) { // secordis lockdown purposes
    if (message.type === 'ping') {
        sendResponse({ status: 'ok' }); // if a ping isn't recieved in a timely manner, secordis may lock down
    }
    return true;
}

function handleProxyDetectionMessage(message, sender, sendResponse) {
    if (message.action === "proxyDetected") { // proxy detection from content script
        if (!checkAllowlist(message.domain)) { //  heck allowlist before blocking proxy, in case of false positives (rare)
            categorizationCache.set(message.domain, "proxy");
            saveCategorizationCache();
            chrome.tabs.update(sender.tab.id, { url: chrome.runtime.getURL('blocked.html') }); // this will work for blocking
        }
    }
}

function grabDomain(url) {
    const domainMatch = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im);
    return domainMatch ? domainMatch[1] : null;
}

function checkAllowlist(domain) {
    let testDomain = domain;
    while (testDomain) {
        if (allowlist.has(testDomain)) {
            return true;
        }
        const parts = testDomain.split('.');
        if (parts.length <= 2) break;
        testDomain = parts.slice(1).join('.');
    }
    return false;
}

async function getCategorization(domain) {
    // check allowlist first before any cache or categorization
    if (checkAllowlist(domain)) {
        categorizationCache.set(domain, 'allowed');
        saveCategorizationCache();
        return 'allowed';
    }

    if (categorizationCache.has(domain)) {
        const cachedCategory = categorizationCache.get(domain);
        // double-check allowlist even for cached entries
        if (checkAllowlist(domain)) {
            categorizationCache.set(domain, 'allowed');
            saveCategorizationCache();
            return 'allowed';
        }
        return cachedCategory;
    }

    function getRootDomain(domain) { // if a subdomain isn't found but a root domain is, then block the subdomain too
        const parts = domain.split('.');
        if (parts.length > 2) {
            return parts.slice(-2).join('.');
        }
        return domain;
    }

    const rootDomain = getRootDomain(domain);
    let blocklistItem = blocklist.get(domain) || blocklist.get(rootDomain); // see above comment
    let categorization = blocklistItem ? blocklistItem.reason : 'none';

    if (config.integrations && config.integrations.includes("lightspeed")) { // lightspeed's archive API used here; cache is very important in this case
        try {
            const lightspeedCategory = await getLightspeedCategory(domain);
            if (lightspeedCategory !== 'none') {
                categorization = lightspeedCategory;
            }
        } catch (error) {
            console.error("Error getting Lightspeed category:", error);
        }
    }

    // Final allowlist check before caching
    if (checkAllowlist(domain)) {
        categorization = 'allowed';
    }

    categorizationCache.set(domain, categorization);
    saveCategorizationCache(); // stored to chrome.storage
    return categorization;
}

async function loadCategorizationCache() {
    return new Promise((resolve) => {
        chrome.storage.local.get('categorizationCache', (result) => { // grab caches from chrome.storage
            if (result.categorizationCache) {
                categorizationCache = new Map(JSON.parse(result.categorizationCache));
            }
            resolve();
        });
    });
}

function saveCategorizationCache() {
    const cacheArray = Array.from(categorizationCache);
    chrome.storage.local.set({ categorizationCache: JSON.stringify(cacheArray) }); // save to chrome.storage
}

function targetChecking() { // copied from Secordis Security
    function triggerLockdown() {
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
    }
    
    function checkExtensionStatus() {
        let messageReceived = false;
    
        chrome.runtime.sendMessage(targetExtID, {
            type: 'ping'
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error: ', chrome.runtime.lastError);
                handlePossibleBlockerBypass("no response");
            } else if (response && response.status === 'ok') {
                messageReceived = true;
            }
        });
    
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
        if (sender.id === targetExtID && message.type === 'reportIssue') {
            console.log(`report from target ${targetExtID}: ${message.message}`);
        }
    });
    
    setInterval(checkExtensionStatus, 1000);
    console.log("Started");
}

initVD(); // initialize vital data before the blocker starts

console.log("Background script setup complete");

if (config.lockdown) { // make lockdown opt-in
    targetChecking()
}