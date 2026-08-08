export const Routes = {
  // Authentication
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",

  // Dashboard
  DASHBOARD: "/dashboard",

  // Dashboard Pages
  APPLIANCES: "/dashboard/appliances",
  COMPONENTS: "/dashboard/components",
  ACTIVITY_LOGS: "/dashboard/activity-logs",
  
  NOTIFICATIONS: "/dashboard/notifications",
  SETTINGS: "/dashboard/settings",
  ABOUT_US: "/dashboard/about-us",
} as const;