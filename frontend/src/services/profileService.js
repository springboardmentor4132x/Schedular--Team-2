/**
 * profileService.js
 * Dummy / mock profile data for the Profile Management module.
 * No backend — all data lives in React state seeded from here.
 */

export const mockProfile = {
  // ── Identity ────────────────────────────────────────────────────────────────
  firstName:  'John',
  lastName:   'Doe',
  username:   'johndoe',
  email:      'john@orbitsocial.com',
  phone:      '9876543210',
  role:       'Creator',
  bio:        'Building amazing social media experiences.',
  avatarInitials: 'JD',

  // ── Extended (kept for profile completion / future use) ───────────────────
  company:   'OrbitSocial',
  location:  'San Francisco, CA',
  website:   'https://johndoe.dev',
  timezone:  'Pacific Time (UTC−8)',
  joinedDate: 'January 2023',

  // ── Stats ─────────────────────────────────────────────────────────────────
  stats: { posts: 1284, reach: '98.4K', scheduled: 47 },

  // ── Skills ────────────────────────────────────────────────────────────────
  skills: ['Social Media', 'Content Strategy', 'Analytics', 'Copywriting', 'Brand Management'],

  // ── Social Links ──────────────────────────────────────────────────────────
  socialLinks: [
    { platform: 'Twitter',   handle: '@johndoe',                url: 'https://twitter.com/johndoe'       },
    { platform: 'LinkedIn',  handle: 'linkedin.com/in/johndoe', url: 'https://linkedin.com/in/johndoe'   },
    { platform: 'GitHub',    handle: 'github.com/johndoe',      url: 'https://github.com/johndoe'        },
    { platform: 'Instagram', handle: '@johndoe',                url: 'https://instagram.com/johndoe'     },
  ],
}

// ── Completion checklist ───────────────────────────────────────────────────────

export const completionChecklist = [
  { id: 'photo',    label: 'Add a profile photo',  done: false },
  { id: 'name',     label: 'Set your full name',   done: true  },
  { id: 'email',    label: 'Add your email',        done: true  },
  { id: 'phone',    label: 'Add phone number',      done: true  },
  { id: 'bio',      label: 'Write a bio',           done: true  },
  { id: 'company',  label: 'Set your company',      done: true  },
  { id: 'location', label: 'Add your location',     done: true  },
  { id: 'website',  label: 'Add website URL',       done: true  },
  { id: 'social',   label: 'Connect social links',  done: true  },
]

export function getCompletionPct(list) {
  const done = list.filter(i => i.done).length
  return Math.round((done / list.length) * 100)
}
