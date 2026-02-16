import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'ApplyPilot Job Copilot',
  version: '1.0.0',
  description: 'Smarter applications. Faster offers. Job match, ATS insights, and assistive autofill.',
  permissions: ['storage', 'activeTab', 'scripting', 'sidePanel'],
  host_permissions: ['<all_urls>'],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
    },
  ],
  side_panel: {
    default_path: 'sidepanel.html',
  },
  action: {
    default_title: 'ApplyPilot Copilot',
    default_icon: {
      '16': 'src/assets/icon16.png',
      '48': 'src/assets/icon48.png',
      '128': 'src/assets/icon128.png',
    },
  },
  icons: {
    '16': 'src/assets/icon16.png',
    '48': 'src/assets/icon48.png',
    '128': 'src/assets/icon128.png',
  },
  web_accessible_resources: [
    {
      resources: ['assets/*'],
      matches: ['<all_urls>'],
    },
  ],
});
