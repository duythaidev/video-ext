const keyInput = document.getElementById("keyInput");
const saveBtn = document.getElementById("saveBtn");
const keyValidate = document.getElementById("status");

chrome.storage.sync.get({ hotkey: "Alt" }, (data) => {
  keyInput.value = data.hotkey;
});

saveBtn.onclick = () => {
  const val = keyInput.value.trim();

  if (!val) {
    keyValidate.textContent = "Key không hợp lệ.";
    keyValidate.style.color = "red";
    return;
  }

  chrome.storage.sync.set({ hotkey: val }, () => {
    keyValidate.textContent = "Đã lưu hotkey: " + val;
    keyValidate.style.color = "green";
    setTimeout(() => (keyValidate.textContent = ""), 2000);
  });
};
