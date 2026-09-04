// Separate root layout for the embedded Sanity Studio (/studio) — deliberately does
// not import the site's globals.css or wrap in Header/Footer, since Studio renders its
// own full-viewport UI and Tailwind's base styles would conflict with it.
export const metadata = {
  title: "HaydenGoSeek Studio",
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
