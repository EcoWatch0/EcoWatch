import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    // Validation des données côté serveur
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Récupérer l'URL de l'API depuis les variables d'environnement
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('API_URL n\'est pas configuré');
    }

    // Appeler l'API gateway pour l'inscription
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    // Gérer les erreurs
    if (!response.ok) {
      const error = await response.json();
      
      // Vérifier si l'erreur est due à un email déjà existant
      if (response.status === 409) {
        return NextResponse.json(
          { message: 'Cet email est déjà utilisé' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { message: error.message || 'Échec de l\'inscription' },
        { status: response.status }
      );
    }

    // Enregistrement réussi
    return NextResponse.json(
      { message: 'Inscription réussie' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 