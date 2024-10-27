document.addEventListener('DOMContentLoaded', function() {
    var logoImg = document.getElementById('secordisLogo');
    logoImg.src = chrome.runtime.getURL('large_secordis.png');
});

document.getElementById("blockinfo").addEventListener("click", function () {
    fetch(chrome.runtime.getURL("config.json"))
    .then(data => data.json())
    .then(data => {
        let report = `FOR STUDENTS:\nIf this a site you *should* be visiting, please contact an admin to get the URL whitelisted. As for now, you may have to find an alternative. Websites are most likely blocked for a reason; please refrain from malicious usage of your school managed device.\n\nVITAL DATA:\nConfig Blocked Categories: ${data.blockedCat}.\nProxies auto-blocked by default.\nLockdown Enabled: ${data.lockdown}.\nIntegrations exist: ${data.integrations.length > 0}.\n\nFOR AUTHORIZED:\nPlease add, or request, the blocked URL to be whitelisted in Secordis Admin, if deemed necessary. Ensure that Secordis Authentication is functioning properly.`
        alert(report)
    })
})