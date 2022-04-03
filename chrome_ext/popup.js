// popup.js doesn't really do anything right now
document.addEventListener("DOMContentLoaded", function () {
  fetch(`http://localhost:3001/api/users`).then(async (res) => {
    console.log(res);
    if (res.status === 204) {
      chrome.action.setPopup({ popup: "login.html" });
    }
    if (res.status === 200) {
      user = await res.json();
    }
  });
});
