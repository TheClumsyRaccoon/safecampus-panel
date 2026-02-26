"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Échec de connexion : Vérifiez vos identifiants.");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4">
      <main className="flex w-full flex-1 flex-col items-center justify-center">
        <h1 className="text-primary text-5xl font-bold pb-6"> SafeCampus</h1>
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-3xl font-bold mb-2 text-center text-textmain">Connexion</h2>
            <p className="text-center text-textsecondary mb-8 text-sm">Accédez à votre espace auteur</p>
            
            {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">{error}</p>}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="group">
                <label className="block text-sm font-medium text-textsecondary mb-1 group-focus-within:text-primary transition-colors">Email</label>
                <input
                  type="email"
                  placeholder="admin@safecampus.com"
                  className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:border-primary text-textmain transition-colors bg-gray-50 focus:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="group">
                <label className="block text-sm font-medium text-textsecondary mb-1 group-focus-within:text-primary transition-colors">Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:border-primary text-textmain transition-colors bg-gray-50 focus:bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary text-white p-3 rounded-lg hover:opacity-90 transition-opacity font-semibold mt-2 shadow-sm"
              >
                Se connecter
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-textsecondary">
              Pas encore de compte ?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-textsecondary py-6">
        Développé avec ❤️ pour la communauté. {new Date().getFullYear()} par TheClumsyRaccoon.
      </footer>
    </div>
  );
}
