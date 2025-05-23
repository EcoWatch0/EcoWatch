import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  CircleUser,
  FileBarChart,
  LineChart,
  RefreshCcw,
  ShieldAlert,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Admin</h2>
          <p className="text-muted-foreground">
            Vue d&apos;ensemble des performances et de l&apos;état du système
          </p>
        </div>
        <Button size="sm" className="w-full md:w-auto">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Actualiser les données
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,853</div>
            <p className="text-xs text-muted-foreground">
              +19% depuis le mois dernier
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capteurs connectés</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">153</div>
            <p className="text-xs text-muted-foreground">
              +4 au cours des dernières 24 heures
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes actives</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              -3 depuis la semaine dernière
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibilité du système</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">
              +0.2% depuis le mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Activité des utilisateurs</CardTitle>
                <CardDescription>
                  Statistiques d&apos;utilisation au cours des 30 derniers jours
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                  <LineChart className="h-8 w-8 text-muted-foreground/70" />
                  <span className="ml-2 text-muted-foreground">Graphique d&apos;activité</span>
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Statut des services</CardTitle>
                <CardDescription>
                  État des composants du système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">API principale</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Opérationnel</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Système de collecte de données</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Opérationnel</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Système d&apos;alerte</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Opérationnel</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Base de données</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Performance réduite</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Interface d&apos;administration</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Opérationnel</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                Journal de sécurité
              </CardTitle>
              <CardDescription>
                Évènements de sécurité récents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Tentative d&apos;accès non autorisé</div>
                    <div className="text-xs text-muted-foreground">Aujourd&apos;hui, 10:42</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tentative de connexion échouée depuis 192.168.1.5 après plusieurs essais
                  </p>
                </div>
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Mise à jour de sécurité installée</div>
                    <div className="text-xs text-muted-foreground">Hier, 18:30</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Mise à jour de sécurité v2.3.5 appliquée automatiquement sur tous les serveurs
                  </p>
                </div>
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Changement des permissions</div>
                    <div className="text-xs text-muted-foreground">2023-04-28, 14:15</div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    L&apos;administrateur a modifié les permissions du groupe &quot;Gestionnaires&quot;
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5" />
                Tendances d&apos;utilisation
              </CardTitle>
              <CardDescription>
                Analyse des tendances d&apos;utilisation des fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                <LineChart className="h-8 w-8 text-muted-foreground/70" />
                <span className="ml-2 text-muted-foreground">Graphique des tendances</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Activités récentes</CardTitle>
          <CardDescription>Dernières actions des utilisateurs et du système</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 rounded-full bg-green-100 p-1 dark:bg-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Nouvel utilisateur enregistré</p>
                <p className="text-sm text-muted-foreground">
                  Marie Dubois a créé un nouveau compte
                </p>
                <p className="text-xs text-muted-foreground">Il y a 10 minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-0.5 rounded-full bg-blue-100 p-1 dark:bg-blue-800">
                <CircleUser className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Mise à jour du profil administrateur</p>
                <p className="text-sm text-muted-foreground">
                  Jean Martin a modifié les paramètres du compte admin
                </p>
                <p className="text-xs text-muted-foreground">Il y a 45 minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-0.5 rounded-full bg-amber-100 p-1 dark:bg-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Alerte déclenchée</p>
                <p className="text-sm text-muted-foreground">
                  Alerte de qualité d&apos;air critique dans la zone Nord
                </p>
                <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-0.5 rounded-full bg-purple-100 p-1 dark:bg-purple-800">
                <ArrowUpRight className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Mise à jour du système</p>
                <p className="text-sm text-muted-foreground">
                  Mise à jour v2.5 déployée avec succès sur tous les serveurs
                </p>
                <p className="text-xs text-muted-foreground">Hier, 23:30</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 