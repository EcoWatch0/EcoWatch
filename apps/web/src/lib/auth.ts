/**
 * Fonctions utilitaires pour la gestion de l'authentification
 */

import { deleteCookie } from 'cookies-next';

/**
 * Fonction de déconnexion qui supprime le cookie d'authentification
 * et redirige l'utilisateur vers la page de connexion
 */
export async function logout() {
  try {
    // Supprimer le cookie d'authentification
    deleteCookie('token');
    
    // Rediriger vers la page de connexion
    window.location.href = '/login';
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
} 