import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Leaf, BarChart3, ShieldCheck, CloudLightning, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="w-full py-4 px-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="font-bold text-xl">EcoWatch</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">Se connecter</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">S&apos;inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Surveillance environnementale en temps réel
              </h1>
              <p className="text-xl text-muted-foreground">
                EcoWatch vous permet de surveiller, analyser et protéger votre environnement grâce à des capteurs intelligents et une plateforme de données avancée.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Voir la démo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="w-full h-[400px] bg-muted rounded-lg shadow-lg overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <span className="text-lg font-medium">Visualisation des données EcoWatch</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Fonctionnalités principales</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Notre plateforme offre des outils puissants pour la surveillance et l&apos;analyse environnementale.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Capteurs intelligents</h3>
                <p className="text-muted-foreground">
                  Réseau de capteurs connectés pour mesurer la qualité de l&apos;air, l&apos;eau et d&apos;autres paramètres environnementaux.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Analyse en temps réel</h3>
                <p className="text-muted-foreground">
                  Tableaux de bord dynamiques et rapports détaillés pour visualiser et comprendre vos données.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Système d&apos;alerte</h3>
                <p className="text-muted-foreground">
                  Notifications instantanées en cas d&apos;anomalies ou de dépassements des seuils critiques.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <CloudLightning className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">IA prédictive</h3>
                <p className="text-muted-foreground">
                  Algorithmes d&apos;intelligence artificielle pour prédire les tendances et anticiper les événements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à surveiller votre environnement ?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Rejoignez des milliers d&apos;utilisateurs qui font confiance à EcoWatch pour leurs besoins de surveillance environnementale.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" variant="secondary">
                  Créer un compte
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/20">
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="md:w-1/3">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-6 w-6 text-green-600" />
                <span className="font-bold text-xl">EcoWatch</span>
              </div>
              <p className="text-muted-foreground">
                Solution complète pour la surveillance et l&apos;analyse environnementale en temps réel.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Produit</h3>
                <ul className="space-y-2">
                  <li><Link href="/features" className="text-muted-foreground hover:text-foreground">Fonctionnalités</Link></li>
                  <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground">Tarifs</Link></li>
                  <li><Link href="/testimonials" className="text-muted-foreground hover:text-foreground">Témoignages</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Ressources</h3>
                <ul className="space-y-2">
                  <li><Link href="/docs" className="text-muted-foreground hover:text-foreground">Documentation</Link></li>
                  <li><Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
                  <li><Link href="/support" className="text-muted-foreground hover:text-foreground">Support</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Entreprise</h3>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-muted-foreground hover:text-foreground">À propos</Link></li>
                  <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                  <li><Link href="/careers" className="text-muted-foreground hover:text-foreground">Carrières</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} EcoWatch. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Politique de confidentialité
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Conditions d&apos;utilisation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
