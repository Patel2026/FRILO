# Miniatures et démos externes

Conception approuvée dans la conversation le 7 octobre 2026.

Les templates locaux et externes conservent une miniature téléversée (JPEG,
PNG, WebP, 2 Mo). Le disque public est utilisé pour stocker et exposer son URL.
Le frontend affiche ces images directement, sans téléchargement côté serveur
Next.js vers des hôtes privés. Les erreurs de validation sont visibles.

Un champ `preview_mode` choisit `iframe` (défaut historique) ou `external`.
Le mode local utilise toujours l'iframe. Les liens externes HTTP(S) sont
conservés avec leur chemin, paramètres et fragment. Aucun scraping de
ThemeForest : l'administrateur fournit le lien de démonstration et son image.
Les deux écrans de prévisualisation proposent une ouverture directe dans un
nouvel onglet. En mode externe, ils montrent la miniature et ce lien au lieu
d'une iframe. Les restrictions d'intégration des sites tiers sont respectées.

Les fichiers publics doivent persister dans un volume Docker partagé avec
Nginx en lecture seule. Une procédure préserve les fichiers déjà téléversés
avant de recréer les conteneurs en production.

Vérification : tests de stockage/URL, remplacement, validation, persistance
du mode dans l'API ; résolution des URL locales/externes ; navigation des deux
modes et rendu des images ; QA backend/frontend. Aucun déploiement inclus.
