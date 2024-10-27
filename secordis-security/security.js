        document.addEventListener('DOMContentLoaded', function() {
            var logoImg = document.getElementById('secordisLogo');
            logoImg.src = chrome.runtime.getURL('large_secordis.png');
        });