import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SensorHistory } from "./components/sensor-history"
import { 
  ArrowDown, 
  ArrowUp, 
  Droplets, 
  Leaf, 
  Thermometer, 
  Wind
} from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d&apos;ensemble des indicateurs environnementaux
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full px-4">
            Dernière mise à jour: Il y a 5 minutes
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-3 h-auto p-1">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="air">Qualité de l&apos;air</TabsTrigger>
          <TabsTrigger value="water">Ressources en eau</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Température
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">24.5°C</div>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">+2.1°C</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Moyenne sur les dernières 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Qualité de l&apos;air
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">Bon</div>
                  <div className="flex items-center text-green-600">
                    <Badge className="bg-green-600">AQI 42</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Indice de qualité de l&apos;air
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Humidité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">63%</div>
                  <div className="flex items-center text-red-600">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    <span className="text-sm">-5%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Relative à la moyenne saisonnière
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Niveau d&apos;eau
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">85%</div>
                  <div className="flex items-center text-amber-600">
                    <Badge className="bg-amber-600">Stable</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Capacité des réservoirs
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Température (2h)</CardTitle>
            </CardHeader>
            <CardContent>
              <SensorHistory sensorId="sensor-1" type="temperature" />
            </CardContent>
          </Card>

          {/* Environmental Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  <CardTitle>Température</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Graphique de température</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <CardTitle>Précipitations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Graphique de précipitations</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="air" className="space-y-6">
          {/* Air Quality Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Qualité de l&apos;air
              </CardTitle>
              <CardDescription>
                Analyse détaillée des paramètres de qualité de l&apos;air
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Graphique détaillé de qualité de l&apos;air</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="water" className="space-y-6">
          {/* Water Resources Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-blue-600" />
                Ressources en eau
              </CardTitle>
              <CardDescription>
                Suivi des ressources hydriques et de leur qualité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Graphique des ressources en eau</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 