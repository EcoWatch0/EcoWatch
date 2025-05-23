import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BellRing, 
  Database, 
  FileKey, 
  Save, 
  Server, 
  Shield, 
  Sliders, 
  Zap
} from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">
          Gérez les paramètres et configurations du système
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="w-full grid md:w-auto md:inline-flex grid-cols-4 md:grid-cols-none h-auto gap-1 p-1">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5" />
                Paramètres généraux
              </CardTitle>
              <CardDescription>
                Configurez les paramètres généraux de l&apos;application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="app-name">Nom de l&apos;application</Label>
                <Input id="app-name" defaultValue="EcoWatch" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" defaultValue="Système de surveillance environnementale" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email de contact</Label>
                <Input id="contact-email" type="email" defaultValue="contact@ecowatch.org" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuseau horaire par défaut</Label>
                <Input id="timezone" defaultValue="Europe/Paris" />
              </div>
              <Separator />
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode">Mode maintenance</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer le mode maintenance sur le système
                  </p>
                </div>
                <Switch id="maintenance-mode" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Performances
              </CardTitle>
              <CardDescription>
                Configuration des performances du système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="caching">Mise en cache</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer la mise en cache des données pour de meilleures performances
                  </p>
                </div>
                <Switch id="caching" defaultChecked />
              </div>
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="data-compression">Compression des données</Label>
                  <p className="text-sm text-muted-foreground">
                    Compresser les données pour réduire l&apos;utilisation de la bande passante
                  </p>
                </div>
                <Switch id="data-compression" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cache-ttl">Durée de vie du cache (secondes)</Label>
                <Input id="cache-ttl" type="number" defaultValue="3600" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité
              </CardTitle>
              <CardDescription>
                Paramètres de sécurité et d&apos;authentification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Authentification à deux facteurs</Label>
                  <p className="text-sm text-muted-foreground">
                    Exiger une authentification à deux facteurs pour tous les utilisateurs
                  </p>
                </div>
                <Switch id="two-factor" defaultChecked />
              </div>
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="session-timeout">Expiration de session</Label>
                  <p className="text-sm text-muted-foreground">
                    Déconnecter automatiquement les utilisateurs après une période d&apos;inactivité
                  </p>
                </div>
                <Switch id="session-timeout" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout-duration">Durée d&apos;inactivité (minutes)</Label>
                <Input id="timeout-duration" type="number" defaultValue="30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-policy">Politique de mot de passe</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="min-length" defaultChecked />
                    <Label htmlFor="min-length">Minimum 8 caractères</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="require-special" defaultChecked />
                    <Label htmlFor="require-special">Caractères spéciaux requis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="require-uppercase" defaultChecked />
                    <Label htmlFor="require-uppercase">Majuscules requises</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileKey className="h-5 w-5" />
                Certificats et clés
              </CardTitle>
              <CardDescription>
                Gestion des certificats SSL et des clés d&apos;API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Certificat SSL</Label>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">ecowatch.org</p>
                      <p className="text-sm text-muted-foreground">Expire le: 14/12/2025</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Renouveler
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rotation des clés d&apos;API</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-rotate" defaultChecked />
                    <Label htmlFor="auto-rotate">Rotation automatique des clés</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rotation-interval">Intervalle de rotation (jours)</Label>
                  <Input id="rotation-interval" type="number" defaultValue="90" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Configuration API
              </CardTitle>
              <CardDescription>
                Paramètres de l&apos;API et des intégrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-url">URL de l&apos;API</Label>
                <Input id="api-url" defaultValue="https://api.ecowatch.org/v1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-limit">Limite de taux (requêtes/minute)</Label>
                <Input id="rate-limit" type="number" defaultValue="100" />
              </div>
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="throttling">Limitation de débit</Label>
                  <p className="text-sm text-muted-foreground">
                    Limiter le taux de requêtes pour prévenir les abus
                  </p>
                </div>
                <Switch id="throttling" defaultChecked />
              </div>
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cors">CORS (Cross-Origin Resource Sharing)</Label>
                  <p className="text-sm text-muted-foreground">
                    Autoriser les requêtes cross-origin
                  </p>
                </div>
                <Switch id="cors" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Base de données
              </CardTitle>
              <CardDescription>
                Paramètres de connexion à la base de données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="db-host">Hôte</Label>
                <Input id="db-host" defaultValue="db.ecowatch.internal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-port">Port</Label>
                <Input id="db-port" type="number" defaultValue="5432" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-name">Nom de la base de données</Label>
                <Input id="db-name" defaultValue="ecowatch_production" />
              </div>
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="db-ssl">Connexion SSL</Label>
                  <p className="text-sm text-muted-foreground">
                    Utiliser SSL pour les connexions à la base de données
                  </p>
                </div>
                <Switch id="db-ssl" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configuration des notifications système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyer des notifications par email
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">Notifications par SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyer des notifications par SMS
                  </p>
                </div>
                <Switch id="sms-notifications" />
              </div>
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Notifications push</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyer des notifications push aux appareils mobiles
                  </p>
                </div>
                <Switch id="push-notifications" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-server">Serveur SMTP</Label>
                <Input id="smtp-server" defaultValue="smtp.ecowatch.org" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">Port SMTP</Label>
                <Input id="smtp-port" type="number" defaultValue="587" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from-email">Email expéditeur</Label>
                <Input id="from-email" type="email" defaultValue="notifications@ecowatch.org" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 