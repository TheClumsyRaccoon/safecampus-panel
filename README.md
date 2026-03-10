# SafeCampus Panel

Panel auteur pour la gestion et la publication d'articles vers l'application mobile SafeCampus.

---

## Rôles utilisateurs

| Rôle | Accès |
|---|---|
| `pending` | Aucun accès au dashboard ; en attente de validation |
| `author` | Création, édition et suppression de ses propres articles |
| `admin` | Tous les droits auteur + gestion des utilisateurs |

---

## Architecture

```
├── app/
│   ├── auth/                        # Authentification
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/
│   │   ├── admin/                   # Vue admin
│   │   ├── create/                  # Page de création
│   │   ├── edit/[id]/               # Page d'édition de l'article [id]
│   │   └── preview/[id]/            # Page de prévisualisation de l'article [id]
│   ├── layout.tsx
│   ├── page.tsx                     # Page d'accueil
│   └── types.ts
├── components/
│   ├── AuthLayout.tsx
│   ├── Input.tsx
│   └── editor.module.css            # Styles CSS pour EditorJS
└── lib/
    └── firebase.ts                  # Init Firebase
```

---

## Installation

```bash
git clone https://github.com/TheClumsyRaccoon/safecampus-panel
cd safecampus-panel
npm install
```

Créer un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

Lancer le serveur de développement :

```bash
npm run dev
```

---

Développée par TheClumsyRaccoon.
