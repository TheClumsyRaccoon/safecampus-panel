"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import AuthLayout from "@/app/components/AuthLayout";
import Input from "@/app/components/Input";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError("Email ou mot de passe incorrect.");
      } else {
        setError("Une erreur est survenue lors de la connexion.");
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Connexion"
      subtitle="Accédez à votre espace auteur"
      error={error}
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <Input
          id="email"
          label="Adresse e-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="admin@safecampus.com"
        />
        <Input
          id="password"
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white p-3 rounded-lg hover:opacity-90 transition-opacity font-semibold mt-2 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </button>
        
        <p className="text-center text-sm text-textsecondary mt-4">
          Pas encore de compte ?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            S'inscrire
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}