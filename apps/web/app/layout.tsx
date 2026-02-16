import type { Metadata } from 'next';
import './globals.css';
import { TopNav } from '../components/top-nav';
import { Providers } from '../components/providers';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'ApplyPilot',
  description: 'Smarter applications. Faster offers.',
  icons: {
    icon: '/brand/icon.svg',
  },
  openGraph: {
    title: 'ApplyPilot',
    description: 'Smarter applications. Faster offers.',
    images: ['/brand/social-preview.svg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="mx-auto min-h-screen max-w-7xl p-4 md:p-8">
        <Providers>
          <TopNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
