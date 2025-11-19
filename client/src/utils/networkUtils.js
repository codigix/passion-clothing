/**
 * Network utility functions for detecting local IP and creating network-accessible URLs
 */

/**
 * Get local IP address by creating a temporary WebSocket connection
 * This method works reliably across browsers
 */
const getLocalIPFromWebRTC = async () => {
  return new Promise((resolve) => {
    const pc = new RTCPeerConnection({ iceServers: [] });
    const ips = [];

    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(() => {});

    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate) {
        pc.close();
        resolve(ips[0] || null);
        return;
      }

      const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
      const ipAddress = ipRegex.exec(ice.candidate.candidate);
      
      if (ipAddress && ipAddress[1]) {
        const ip = ipAddress[1];
        if (!ips.includes(ip)) {
          ips.push(ip);
        }
      }
    };

    setTimeout(() => {
      pc.close();
      resolve(ips[0] || null);
    }, 1000);
  });
};

/**
 * Get the base URL for accessing the app on the local network
 * Returns either localhost or the actual local IP
 */
export const getNetworkBaseUrl = async () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }

  const currentHostname = window.location.hostname;
  const currentPort = window.location.port || (window.location.protocol === 'https:' ? 443 : 80);

  if (currentHostname !== 'localhost' && currentHostname !== '127.0.0.1') {
    return `${window.location.protocol}//${currentHostname}:${currentPort}`;
  }

  const localIP = await getLocalIPFromWebRTC();

  if (localIP && localIP !== '127.0.0.1') {
    return `${window.location.protocol}//${localIP}:${window.location.port || 3000}`;
  }

  return `${window.location.protocol}//${window.location.hostname}:${currentPort}`;
};

/**
 * Get a simplified network URL (without /api prefix)
 */
export const getSimpleNetworkUrl = async () => {
  const baseUrl = await getNetworkBaseUrl();
  return baseUrl;
};

/**
 * Format URL for sharing (removes protocol for simpler display)
 */
export const formatShareUrl = (fullUrl) => {
  try {
    const url = new URL(fullUrl);
    return `${url.hostname}:${url.port}`;
  } catch {
    return fullUrl;
  }
};
