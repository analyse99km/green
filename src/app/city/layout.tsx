import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:8080'),
  title: 'Neon Metropolis: Text Underworld RPG | Decentralized P2P Syndicate Strategy',
  description:
    'Join Neon Metropolis: the definitive decentralized text RPG. Trade on peer-to-peer player bazaars, execute 13-branch tactical crimes, train stats with Happy Jump multipliers, upgrade weapons in the Cyber Forge, and dominate the underworld economy with GREEN coins.',
  keywords: [
    'Text RPG',
    'Neon Metropolis',
    'Underworld RPG',
    'Bazaar Trading',
    'Crime RPG',
    'P2P Decentralized Game',
    'GREEN Token RPG',
    'Browser Text Game',
    'Cyberpunk RPG',
  ],
  authors: [{ name: 'Neon Metropolis Syndicate' }],
  openGraph: {
    title: 'Neon Metropolis: Underworld Text RPG',
    description:
      'Live your criminal or corporate empire in a decentralized text RPG with P2P trading, tactical combat, weapon forge, and 13-tier crime syndicates.',
    url: '/city',
    siteName: 'Neon Metropolis',
    images: [
      {
        url: '/og-city.png',
        width: 1200,
        height: 630,
        alt: 'Neon Metropolis Text RPG',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neon Metropolis: Underworld Text RPG',
    description:
      'Live your criminal or corporate empire with P2P trading, tactical combat, weapon forge, and 13-tier crime syndicates.',
  },
};

export default function CityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
