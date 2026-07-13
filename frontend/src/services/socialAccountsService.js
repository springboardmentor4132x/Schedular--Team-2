import { apiSocialAccountsService } from './api';

const PLATFORMS = ['instagram', 'facebook', 'linkedin', 'twitter', 'youtube', 'pinterest'];

const formatDate = (dateString) => {
  if (!dateString) return '--';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '--';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

const createDisconnectedAccount = (platformId, platformName) => ({
  id: platformId,
  platform: platformName,
  username: '--',
  followers: '--',
  status: 'Not Connected',
  health: '--',
  connectedSince: '--',
  lastSync: '--',
});

const mapBackendToFrontend = (apiAcc) => {
  // Using the actual database ID for connected accounts so we can sync/disconnect
  return {
    id: apiAcc.id,
    platformId: apiAcc.platform,
    platform: apiAcc.platform.charAt(0).toUpperCase() + apiAcc.platform.slice(1),
    username: apiAcc.username || '--',
    followers: apiAcc.followers_count || '--',
    status: apiAcc.status,
    health: apiAcc.health,
    connectedSince: formatDate(apiAcc.connected_since),
    lastSync: formatTimeAgo(apiAcc.last_sync),
  };
};

export const socialAccountsService = {
  getAccounts: async () => {
    try {
      const apiAccounts = await apiSocialAccountsService.getAccounts();
      const connected = apiAccounts.map(mapBackendToFrontend);
      
      const allAccounts = PLATFORMS.map((platformName) => {
        const found = connected.find(c => c.platformId.toLowerCase() === platformName);
        if (found) {
          return found;
        }
        return createDisconnectedAccount(platformName, platformName.charAt(0).toUpperCase() + platformName.slice(1));
      });
      return allAccounts;
    } catch (e) {
      console.error('Failed to fetch accounts', e);
      return [];
    }
  },

  connectAccount: async (platformId) => {
    await apiSocialAccountsService.connectAccount(platformId);
  },

  disconnectAccount: async (accountId) => {
    await apiSocialAccountsService.disconnectAccount(accountId);
  },

  syncAccount: async (accountId) => {
    await apiSocialAccountsService.syncAccount(accountId);
  },

  // Activities will remain in local memory for now just for UI feedback
  activities: [],
  getActivities: () => {
    return [...socialAccountsService.activities];
  },
  addActivity: (activity) => {
    socialAccountsService.activities = [activity, ...socialAccountsService.activities].slice(0, 10);
    return socialAccountsService.activities;
  }
};
