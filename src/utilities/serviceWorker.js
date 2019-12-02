// for push
//console.log('PERM', Notification.permission);
//Notification.requestPermission().then((result) => { if (result === "granted") {} });
//self.onpush = (event) => {}
//event.waitUntil()
//self.registration.showNotification(title, { body, icon, tab });
//var notification = new Notification("Hi there!");
//file = request.url.slice(request.url.lastIndexOf('/'));


function isDev() {
  return window.location.hostname === 'localhost';
}

function getServiceWorkerUrl() {
  const base = isDev() ? '/' : '/react-setup/';
  return `${base}serviceWorker.js`;
}

export function registerServiceWorker() {
  if (navigator.serviceWorker) {
    const url = getServiceWorkerUrl();
    navigator.serviceWorker.register(url).then((reg) => {
      reg.onupdatefound = () => {
        const sw = reg.installing;
        if (sw !== null) {
          sw.onstatechange = () => {
          };
          sw.onupdatefound = () => {
          };
          sw.oncontrollerchange = () => {
          };
        }
      };
    }).catch(() => {
    });
  }
}
