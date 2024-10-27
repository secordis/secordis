chrome.storage.sync.get(['instanceUrl', 'password'], (result) => {
    const { instanceUrl, password } = result;

    chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [{
            id: 1,
            priority: 1,
            action: {
                type: 'modifyHeaders',
                requestHeaders: [{
                    headerName: 'x-secordis-auth',
                    headerValue: password
                }]
            },
            condition: {
                urlFilter: instanceUrl + "*"
            }
        }]
    });
});