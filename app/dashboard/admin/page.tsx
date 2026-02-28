"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc, getDoc, deleteDoc, DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { UserProfile } from "@/app/types";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

const getSafeUserProfile = (doc: QueryDocumentSnapshot<DocumentData>): UserProfile => {
  const data = doc.data();
  return {
    uid: typeof data.uid === 'string' ? data.uid : doc.id,
    email: typeof data.email === 'string' ? data.email : null,
    role: (['author', 'admin', 'pending'].includes(data.role) ? data.role : 'pending') as UserProfile['role'],
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
  };
};

export default function AdminUsersPage() {
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [authors, setAuthors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        
        if (userData?.role !== "admin") {
          setError("Accès refusé. Réservé aux admin.");
          setLoading(false);
          return;
        }

        await fetchUsers();
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la vérification des droits.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const pendingQuery = query(collection(db, "users"), where("role", "==", "pending"));
      const pendingSnapshot = await getDocs(pendingQuery);
      setPendingUsers(pendingSnapshot.docs.map(getSafeUserProfile));

      const authorsQuery = query(collection(db, "users"), where("role", "==", "author"));
      const authorsSnapshot = await getDocs(authorsQuery);
      setAuthors(authorsSnapshot.docs.map(getSafeUserProfile));
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
    }
  };

  const updateUserRole = async (uid: string, newRole: 'author' | 'pending') => {
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole });
      await fetchUsers();
    } catch (err) {
      console.error("Erreur mise à jour rôle:", err);
      alert("Erreur lors de la mise à jour du rôle.");
    }
  };

  const deleteUser = async (uid: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette candidature ? L'utilisateur ne pourra plus se connecter.")) return;
    try {
      await deleteDoc(doc(db, "users", uid));
      await fetchUsers();
    } catch (err) {
      console.error("Erreur suppression utilisateur:", err);
      alert("Erreur lors de la suppression.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-textsecondary">Chargement...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-background text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-background p-8 pt-20 font-sans">
      <div className="max-w-6xl mx-auto relative">
        <div className="absolute top-0 right-full mr-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-textprimary hover:border-primary hover:text-primary transition-all shadow-sm whitespace-nowrap"
          >
            ← Retour au Dashboard
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-textprimary tracking-tight">Administration</h1>
          <p className="text-textsecondary mt-2 text-lg">Gérez les accès et les rôles des membres</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-bold text-textsecondary uppercase tracking-wider">En attente</p>
                <p className="text-3xl font-bold text-textsecondary mt-2">{pendingUsers.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-bold text-textsecondary uppercase tracking-wider">Auteurs</p>
                <p className="text-3xl font-bold text-primary mt-2">{authors.length}</p>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-bold text-textsecondary uppercase tracking-wider">Total Membres</p>
                <p className="text-3xl font-bold text-primary mt-2">{pendingUsers.length + authors.length}</p>
            </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-textprimary flex items-center gap-3">
              Candidatures en attente
              {pendingUsers.length > 0 && (
                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200">
                    {pendingUsers.length}
                </span>
              )}
            </h2>
          </div>
          
          {pendingUsers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <p className="text-textsecondary text-lg">Aucune candidature en attente pour le moment.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingUsers.map((user) => (
                <div key={user.uid} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:shadow-md">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 font-bold text-xl border border-yellow-100">
                      {(user.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-textprimary">{user.email}</p>
                      <p className="text-sm text-textsecondary font-mono mt-1">ID: {user.uid}</p>
                      <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                        En attente de validation
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button
                      onClick={() => updateUserRole(user.uid, 'author')}
                      className="flex-1 md:flex-none bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => deleteUser(user.uid)}
                      className="flex-1 md:flex-none bg-white text-red-600 border border-red-200 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-textprimary mb-6">Auteurs validés</h2>

          {authors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <p className="text-textsecondary text-lg">Aucun auteur validé.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 font-semibold text-textsecondary text-sm uppercase tracking-wider">Utilisateur</th>
                      <th className="px-8 py-5 font-semibold text-textsecondary text-sm uppercase tracking-wider">Rôle</th>
                      <th className="px-8 py-5 font-semibold text-textsecondary text-sm uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {authors.map((user) => (
                      <tr key={user.uid} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {(user.email || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-textprimary">{user.email}</p>
                              <p className="text-xs text-textsecondary font-mono mt-0.5">{user.uid.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Auteur
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => updateUserRole(user.uid, 'pending')}
                            className="text-red-600 hover:text-red-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                          >
                            Révoquer les droits
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
