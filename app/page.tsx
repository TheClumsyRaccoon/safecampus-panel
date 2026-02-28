import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto p-8">
        <div className="z-10 w-full items-center justify-between font-mono text-sm lg:flex">
          <span className="fixed left-0 top-0 flex w-full justify-center pb-6 pt-8 bg-primary text-white lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-primary lg:p-4">
            Panel SafeCampus v0.1
          </span>
        </div>

        <div className="text-center max-w-2xl mx-auto my-16">
        <h1 className="text-4xl font-bold tracking-tight text-textmain sm:text-6xl">
          Gestion des Articles
        </h1>
        <p className="mt-6 text-lg leading-8">
          Bienvenue sur le panel auteur. Créez et publiez du contenu directement vers l'application SafeCampus.
        </p>
        
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link 
            href="/auth/login" 
            className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            Accéder à l'espace auteur <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-center md:text-left">
        <FeatureCard 
          title="Temps Réel" 
          desc="Les articles publiés apparaissent instantanément sur l'application mobile."
        />
        <FeatureCard 
          title="Sécurisé" 
          desc="Accès réservé aux auteurs authentifiés via leur compte auteur SafeCampus."
        />
        <FeatureCard 
          title="Multi-plateforme" 
          desc="Gérez votre contenu depuis n'importe quel navigateur web."
        />
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-textsecondary">
        Développé avec ❤️ pour la communauté. {new Date().getFullYear()} par TheClumsyRaccoon.
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  desc: string;
}

function FeatureCard({ title, desc }: FeatureCardProps) {
  return (
    <div className="group rounded-lg px-5 py-4 transition-colors duration-500 hover:bg-primary hover:text-white border border-transparent hover:shadow-sm">
      <h2 className="mb-3 text-2xl font-semibold">
        {title}
      </h2>
      <p className="m-0 text-sm opacity-70 group-hover:opacity-100">
        {desc}
      </p>
    </div>
  );
}