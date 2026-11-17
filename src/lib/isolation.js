// GitHub Pages cannot supply COOP/COEP headers directly. The service worker
// adds them on the next navigation, not to the document it just claimed.
export async function prepareIsolation(scriptPath) {
  const scriptURL = new URL(scriptPath, location.href).href;
  const key = `vim-field-guide:isolation:${new URL(scriptURL).pathname}`;
  if (window.crossOriginIsolated) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* Storage can be disabled. */
    }
    return true;
  }
  if (!window.isSecureContext || !navigator.serviceWorker) return false;
  const serviceWorker = navigator.serviceWorker;
  const controlsPage = () => serviceWorker.controller?.scriptURL === scriptURL;
  let check, timeout, finish;
  const controlled = new Promise((resolve) => {
    finish = resolve;
    check = () => {
      if (controlsPage()) resolve(true);
    };
    serviceWorker.addEventListener('controllerchange', check);
    timeout = setTimeout(() => resolve(false), 10000);
    check();
  });
  try {
    // Listen before registering: activation can precede the promise delivery.
    serviceWorker.register(scriptURL).then(check, () => finish(false));
    if (!(await controlled)) return false;
    // One controlled reload is enough. Unsupported contexts must not loop.
    try {
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, '1');
    } catch {
      return false;
    }
    location.reload();
    return new Promise(() => {}); // Do not start a worker in the old document.
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
    serviceWorker.removeEventListener('controllerchange', check);
  }
}
