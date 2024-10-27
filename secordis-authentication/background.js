chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "updateHeader") {
      chrome.storage.local.get(["instance", "password"], ({ instance, password }) => {
        if (instance && password) {
          const rule = {
            id: 1,
            priority: 1,
            action: {
              type: "modifyHeaders",
              requestHeaders: [{
                header: "x-secordis-auth",
                operation: "set",
                value: password
              }]
            },
            condition: {
              urlFilter: instance,
              resourceTypes: ["main_frame", "xmlhttprequest"]
            }
          };
  
          chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [1],
            addRules: [rule]
          }, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]) {
                chrome.tabs.reload(tabs[0].id);
              }
            });
          });
        }
      });
    }
  });
  