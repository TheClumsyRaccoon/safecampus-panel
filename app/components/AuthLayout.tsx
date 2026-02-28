import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  error?: string;
}

export default function AuthLayout({ children, title, subtitle, error }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold text-primary">
              SafeCampus
            </h1>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-lg">
            <h2 className="mb-2 text-center text-3xl font-bold text-textprimary">{title}</h2>
            {subtitle && (
              <p className="mb-6 text-center text-sm text-textsecondary">{subtitle}</p>
            )}

            {error && (
              <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-500">
                {error}
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-textsecondary">
        Développé avec ❤️ pour la communauté. {new Date().getFullYear()} par TheClumsyRaccoon.
      </footer>
    </div>
  );
}