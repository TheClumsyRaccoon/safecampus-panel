"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase"; 

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError("");
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Cette adresse e-mail est déjà utilisée.");
      } else if (err.code === 'auth/weak-password') {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
      } else {
        setError("Échec de l'inscription. Veuillez réessayer.");
      }
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4">
      <main className="flex w-full flex-1 flex-col items-center justify-center">
        <h1 className="text-primary text-5xl font-bold pb-6"> SafeCampus</h1>
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-3xl font-bold mb-2 text-center text-textmain">Créer un compte</h2>
            <p className="text-center text-textsecondary mb-8 text-sm">Rejoignez la communauté des auteurs SafeCampus</p>
            
            {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">{error}</p>}

            <form onSubmit={handleSignup} className="flex flex-col gap-5">
              <div className="group">
                <label className="block text-sm font-medium text-textsecondary mb-1 group-focus-within:text-primary transition-colors">Email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
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

              <div className="group">
                <label className="block text-sm font-medium text-textsecondary mb-1 group-focus-within:text-primary transition-colors">Confirmer le mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:border-primary text-textmain transition-colors bg-gray-50 focus:bg-white"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary text-white p-3 rounded-lg hover:opacity-90 transition-opacity font-semibold mt-2 shadow-sm"
              >
                S'inscrire
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-textsecondary">
              Déjà un compte ?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Se connecter
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
