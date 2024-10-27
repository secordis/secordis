function injectScript(code) {
    const script = document.createElement('script');
    script.textContent = `(${code.toString()})();`;
    (document.head || document.documentElement).appendChild(script);
    script.remove(); // Remove the script tag after injection (the code will still run)
}

function proxyDetection() {
    console.log("PROXY_DETECTION_STARTING");
    const proxyComponents = [
        { name: 'Ultraviolet', check: () => typeof Ultraviolet !== 'undefined' || typeof __uv$config !== 'undefined' || typeof __uv !== 'undefined' },
        { name: 'BareMux', check: () => typeof BareMux !== 'undefined' },
        { name: 'Scramjet', check: () => typeof __scramjet$config !== 'undefined' },
        { name: 'Ultraviolet Error', check: () => document.querySelector("#uvVersion") && document.querySelector("#uvHostname") },
        { name: 'Scramjet Error', check: () => document.querySelector("body > ul:nth-child(9) > li:nth-child(2)")?.innerText === "Updating Scramjet" },
        { name: 'Chemical', check: () => typeof chemical !== 'undefined' && (typeof chemical.encode !== 'undefined' && typeof chemical.decode !== 'undefined') },
        { name: 'Rammerhead', check: () => {
            const elements = document.getElementsByTagName('a');
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].hasAttribute('href-hammerhead-stored-value')) return true;
            }
            return document.querySelector(".script-hammerhead-shadow-ui") !== null;
        }},
        { name: 'Rammerhead Closed Source', check: () => document.querySelector("#root > script")?.src === "https://paps.binary-person.dev/ce/pbjs.js" },
        { name: 'CroxyProxy', check: () => {
            const footer = document.querySelector("#footer > div > div");
            return (footer && footer.children.length >= 5) || 
                   (document.querySelector("body > main > section.py-4.py-sm-4.py-md-4.text-center.bg-primary.bg-gradient.bg-opacity-75 > div > div.row > div > p > a:nth-child(1)") && 
                    document.querySelector("body > main > section.py-4.py-sm-4.py-md-4.text-center.bg-primary.bg-gradient.bg-opacity-75 > div > div.row > div > p > a:nth-child(5)"));
        }},
        { name: 'Sandstone', check: () => typeof sandstone !== 'undefined' && typeof sandstone.libcurl !== 'undefined' && typeof sandstone.libcurl.copyright !== 'undefined' }
    ];

    const startTime = Date.now();
    const checkInterval = 1500;
    const maxCheckTime = 300000; // 5 minutes

    function checkComponents() {
        const detectedComponents = [];
        for (let i = 0; i < proxyComponents.length; i++) {
            if (proxyComponents[i].check()) {
                detectedComponents.push(proxyComponents[i].name);
            }
        }

        if (detectedComponents.length > 0) {
            console.log("Proxy components detected:", detectedComponents);
            if (window.top === window) {
                window.postMessage({ type: "PROXY_DETECTED", components: detectedComponents }, "*");
            } else {
                // Iframe
                window.top.postMessage({ 
                    type: "PROXY_DETECTED", 
                    components: detectedComponents,
                    source: "iframe",
                    url: window.location.href
                }, "*");
            }
        }
        
        if (Date.now() - startTime < maxCheckTime) {
            setTimeout(checkComponents, checkInterval);
        }
    }

    window.addEventListener("message", (event) => {
        if (event.data.type === "PROXY_DETECTED") {
            window.postMessage({
                type: "PROXY_DETECTED_RELAY",
                domain: new URL(event.data.source === "iframe" ? event.data.url : window.location.href).hostname,
                components: event.data.components
            }, "*");
        }
    });

    checkComponents();
}

injectScript(proxyDetection);

window.addEventListener("message", function(event) {
    if (event.source != window) return;

    if (event.data.type === "PROXY_DETECTED" || event.data.type === "PROXY_DETECTED_RELAY") {
        chrome.runtime.sendMessage({
            action: "proxyDetected",
            domain: event.data.domain || window.location.hostname,
            components: event.data.components
        });
    }
}, false);

function injectIntoIframes() {
    const iframes = document.getElementsByTagName('iframe');
    for (const iframe of iframes) {
        try {
            injectScript(proxyDetection);
        } catch (e) {
            console.log("Failed to inject into iframe:", e);
        }
    }
}

injectIntoIframes();

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'IFRAME') {
                try {
                    injectScript(proxyDetection);
                } catch (e) {
                    console.log("Failed to inject into new iframe:", e);
                }
            }
        });
    });
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});