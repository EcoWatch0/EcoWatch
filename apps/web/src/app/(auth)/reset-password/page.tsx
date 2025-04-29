"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  // Vérifier si le token est présent
  if (!token) {
    return (
      <>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Lien invalide</CardTitle>
          <CardDescription className="text-center">
            Le lien de réinitialisation est invalide ou a expiré.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Veuillez demander un nouveau lien de réinitialisation.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <div className="text-center w-full">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Demander un nouveau lien
            </Link>
          </div>
        </CardFooter>
      </>
    )
  }
  
  const validatePassword = (): string | null => {
    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères"
    }
    
    if (!/[A-Z]/.test(password)) {
      return "Le mot de passe doit contenir au moins une majuscule"
    }
    
    if (!/[0-9]/.test(password)) {
      return "Le mot de passe doit contenir au moins un chiffre"
    }
    
    if (password !== confirmPassword) {
      return "Les mots de passe ne correspondent pas"
    }
    
    return null
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Valider le mot de passe
    const passwordError = validatePassword()
    if (passwordError) {
      setError(passwordError)
      return
    }
    
    setIsLoading(true)
    setError("")
    
    try {
      // Simuler une requête API (à implémenter réellement)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Succès simulé
      setSuccess(true)
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push("/login?reset=success")
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de la réinitialisation")
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Réinitialiser le mot de passe</CardTitle>
        <CardDescription className="text-center">
          Entrez votre nouveau mot de passe
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {success ? (
          <div className="space-y-4">
            <Alert className="border-green-500 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Le mot de passe doit contenir au moins 8 caractères, dont une majuscule et un chiffre
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
            </Button>
          </form>
        )}
      </CardContent>
    </>
  )
} 