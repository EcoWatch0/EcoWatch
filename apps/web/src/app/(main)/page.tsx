import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, BarChart, CloudLightning, Droplets } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="container mx-auto py-12 px-4 space-y-16">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-6 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Monitoring environnemental <span className="text-green-600">intelligent</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            EcoWatch vous aide à surveiller et analyser les données environnementales en temps réel, 
            pour des décisions plus éclairées et un impact positif sur notre planète.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">Accéder au tableau de bord</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/application">Explorer l&apos;application</Link>
            </Button>
          </div>
        </div>
        <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-green-100 to-green-200 dark:from-green-950 dark:to-green-900 rounded-full flex items-center justify-center">
          <Leaf className="h-32 w-32 text-green-600" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Fonctionnalités principales</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Notre plateforme offre des outils puissants pour surveiller, analyser et réagir aux données environnementales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Tableau de bord analytique</CardTitle>
              <CardDescription>
                Visualisez les tendances et les anomalies avec des graphiques interactifs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Notre tableau de bord intuitif vous permet de suivre les paramètres environnementaux clés 
                et d&apos;identifier rapidement les tendances importantes.
              </p>
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="ghost" size="sm" className="text-green-600" asChild>
                <Link href="/dashboard">En savoir plus</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Surveillance des ressources en eau</CardTitle>
              <CardDescription>
                Suivez la qualité et la quantité des ressources hydriques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Nos outils de surveillance permettent un suivi précis des paramètres liés à l&apos;eau 
                et vous alertent en cas d&apos;anomalies ou de dépassement des seuils critiques.
              </p>
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="ghost" size="sm" className="text-blue-600" asChild>
                <Link href="/application/water">En savoir plus</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-4">
                <CloudLightning className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle>Prévisions météorologiques</CardTitle>
              <CardDescription>
                Anticipez les conditions climatiques et leurs impacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Accédez à des prévisions précises et adaptez vos activités aux conditions 
                météorologiques prévues pour optimiser vos opérations.
              </p>
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="ghost" size="sm" className="text-yellow-600" asChild>
                <Link href="/application/weather">En savoir plus</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-6 rounded-xl bg-muted">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Prêt à transformer votre approche environnementale?</h2>
          <p className="text-lg text-muted-foreground">
            Commencez dès aujourd&apos;hui à collecter et analyser vos données environnementales.
          </p>
          <Button size="lg" asChild>
            <Link href="/dashboard">Commencer maintenant</Link>
          </Button>
        </div>
      </section>
    </div>
  )
} 