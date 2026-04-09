# CHARTE GRAPHIQUE — FRILO
## Design System & Guidelines UI/UX

Version : 1.0
Statut : VALIDÉ

---

## 1. IDENTITÉ VISUELLE

### Couleurs principales

| Nom | Valeur | Usage |
|-----|--------|-------|
| FRILO Blue | `#2563EB` (blue-600) | Actions principales, CTA, liens |
| FRILO Purple | `#7E22CE` (purple-700) | Accents, gradient |
| Gradient FRILO | `from-blue-600 to-purple-600` | Boutons gradient, titres hero |
| Background | `#ffffff` | Fond principal |
| Foreground | `#111827` (gray-900) | Texte principal |
| Muted | `#6B7280` (gray-500) | Texte secondaire, placeholders |

### Couleurs de statut commande

| Statut | Fond | Texte |
|--------|------|-------|
| pending (En attente) | `bg-yellow-100` | `text-yellow-800` |
| processing (En cours) | `bg-blue-100` | `text-blue-800` |
| completed (Livré) | `bg-green-100` | `text-green-800` |
| cancelled (Annulé) | `bg-red-100` | `text-red-800` |

### Mode sombre

En mode sombre (`prefers-color-scheme: dark`) :
- Background : `#0f172a` (slate-900)
- Foreground : `#f8fafc` (slate-50)
- Card : `#1e293b` (slate-800)

---

## 2. TYPOGRAPHIE

- Police principale : Inter (via `next/font`)
- Titres : `font-extrabold` ou `font-bold`, `text-gray-900`
- Texte courant : `text-gray-600` ou `text-gray-500`
- Taille hero (h1) : `text-4xl lg:text-6xl`
- Taille section (h2) : `text-3xl font-bold`
- Taille card (h3) : `text-lg font-bold`

---

## 3. COMPOSANTS UI DE RÉFÉRENCE

### Button

Variantes :
- `gradient` — bg dégradé bleu→violet, texte blanc (CTA principal)
- `outline` — bordure bleue, fond transparent (action secondaire)
- `secondary` — fond gris clair, texte gris foncé
- `ghost` — aucun fond, hover léger

Tailles :
- `sm` — petit (tags, actions secondaires)
- `md` — taille par défaut
- `lg` — CTA héros, actions principales

### Section

Composant layout pour toutes les sections de page :
- Props : `title`, `subtitle`, `variant` (`default` | `muted`)
- Variante `muted` : fond `bg-slate-50`
- Centrage automatique du titre/subtitle

### SectorCard

- Affiche : icône, nom, description, gradient de couleur
- Lien vers `/secteurs/{slug}`
- Hover : élévation shadow

### TemplateCard

- Affiche : thumbnail, nom, secteur, prix en FCFA, liste de features
- Badge secteur
- Bouton "Commander ce modèle" → `/commande?templateId={id}`
- Prix formaté : `.toLocaleString() + ' FCFA'`

### OrderCard

- Affiche : nom entreprise, référence commande, date, badge statut, template, secteur, prix
- Badge statut avec code couleur (voir section statuts)

---

## 4. NAVIGATION

### Header
- Logo FRILO + liens : Templates, Secteurs, Expertises, FAQ, Contact
- CTA "Commander" (bouton gradient)
- Lien Dashboard si authentifié
- Si session active, ne jamais afficher `Connexion`/`Inscription` dans l'espace public

### Sidebar Dashboard
- Navigation dans l'espace client
- Version mobile obligatoire (menu latéral ouvrable/fermable)

### Footer
- Liens légaux (`/mentions-legales`, `/cgu`), contact, réseaux sociaux

---

## 5. STRUCTURE DES PAGES

### Homepage
1. Hero (titre, sous-titre, 2 CTA, badges "Zéro IA / Zéro frais cachés / Support 7j/7")
2. Secteurs populaires (6 SectorCards)
3. Comment ça marche (3 étapes)
4. Exemples de templates (3 TemplateCards)
5. Témoignages (3 cards)
6. Pourquoi FRILO (3 colonnes avantages)

### Wizard de commande
- Progress bar sticky en haut (5 étapes)
- Card centrale blanche sur fond slate-50
- Boutons navigation en bas de card
- Si client déjà connecté : bypass étape auth et passage direct à l'étape détails

---

## 6. RÈGLES UX

- Tout CTA principal utilise la variante `gradient`
- Les actions destructives ou secondaires utilisent `outline` ou `ghost`
- Chaque formulaire doit afficher un état de chargement pendant la soumission
- Les erreurs de formulaire doivent être affichées sous le champ concerné
- Les listes vides doivent proposer une action (ex: "Voir les modèles")
- Prix toujours en FCFA avec séparateur de milliers

---

## 7. ACCESSIBILITÉ

- Contraste suffisant (WCAG AA minimum)
- Labels `aria` sur les éléments interactifs
- Navigation clavier fonctionnelle
- Images avec `alt` descriptif via `next/image`

---

## 8. RESPONSIVE

- Mobile-first via Tailwind
- Breakpoints : `sm`, `md`, `lg`, `xl`
- Grilles : 1 colonne mobile → 2 colonnes md → 3 colonnes lg
- Hero : texte centré mobile, flex row desktop
