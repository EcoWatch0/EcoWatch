"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Simuler une requête API (à implémenter réellement)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Succès simulé
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Mot de passe oublié</CardTitle>
        <CardDescription className="text-center">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {success ? (
          <div className="space-y-4">
            <Alert className="border-green-500 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Si un compte existe avec cette adresse email, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
              </AlertDescription>
            </Alert>
            <div className="text-center mt-4">
              <Link href="/login" className="text-primary hover:underline">
                Retour à la page de connexion
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Envoi en cours..." : "Envoyer les instructions"}
            </Button>
          </form>
        )}
      </CardContent>
      
      {!success && (
        <CardFooter>
          <div className="text-sm text-center text-muted-foreground w-full">
            <Link href="/login" className="text-primary hover:underline">
              Retour à la page de connexion
            </Link>
          </div>
        </CardFooter>
      )}
    </>
  )
} 