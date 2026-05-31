
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);

const isNativeShell = Boolean((window as any).Capacitor?.isNativePlatform?.());

if (import.meta.env.PROD && !isNativeShell && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // The app still works if service worker registration is unavailable.
    });
  });
} else if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .then(() => caches.keys())
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('city-grind-')).map((key) => caches.delete(key))))
      .catch(() => {
        // Development should keep running even if an old worker cannot be cleared.
      });
  });
}
  
