import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "CheatCode | Targeted Algorithms",
    description: "Personalized coding practice for Google conversion interviews.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
