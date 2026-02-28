"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, getDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserProfile, Article } from "@/app/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }
      setUser(currentUser);

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
        }
        const q = query(
          collection(db, "articles"),
          where("authorId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const articlesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Article[];
        
        setArticles(articlesData);
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
        if (err instanceof FirebaseError) {
          if (err.code === 'permission-denied') {
            setError("Accès refusé. Vérifiez vos règles de sécurité Firestore.");
          } else if (err.code === 'failed-precondition') {
            setError("Index manquant. Vérifiez la console du navigateur et cliquez sur le lien généré par Firebase pour le créer.");
          } else {
            setError("Une erreur est survenue lors du chargement des données.");
          }
        } else {
          setError("Une erreur est survenue lors du chargement des données.");
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleDelete = async (articleId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;
    
    try {
      await deleteDoc(doc(db, "articles", articleId));
      setArticles(prev => prev.filter(a => a.id !== articleId));
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-textsecondary">Chargement...</div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
        <h2 className="text-xl font-bold text-red-600 mb-2">Erreur d'accès</h2>
        <p className="text-textsecondary mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-all">Réessayer</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-8 pt-20 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-textprimary tracking-tight">Tableau de bord</h1>
            <p className="text-textsecondary mt-2 text-lg">
              Bienvenue, <span className="font-semibold text-primary">{user?.email}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {userProfile?.role === 'admin' && (
              <Link 
                href="/dashboard/admin"
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-textprimary hover:border-primary hover:text-primary transition-all shadow-sm"
              >
                Administration
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm cursor-pointer"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-textprimary">Mes Articles</h2>
          <Link 
            href="/dashboard/create" 
            className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
          >
            <span className="text-lg">+</span> Nouvel article
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
            <h3 className="text-xl font-semibold text-textprimary mb-2">Aucun article pour le moment</h3>
            <p className="text-textsecondary mb-8 max-w-md mx-auto">Commencez à rédiger votre premier article pour l'application SafeCampus.</p>
            <Link 
              href="/dashboard/create" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              Créer un article
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {article.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                    <span className="text-xs text-textsecondary">
                      {article.createdAt?.seconds ? new Date(article.createdAt.seconds * 1000).toLocaleDateString() : 'Date inconnue'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-textprimary mb-2 line-clamp-2">{article.title}</h3>
                  {article.subtitle && (
                    <p className="text-textsecondary text-sm line-clamp-3 mb-4">{article.subtitle}</p>
                  )}
                </div>
                
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                  <button 
                    onClick={() => handleDelete(article.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
