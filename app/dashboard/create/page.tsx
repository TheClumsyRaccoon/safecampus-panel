"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";
import type EditorJS from '@editorjs/editorjs';
import styles from './editor.module.css';

export default function CreateArticlePage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<EditorJS | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        if (userData?.role !== 'author' && userData?.role !== 'admin') {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Erreur vérification rôle:", error);
        router.push("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const initEditor = async () => {
      const EditorJS = (await import('@editorjs/editorjs')).default;
      const Header = (await import('@editorjs/header')).default;
      const List = (await import('@editorjs/list')).default;

      if (!editorRef.current) {
        const editor = new EditorJS({
          holder: 'editorjs',
          placeholder: 'Commencez à rédiger votre contenu ici...',
          tools: {
            header: {
              class: Header as any,
              config: {
                placeholder: 'Titre de section',
                levels: [2, 3, 4],
                defaultLevel: 2
              }
            },
            list: {
              class: List as any,
              inlineToolbar: true,
            }
          },
        });
        editorRef.current = editor;
      }
    };

    initEditor();

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!title) {
      alert("Le titre est obligatoire.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Vous devez être connecté.");
        return;
      }

      if (!editorRef.current) {
        console.error("Editor is not initialized");
        alert("L'éditeur n'est pas prêt. Veuillez patienter un instant.");
        return;
      }

      const outputData = await editorRef.current.save();
      
      if (outputData.blocks.length === 0) {
        alert("Le contenu ne peut pas être vide.");
        return;
      }

      const contentString = JSON.stringify(outputData);

      await addDoc(collection(db, "articles"), {
        title,
        subtitle,
        content: contentString,
        imageUrl,
        status,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Erreur création:", error);
      if (error instanceof Error) {
        alert(`Erreur: ${error.message}`);
      } else {
        alert("Une erreur est survenue lors de la création.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="text-textsecondary hover:text-textprimary transition-colors flex items-center gap-2 text-sm font-medium"
          >
            ← <span className="hidden md:inline">Retour</span>
          </Link>
          <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
          <span className="text-sm text-textsecondary hidden md:block">Nouvel article</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-textsecondary hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
          >
            Brouillon
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={loading}
            className="px-5 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? "Publication..." : "Publier"}
          </button>
        </div>
      </nav>

      {/* Page d'ecriture */}
      <div className="max-w-7xl mx-auto mt-8 mb-20 px-4">
        <div className="bg-white min-h-[150vh] rounded-xl shadow-sm border border-gray-100 p-12 md:p-24">
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'article"
            className="w-full text-5xl font-bold text-textprimary placeholder:text-gray-300 border-none focus:ring-0 p-0 bg-transparent mb-6"
            required
          />

          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Ajouter un sous-titre..."
            className="w-full text-2xl text-textsecondary placeholder:text-gray-300 border-none focus:ring-0 p-0 bg-transparent mb-10"
          />

          <div className="mb-8 group">
             <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL de l'image de couverture..."
              className="w-full text-sm text-gray-400 focus:text-textprimary placeholder:text-gray-200 border-none focus:ring-0 p-0 bg-transparent transition-colors"
            />
          </div>

          <div id="editorjs" className={`prose prose-lg max-w-none min-h-[500px] ${styles.editor}`}></div>
        </div>
      </div>
    </div>
  );
}
