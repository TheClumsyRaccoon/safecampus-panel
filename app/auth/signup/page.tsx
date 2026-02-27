"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import AuthLayout from "@/app/components/AuthLayout";
import Input from "@/app/components/Input";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Cette adresse e-mail est déjà utilisée.");
      } else if (err.code === 'auth/weak-password') {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
      } else {
        setError("Une erreur est survenue lors de l'inscription.");
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Inscription"
      subtitle="Créez votre compte auteur SafeCampus"
      error={error}
    >
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
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
          minLength={6}
        />
        <Input
          id="confirmPassword"
          label="Confirmer le mot de passe"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="••••••••"
          minLength={6}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white p-3 rounded-lg hover:opacity-90 transition-opacity font-semibold mt-2 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Inscription..." : "S'inscrire"}
        </button>

        <p className="text-center text-sm text-textsecondary mt-4">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}