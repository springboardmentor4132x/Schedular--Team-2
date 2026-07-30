export const initialCreatorProfile = {
  id: 'CR-84920',
  name: 'Alex Rivers',
  username: 'alex_creator',
  category: 'Tech & Digital Culture',
  isVerified: true,
  location: 'San Francisco, CA',
  email: 'alex.rivers@orbitsocial.com',
  phone: '+1 (555) 234-5678',
  bio: 'Tech content creator & frontend reviewer. Sharing tutorials, hardware insights, and Vite/React tips with 120k+ engaged followers.',
  website: 'https://alexrivers.dev',
  language: 'English (US)',
  timezone: 'Pacific Time (US & Canada)',
  dob: '1995-08-14',
  gender: 'Male',
}

export const initialStats = [
  { label: 'Followers', value: '128.4K', change: '+12%', positive: true, icon: '👥', color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
  { label: 'Following', value: '482', change: '+5 active', positive: true, icon: '👣', color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' },
  { label: 'Total Posts', value: '342', change: '89 this year', positive: true, icon: '📝', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
  { label: 'Campaigns Completed', value: '18', change: '100% success rate', positive: true, icon: '🚀', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
  { label: 'Pending Reviews', value: '3', change: '2 urgent briefs', positive: false, icon: '⏳', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' },
  { label: 'Engagement Rate', value: '4.8%', change: '+0.6% vs avg', positive: true, icon: '🔥', color: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400' },
  { label: 'Average Reach', value: '45.2K', change: 'Per post avg', positive: true, icon: '📊', color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
  { label: 'Platforms Connected', value: '5', change: '6 total integrated', positive: true, icon: '🔗', color: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400' },
]

export const initialSocialAccounts = [
  { id: 'instagram', platform: 'Instagram', handle: '@alex_rivers_official', followers: '48.2K', connected: true, verified: true, icon: '📸' },
  { id: 'facebook', platform: 'Facebook', handle: '@AlexRiversTech', followers: '22.5K', connected: true, verified: true, icon: '📘' },
  { id: 'linkedin', platform: 'LinkedIn', handle: 'alex-rivers-creator', followers: '18.9K', connected: true, verified: true, icon: '💼' },
  { id: 'youtube', platform: 'YouTube', handle: '@AlexRiversTech', followers: '32.1K', connected: true, verified: true, icon: '▶️' },
  { id: 'twitter', platform: 'X (Twitter)', handle: '@alex_rivers_x', followers: '14.7K', connected: true, verified: true, icon: '𝕏' },
  { id: 'pinterest', platform: 'Pinterest', handle: '@alexrivers_pins', followers: '5.2K', connected: false, verified: false, icon: '📌' },
]

export const allSpecializations = [
  'Technology',
  'Education',
  'Travel',
  'Fitness',
  'Finance',
  'Photography',
  'Gaming',
  'Lifestyle',
  'Food',
]

export const initialContentTypes = [
  { id: 'video', label: 'Video', icon: '🎥', selected: true },
  { id: 'reels', label: 'Reels', icon: '🎬', selected: true },
  { id: 'stories', label: 'Stories', icon: '📲', selected: true },
  { id: 'carousel', label: 'Carousel', icon: '🖼️', selected: true },
  { id: 'shorts', label: 'Shorts', icon: '⚡', selected: true },
  { id: 'longform', label: 'Long-form Video', icon: '📺', selected: false },
]

export const recentActivities = [
  { id: 1, type: 'Profile Updated', time: '2 hours ago', details: 'Updated creator bio and contact info', icon: '👤', color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' },
  { id: 2, type: 'Campaign Joined', time: 'Yesterday', details: 'Joined "Nike Summer Launch 2026"', icon: '🚀', color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' },
  { id: 3, type: 'Social Connected', time: '3 days ago', details: 'Connected X (Twitter) @alex_rivers_x', icon: '🔗', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
  { id: 4, type: 'Content Scheduled', time: '4 days ago', details: 'Scheduled Instagram Reel "Vite 6 Hack"', icon: '📅', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
  { id: 5, type: 'Review Received', time: '5 days ago', details: 'Brand reviewer approved draft video', icon: '✅', color: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400' },
]

export const achievements = [
  { id: 1, title: 'Verified Creator', subtitle: 'Official identity confirmed', icon: '⭐', badgeColor: 'badge-primary' },
  { id: 2, title: 'Top Performer', subtitle: 'Top 5% creator engagement', icon: '🏆', badgeColor: 'badge-success' },
  { id: 3, title: '100 Posts', subtitle: 'Published over 100 posts', icon: '📝', badgeColor: 'badge-info' },
  { id: 4, title: '10 Campaigns', subtitle: 'Successfully delivered 10 brand deals', icon: '🚀', badgeColor: 'badge-warning' },
  { id: 5, title: '100K Reach', subtitle: 'Crossed 100K total audience', icon: '📈', badgeColor: 'badge-secondary' },
  { id: 6, title: 'Featured Creator', subtitle: 'Highlighted in OrbitSocial Spotlight', icon: '✨', badgeColor: 'badge-live' },
]

export const quickActions = [
  { title: 'Create New Post', desc: 'Draft a new Reel, Short, or Thread', icon: '✍️', link: '/dashboard/creator/posts' },
  { title: 'Schedule Content', desc: 'Set date & time for upcoming posts', icon: '📅', link: '/dashboard/creator/scheduling' },
  { title: 'Manage Campaigns', desc: 'Review brand briefs and guidelines', icon: '🚀', link: '/dashboard/creator/campaigns' },
  { title: 'Publishing Calendar', desc: 'View monthly and weekly schedule', icon: '📆', link: '/dashboard/creator/calendar' },
  { title: 'Analytics', desc: 'Track reach, engagement, and growth', icon: '📊', link: '/dashboard/creator/dashboard' },
  { title: 'Settings', desc: 'Configure notifications and security', icon: '⚙️', link: '/dashboard/creator/settings' },
]
