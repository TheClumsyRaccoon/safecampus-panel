"use client";

import { useEffect, useState, use, type ElementType } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { Article } from "@/app/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";

interface EditorBlock {
  id: string;
  type: string;
  data: Record<string, any>;
}

export default function PreviewArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: articleId } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
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
        const docRef = doc(db, "articles", articleId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setArticle(docSnap.data() as Article);
        } else {
          alert("Article introuvable");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!article) return null;

  const renderContent = (contentJson: string) => {
    try {
      const data = JSON.parse(contentJson);
      return data.blocks.map((block: EditorBlock) => {
        switch (block.type) {
          case "header": {
            const Tag = `h${block.data.level}` as ElementType;
            return <Tag key={block.id} className="font-bold my-4 text-textprimary" style={{ fontSize: block.data.level === 2 ? '1.5em' : '1.25em' }}>{block.data.text}</Tag>;
          }
          case "paragraph":
            return <p key={block.id} className="mb-4 text-lg leading-relaxed text-textprimary/90" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.data.text) }} />;
          case "list": {
            const ListTag = block.data.style === "ordered" ? "ol" : "ul";
            const listStyle = block.data.style === "ordered" ? "list-decimal" : "list-disc";
            return (
              <ListTag key={block.id} className={`list-inside mb-4 ml-4 ${listStyle}`}>
                {block.data.items.map((item: string, i: number) => (
                  <li key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item) }} />
                ))}
              </ListTag>
            );
          }
          default:
            return null;
        }
      });
    } catch (e) {
      return <p className="text-red-500">Erreur de rendu du contenu.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard" className="text-sm font-medium text-textsecondary hover:text-textprimary transition-colors">
          ← Retour au Dashboard
        </Link>
        <div className="flex gap-3">
           <Link 
            href={`/dashboard/edit/${articleId}`}
            className="px-4 py-2 text-sm font-medium text-textprimary bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
          Modifier
          </Link>
          <span className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${
            article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {article.status === 'published' ? 'Publié' : 'Brouillon'}
          </span>
        </div>
      </nav>

      {/* Contenu de l'article*/}
      <main className="max-w-2xl mx-auto px-6 py-12">
        {article.imageUrl && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-sm aspect-video relative bg-gray-100">
            <img src={article.imageUrl} alt={article.title} className="object-cover w-full h-full" />
          </div>
        )}
        
        <h1 className="text-4xl md:text-5xl font-bold text-textprimary mb-4 leading-tight">
          {article.title}
        </h1>
        
        {article.subtitle && (
          <p className="text-xl text-textsecondary mb-8 font-medium leading-relaxed">
            {article.subtitle}
          </p>
        )}

        <div className="prose prose-lg max-w-none">
          {renderContent(article.content)}
        </div>
      </main>
    </div>
  );
}
