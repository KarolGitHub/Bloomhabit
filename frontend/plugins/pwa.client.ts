export default defineNuxtPlugin(() => {
  // Only run on client side
  if (process.client) {
    registerServiceWorker();
    setupPushNotifications();
    setupPWAInstall();
    setupOfflineDetection();
  }
});

// Register service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              showUpdateNotification(registration);
            }
          });
        }
      });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          showUpdateNotification(registration);
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

// Setup push notifications
async function setupPushNotifications() {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    // Request notification permission
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
        subscribeToPushNotifications();
      }
    } else if (Notification.permission === 'granted') {
      subscribeToPushNotifications();
    }
  }
}

// Subscribe to push notifications
async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    const existingSubscription =
      await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Already subscribed to push notifications');
      return;
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.VAPID_PUBLIC_KEY || ''
      ),
    });

    console.log('Push notification subscription:', subscription);

    // Send subscription to server
    await sendSubscriptionToServer(subscription);
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
  }
}

// Setup PWA install prompt
function setupPWAInstall() {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show install button or banner
    showInstallPrompt();
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    hideInstallPrompt();

    // Track installation
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install', {
        event_category: 'engagement',
        event_label: 'PWA Installation',
      });
    }
  });
}

// Show PWA install prompt
function showInstallPrompt() {
  // Create install banner
  const installBanner = document.createElement('div');
  installBanner.id = 'pwa-install-banner';
  installBanner.className = 'pwa-install-banner';
  installBanner.innerHTML = `
    <div class="install-content">
      <div class="install-icon">🌱</div>
      <div class="install-text">
        <h3>Install Bloomhabit</h3>
        <p>Add to your home screen for quick access</p>
      </div>
      <div class="install-actions">
        <button class="button primary small" id="pwa-install-btn">Install</button>
        <button class="button secondary small" id="pwa-dismiss-btn">Not Now</button>
      </div>
    </div>
  `;

  // Add styles
  const styles = document.createElement('style');
  styles.textContent = `
    .pwa-install-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid #e5e7eb;
      padding: 1rem;
      box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      transform: translateY(100%);
      transition: transform 0.3s ease;
    }

    .pwa-install-banner.show {
      transform: translateY(0);
    }

    .install-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .install-icon {
      font-size: 2rem;
    }

    .install-text {
      flex: 1;
    }

    .install-text h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .install-text p {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .install-actions {
      display: flex;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .install-content {
        flex-direction: column;
        text-align: center;
        gap: 0.75rem;
      }

      .install-actions {
        justify-content: center;
      }
    }
  `;

  document.head.appendChild(styles);
  document.body.appendChild(installBanner);

  // Show banner with animation
  setTimeout(() => {
    installBanner.classList.add('show');
  }, 100);

  // Handle install button click
  document
    .getElementById('pwa-install-btn')
    ?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Install prompt outcome:', outcome);
        deferredPrompt = null;
      }
      hideInstallPrompt();
    });

  // Handle dismiss button click
  document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
    hideInstallPrompt();
  });
}

// Hide PWA install prompt
function hideInstallPrompt() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.remove('show');
    setTimeout(() => {
      banner.remove();
    }, 300);
  }
}

// Setup offline detection
function setupOfflineDetection() {
  const updateOnlineStatus = () => {
    if (!navigator.onLine) {
      console.log('App went offline');
      showOfflineIndicator();
    } else {
      console.log('App came back online');
      hideOfflineIndicator();
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Initial check
  updateOnlineStatus();
}

// Show offline indicator
function showOfflineIndicator() {
  // Create offline indicator
  let indicator = document.getElementById('offline-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'offline-indicator';
    indicator.className = 'offline-indicator';
    indicator.innerHTML = `
      <span>📡 You're offline</span>
    `;

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      .offline-indicator {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ef4444;
        color: white;
        text-align: center;
        padding: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 1001;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
      }

      .offline-indicator.show {
        transform: translateY(0);
      }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(indicator);
  }

  // Show indicator
  setTimeout(() => {
    indicator?.classList.add('show');
  }, 100);
}

// Hide offline indicator
function hideOfflineIndicator() {
  const indicator = document.getElementById('offline-indicator');
  if (indicator) {
    indicator.classList.remove('show');
  }
}

// Show update notification
function showUpdateNotification(registration: ServiceWorkerRegistration) {
  // Create update notification
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <div class="update-content">
      <div class="update-icon">🔄</div>
      <div class="update-text">
        <h3>Update Available</h3>
        <p>A new version of Bloomhabit is available</p>
      </div>
      <div class="update-actions">
        <button class="button primary small" id="update-btn">Update Now</button>
        <button class="button secondary small" id="update-later-btn">Later</button>
      </div>
    </div>
  `;

  // Add styles
  const styles = document.createElement('style');
  styles.textContent = `
    .update-notification {
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      max-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }

    .update-notification.show {
      transform: translateX(0);
    }

    .update-content {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .update-icon {
      font-size: 1.5rem;
      text-align: center;
    }

    .update-text h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .update-text p {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .update-actions {
      display: flex;
      gap: 0.5rem;
    }
  `;

  document.head.appendChild(styles);
  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  // Handle update button click
  document.getElementById('update-btn')?.addEventListener('click', () => {
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  });

  // Handle later button click
  document.getElementById('update-later-btn')?.addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });

  // Auto-hide after 10 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 10000);
}

// Send subscription to server
async function sendSubscriptionToServer(subscription: PushSubscription) {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (response.ok) {
      console.log('Subscription sent to server successfully');
    } else {
      console.error('Failed to send subscription to server');
    }
  } catch (error) {
    console.error('Error sending subscription to server:', error);
  }
}

// Convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
