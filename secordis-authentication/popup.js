document.getElementById('save').addEventListener('click', async () => {
    const instance = document.getElementById('instance').value;
    const password = document.getElementById('password').value;
  
    if (instance && password) {
      await chrome.storage.local.set({ instance, password });
      chrome.runtime.sendMessage({ action: "updateHeader" });
    } else {
      alert("Please enter both instance URL and password.");
    }
  });
  