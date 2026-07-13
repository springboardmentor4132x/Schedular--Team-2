import { settingsService as apiSettingsService } from './api';

export const defaultSettings = {
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    productUpdates: true,
    weeklySummary: false,
    securityAlerts: true,
  },
  security: {
    twoFactorAuth: false,
    rememberDevice: true,
    loginAlerts: true,
    sessionTimeout: false,
    deviceVerification: true,
    trustedDevices: true,
  },
  privacy: {
    publicProfile: true,
    showEmail: false,
    showActivityStatus: true,
    allowSearchEngines: false,
    personalizedRecs: true,
  },
  region: {
    language: 'en',
    timezone: 'UTC-8',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },
  accountInfo: {
    currentPlan: 'Professional',
    storageUsed: '4.2 GB / 50 GB',
    connectedDevices: 3,
    createdDate: 'January 12, 2023',
    lastLogin: 'July 9, 2026 at 17:42',
  }
};

const mapBackendToFrontend = (data) => {
  if (!data) return defaultSettings;
  return {
    ...defaultSettings,
    notifications: {
      emailNotifications: data.email_notifications,
      pushNotifications: data.push_notifications,
      marketingEmails: data.marketing_emails,
      productUpdates: data.product_updates,
      weeklySummary: data.weekly_summary,
      securityAlerts: data.security_alerts,
    },
    security: {
      twoFactorAuth: data.two_factor_auth,
      rememberDevice: data.remember_device,
      loginAlerts: data.login_alerts,
      sessionTimeout: data.session_timeout,
      deviceVerification: true, // not in db yet
      trustedDevices: true, // not in db yet
    },
    privacy: {
      publicProfile: data.public_profile,
      showEmail: data.show_email,
      showActivityStatus: data.show_activity_status,
      allowSearchEngines: data.allow_search_engines,
      personalizedRecs: true, // not in db yet
    },
    region: {
      language: data.language,
      timezone: data.timezone,
      dateFormat: data.date_format,
      timeFormat: data.time_format,
    }
  };
};

const mapFrontendToBackend = (data) => {
  return {
    email_notifications: data.notifications.emailNotifications,
    push_notifications: data.notifications.pushNotifications,
    marketing_emails: data.notifications.marketingEmails,
    product_updates: data.notifications.productUpdates,
    weekly_summary: data.notifications.weeklySummary,
    security_alerts: data.notifications.securityAlerts,
    
    two_factor_auth: data.security.twoFactorAuth,
    remember_device: data.security.rememberDevice,
    login_alerts: data.security.loginAlerts,
    session_timeout: data.security.sessionTimeout,
    
    public_profile: data.privacy.publicProfile,
    show_email: data.privacy.showEmail,
    show_activity_status: data.privacy.showActivityStatus,
    allow_search_engines: data.privacy.allowSearchEngines,
    
    language: data.region.language,
    timezone: data.region.timezone,
    date_format: data.region.dateFormat,
    time_format: data.region.timeFormat,
  };
};

export const settingsService = {
  getSettings: async () => {
    try {
      const data = await apiSettingsService.getSettings();
      return mapBackendToFrontend(data);
    } catch (e) {
      console.error('Failed to read settings from backend', e);
      return defaultSettings;
    }
  },

  saveSettings: async (settings) => {
    try {
      const backendData = mapFrontendToBackend(settings);
      await apiSettingsService.updateSettings(backendData);
      return true;
    } catch (e) {
      console.error('Failed to save settings to backend', e);
      return false;
    }
  }
};
