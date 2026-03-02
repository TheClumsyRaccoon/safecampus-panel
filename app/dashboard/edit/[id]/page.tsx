"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';
import styles from '../../../components/editor.module.css';
import { Article } from "@/app/types";

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: articleId } = use(params);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState<OutputData | null>(null);
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
    const fetchArticle = async () => {
      try {
        const articleRef = doc(db, "articles", articleId);
        const articleSnap = await getDoc(articleRef);

        if (!articleSnap.exists()) {
          alert("Article non trouvé.");
          router.push("/dashboard");
          return;
        }

        const articleData = articleSnap.data() as Article;
        setTitle(articleData.title);
        setSubtitle(articleData.subtitle || "");
        setImageUrl(articleData.imageUrl || "");

        let content = { blocks: [] };
        if (articleData.content && typeof articleData.content === 'string') {
          try {
            content = JSON.parse(articleData.content);
          } catch (e) {
            console.error("Erreur parsing du contenu JSON:", e);
          }
        }
        setInitialData(content);
      } catch (error) {
        console.error("Erreur de chargement de l'article:", error);
        alert("Impossible de charger l'article.");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, router]);

  useEffect(() => {
    if (loading || !initialData) return;

    const initEditor = async () => {
      const EditorJS = (await import('@editorjs/editorjs')).default;
      const Header = (await import('@editorjs/header')).default;
      const List = (await import('@editorjs/list')).default;

      if (!editorRef.current) {
        const editor = new EditorJS({
          holder: 'editorjs',
          placeholder: 'Commencez à rédiger votre contenu ici...',
          tools: {
            header: { class: Header as any, config: { placeholder: 'Titre de section', levels: [2, 3, 4], defaultLevel: 2 } },
            list: { class: List as any, inlineToolbar: true },
          },
          data: initialData,
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
  }, [loading, initialData]);

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!title) {
      alert("Le titre est obligatoire.");
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user || !editorRef.current) {
        alert("Erreur: utilisateur non connecté ou éditeur non prêt.");
        return;
      }

      const outputData = await editorRef.current.save();
      
      if (outputData.blocks.length === 0) {
        alert("Le contenu ne peut pas être vide.");
        return;
      }

      const contentString = JSON.stringify(outputData);
      const articleRef = doc(db, "articles", articleId);

      await updateDoc(articleRef, {
        title,
        subtitle,
        content: contentString,
        imageUrl,
        status,
        updatedAt: serverTimestamp(),
      });

      router.refresh();
      router.push("/dashboard");
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      if (error instanceof Error) {
        alert(`Erreur: ${error.message}`);
      } else {
        alert("Une erreur est survenue lors de la mise à jour.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Chargement de l'article...</div>;
  }

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
          <span className="text-sm text-textsecondary hidden md:block">Modification de l'article</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-textsecondary hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
          >
            {saving ? "Sauvegarde..." : "Sauvegarder brouillon"}
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={saving}
            className="px-5 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </nav>

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
