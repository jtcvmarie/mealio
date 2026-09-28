import './globals.css';
import type { Metadata } from 'node_modules/next';

export const metadata: Metadata = {
  title: 'Podge',
  description: 'Turn what you have into something wonderful',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
