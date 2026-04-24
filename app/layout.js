import './globals.css';

export const metadata = {
  title: 'Coachly — Track your training',
  description: 'Coachly helps you track workouts, wellbeing, and nutrition in one place. Secure coach access via share codes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
