# FRILO Frontend (Next.js)

Frontend client FRILO (espace public + dashboard client).

## Configuration des environnements

Le frontend consomme l'API Laravel via `NEXT_PUBLIC_API_URL`.

- Développement local:
  - fichier: `.env.local`
  - exemple: `.env.example`
- Docker local:
  - exemple: `.env.docker.example`
- Staging:
  - exemple: `.env.staging.example`
- Production:
  - exemple: `.env.production.example`

Valeur attendue:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Scripts utiles

```bash
npm run dev
npm run lint
npm run typecheck
npm run qa
```

## Flux client configurés

- Authentification: `login`, `register`
- Réinitialisation mot de passe: `forgot-password`, `reset-password`
- Tunnel commande + paiement FedaPay
- Dashboard client + notifications

