import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  ClipboardList, 
  CloudLightning, 
  Droplets, 
  Leaf, 
  MapPin, 
  Trees, 
  Upload
} from "lucide-react"
import Link from "next/link"

export default function ApplicationPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Application EcoWatch</h1>
        <p className="text-muted-foreground max-w-3xl">
          Utilisez les fonctionnalités complètes de notre plateforme pour surveiller, 
          analyser et gérer les données environnementales.
        </p>
      </div>

      <Tabs defaultValue="modules" className="space-y-8">
        <TabsList className="grid w-full md:w-auto grid-cols-3 h-auto p-1">
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="data">Données</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Air Quality Module */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle>Qualité de l&apos;air</CardTitle>
                </div>
                <CardDescription>
                  Surveillance et analyse de la qualité de l&apos;air
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Suivez la concentration de polluants atmosphériques, identifiez les 
                  sources et analysez les tendances à long terme.
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-medium">Dernière mise à jour: Il y a 15 min</span>
                  <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">
                    Actif
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/application/air-quality">
                    Ouvrir le module
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Water Resources Module */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle>Ressources en eau</CardTitle>
                </div>
                <CardDescription>
                  Surveillance des ressources hydriques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Contrôlez les niveaux d&apos;eau, la qualité et prévoyez les risques 
                  potentiels liés aux ressources en eau de votre région.
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-medium">Dernière mise à jour: Il y a 35 min</span>
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-medium">
                    Actif
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/application/water-resources">
                    Ouvrir le module
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Weather Module */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                    <CloudLightning className="h-5 w-5 text-yellow-600" />
                  </div>
                  <CardTitle>Prévisions météo</CardTitle>
                </div>
                <CardDescription>
                  Prévisions et analyse météorologique
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Accédez à des prévisions précises et adaptez vos activités aux conditions 
                  météorologiques prévues pour une meilleure planification.
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-medium">Dernière mise à jour: Il y a 2h</span>
                  <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs px-2 py-1 rounded-full font-medium">
                    Actif
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/application/weather">
                    Ouvrir le module
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Biodiversity Module */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <Trees className="h-5 w-5 text-emerald-600" />
                  </div>
                  <CardTitle>Biodiversité</CardTitle>
                </div>
                <CardDescription>
                  Surveillance et protection de la biodiversité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Suivez les espèces locales, leur habitat et contribuez à la 
                  protection de la biodiversité de votre écosystème.
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-medium">Dernière mise à jour: Hier</span>
                  <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded-full font-medium">
                    En attente
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/application/biodiversity">
                    Configurer
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Map Visualization */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle>Cartographie</CardTitle>
                </div>
                <CardDescription>
                  Visualisation cartographique des données
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visualisez vos données sur des cartes interactives pour mieux comprendre
                  leur dimension spatiale et identifier les zones critiques.
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-medium">Dernière mise à jour: Il y a 3h</span>
                  <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 text-xs px-2 py-1 rounded-full font-medium">
                    Actif
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/application/map">
                    Ouvrir le module
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Importation et gestion des données</CardTitle>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Importer
                </Button>
              </div>
              <CardDescription>
                Importez, exportez et gérez vos données environnementales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Interface de gestion des données</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Configuration des alertes</CardTitle>
                <Button size="sm">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Nouvelle alerte
                </Button>
              </div>
              <CardDescription>
                Configurez des alertes pour être notifié des changements importants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Système de configuration d&apos;alertes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Calendar Section */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Calendrier des événements</h2>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Planifier
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Événements à venir</CardTitle>
            <CardDescription>
              Consultez et planifiez vos prochaines activités environnementales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Calendrier des événements environnementaux</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
} 