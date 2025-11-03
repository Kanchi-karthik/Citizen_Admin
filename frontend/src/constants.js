// Dynamic Backend Port Detection
// Tries common ports: 5000, 5001, 5002, etc.
const getBackendPort = () => {
  // Check if port is specified in localStorage (set by app on first successful connection)
  const storedPort = localStorage.getItem('backendPort');
  if (storedPort) return storedPort;
  
  // Default ports to try in order
  return '5000';
};

export const API_BASE_URL = `http://localhost:${getBackendPort()}/api`;

export const COMPLAINT_CATEGORIES = [
  'Water Scarcity',
  'Drainage System',
  'Road Infrastructure',
  'Waste Management',
  'Electricity Outage',
  'Public Safety',
  'Traffic Congestion',
  'Street Lighting',
  'Public Parks',
  'Illegal Encroachment',
  'Other',
];

export const COMPLAINT_STATUSES = [
  'Pending',
  'In Progress',
  'Resolved',
  'Closed', // Added 'Closed' for admin lifecycle
];

export const USER_ROLES = ['user', 'admin'];

export const FEEDBACK_TYPES = [
  'complaint',
  'service',
  'app_experience',
  'suggestion',
  'other',
];

export const FEEDBACK_CATEGORIES = [
  'timeliness',
  'staff_behavior',
  'cleanliness',
  'response_quality',
  'ease_of_use',
  'communication',
];

// Lucide Icons mapping for sidebar (example, you'd use <Icon name="home" /> in JSX)
// Note: Actual Lucide React components are imported and used directly,
// this is just for conceptual mapping if dynamic icon names were needed.
export const ICON_MAP = {
  dashboard: 'LayoutDashboard',
  users: 'Users',
  complaints: 'ClipboardList',
  feedback: 'MessageSquareText',
  contacts: 'Mail',
  settings: 'Settings',
  plus: 'Plus',
  edit: 'Pencil',
  trash: 'Trash2',
  view: 'Eye',
  check: 'Check',
  x: 'X',
  menu: 'Menu',
};
