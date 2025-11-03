/**
 * Initialize app by detecting available backend port
 * Tries ports 5000-5009 and stores the working port in localStorage
 */

export const initializeBackendConnection = async () => {
  const portsToTry = [5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5008, 5009];
  
  console.log('🔍 Detecting available backend server...');
  
  for (const port of portsToTry) {
    try {
      const response = await fetch(`http://localhost:${port}/`, {
        method: 'GET',
        timeout: 2000,
      });
      
      if (response.ok || response.status === 0) {
        console.log(`✅ Backend found on port ${port}`);
        localStorage.setItem('backendPort', port.toString());
        return port;
      }
    } catch (error) {
      // Port not responding, try next
      continue;
    }
  }
  
  // If no backend found, log warning but continue with default
  console.warn('⚠️  Backend not detected. Using default port 5000.');
  console.warn('Make sure backend is running: cd backend && npm start');
  
  const storedPort = localStorage.getItem('backendPort') || '5000';
  return parseInt(storedPort);
};
