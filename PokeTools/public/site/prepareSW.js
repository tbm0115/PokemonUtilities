if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.addEventListener("message", function (event) {

    });
    navigator.serviceWorker.register("/sw.js").then(function (registration) {
      console.log("[ServiceWorker.Registration] Successful with scope: ", registration.scope);
    }, function (err) {
      console.log("[ServiceWorker.Registration] Failed: ", err);
    });
  });
} else {
  console.log("[ServiceWorker] Service workers are not supported on this browser!");
}

function showAddToHomeScreen() {
  if (pwaInstall.ev !== null) {
    pwaInstall.ev.prompt();

    pwaInstall.ev.userChoice.then(function pwaUserChoice(result) {
      if (result.outcome === "accepted") {
        pwaInstall.li.style.display = "none";
        console.log("[ServiceWorker.showAddToHomeScreen] User accepted Add To Homescreen");
      } else {
        pwaInstall.li.style.display = "inline-block";
        console.log("[ServiceWorker.showAddToHomeScreen] User declined Add To Homescreen");
      }
      pwaInstall.ev = null;
    });
  }
}
var pwaInstall = {
  ev: null,
  li: null,
  btn: null
}
document.querySelector("#liA2HS").style.display = "none";
if ("onbeforeinstallprompt" in window) {
  window.onbeforeinstallprompt = function (ev) {
    ev.preventDefault();

    pwaInstall.ev = ev;
    pwaInstall.li = document.querySelector("#liA2HS");
    pwaInstall.li.style.display = "inline-block";
    pwaInstall.btn = document.querySelector("#btnA2HS");
  }
}