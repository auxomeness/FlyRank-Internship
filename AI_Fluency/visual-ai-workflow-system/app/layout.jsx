import "./globals.css";

export const metadata = {
  title: "Visual AI Workflow System",
  description: "React Flow + Inngest decision workflow builder",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
