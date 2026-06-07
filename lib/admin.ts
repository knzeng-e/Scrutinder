// Vérifie un mot de passe admin contre la variable d'env ADMIN_PASSWORD.
// Si la variable n'est pas définie, l'accès est toujours refusé.
export function checkAdmin(provided: string | null | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  return typeof provided === 'string' && provided.length > 0 && provided === expected
}
