/**
 * Automatically detect available backend port by testing common ports
 * Tries ports: 5000, 5001, 5002, 5003, 5004, 5005
 */

const testPort = async (port) => {
  try {
    const response = await fetch(`http://localhost:${port}/`, {
      method: 'GET',
      mode: 'no-cors',
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const detectBackendPort = async () => {
  const portsToTry = [5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5008, 5009];
  
  console.log('🔍 Detecting available backend port...');
  
  for (const port of portsToTry) {
    try {
      const response = await fetch(`http://localhost:${port}/`, {
        method: 'HEAD',
      });
      console.log(`✅ Backend found on port ${port}`);
      return port;
    } catch (error) {
      // Port not responding, try next
      continue;
    }
  }
  
  // Default fallback
  console.warn('⚠️  Could not detect backend port, using default 5000');
  return 5000;
};

export default detectBackendPort;
