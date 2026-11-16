import "./globals.css";

export const metadata = { title: "SPECTRES // OUTREACH" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07090c] text-slate-300 font-mono antialiased selection:bg-emerald-500/30 selection:text-emerald-400 m-0 p-0">
        {children}
      </body>
    </html>
  );
}