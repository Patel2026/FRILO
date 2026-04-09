# 06 - BUSINESS INTERFACE CONTRACTS
## Contrats d'interface business (documentation cible)

Version : 1.0  
Statut : VALIDÉ (documentation, sans implémentation obligatoire immédiate)  
Owner : Head of Product + COO

---

## 1. Objet

Ce document formalise les contrats d'interface business nécessaires pour aligner l'exécution FRILO avec le Business Plan 2026, sans casser les invariants techniques existants.

Ce document :
- complète `API_INTEGRATION_LAYER_FRILO.md`
- ne remplace pas les routes techniques déjà validées
- sert de référence pour les implémentations futures (V2+)

---

## 2. Contrat de Politique Tarifaire

### 2.1 Offres actives

| Offre | Prix | Période | Éligibilité |
|------|------|---------|-------------|
| `launch_offer` | 35 000 FCFA | 60 jours max après lancement commercial | clients nouveaux |
| `standard_offer` | 50 000 FCFA | après période de lancement | clients nouveaux |
| `hosting_renewal` | 15 000 FCFA/an | à partir de l'An 2 | clients existants |

### 2.2 Règle de transition d'offre

- La `launch_offer` prend fin à la première des deux conditions suivantes :
  - 60 jours écoulés depuis la date de lancement officiel
  - OU quota de lancement atteint (40 ventes)
- Toute commande créée après la fin de `launch_offer` utilise `standard_offer`.

### 2.3 Contrat de données pricing (cible)

```json
{
  "pricing_policy_version": "2026.1",
  "offer_code": "standard_offer",
  "base_price_fcfa": 50000,
  "renewal_price_fcfa": 15000,
  "currency": "XOF",
  "effective_from": "2026-01-01",
  "effective_to": null
}
```

---

## 3. Contrat de Paiement (V2 cible)

### 3.1 États paiement

| Statut paiement | Description |
|----------------|-------------|
| `awaiting_payment` | commande créée mais non réglée |
| `paid` | paiement confirmé |
| `failed` | échec paiement |
| `refunded` | remboursement exécuté |
| `cancelled` | paiement annulé avant confirmation |

### 3.2 Règle métier cible

- Politique commerciale : démarrage production uniquement après statut `paid`.
- En V1, la simulation actuelle est conservée (`paiement simulé`), sans transaction réelle.
- En V2, `Order.status = pending` n'est autorisé qu'après confirmation paiement.

### 3.3 Cas d'échec/remboursement (cible)

- `failed` : la commande reste en attente, aucune production lancée.
- `cancelled` : commande annulée avant prise en charge.
- `refunded` : commande bascule `cancelled` côté workflow opérationnel, avec trace d'audit.

---

## 4. Contrat de Suivi Opérationnel (SLA timestamps)

### 4.1 Timestamps attendus

| Champ | Description | SLA cible |
|------|-------------|-----------|
| `ordered_at` | horodatage de commande | immédiat |
| `confirmed_at` | confirmation FRILO au client | < 2 heures |
| `assigned_at` | technicien assigné | < 2 heures |
| `preview_sent_at` | envoi lien de prévisualisation | < 24 heures |
| `revision_due_at` | limite retours client | 24 heures après preview |
| `delivered_at` | mise en ligne définitive | ≤ 48 heures depuis commande |

### 4.2 Contrat de conformité SLA

- Toute commande avec `delivered_at - ordered_at > 48h` est marquée `sla_breached = true`.
- Tout ticket `confirmed_at` manquant à +2h est un incident opérationnel.

---

## 5. Contrats Fonctionnels FRILO Suite (Phase 2/3)

### 5.1 Module `FRILO Compta` (Phase 2)

Objectif fonctionnel :
- enregistrer ventes/dépenses
- produire un résumé mensuel
- exporter des rapports PDF

Interface fonctionnelle minimale (cible) :
- `create_transaction`
- `list_transactions`
- `get_monthly_summary`
- `export_monthly_report_pdf`

### 5.2 Module `FRILO Fiscal` (Phase 2)

Objectif fonctionnel :
- calendrier fiscal personnalisé
- rappels automatiques (WhatsApp/email)
- historique déclaratif

Interface fonctionnelle minimale (cible) :
- `list_obligations`
- `schedule_reminders`
- `mark_obligation_completed`
- `get_fiscal_history`

### 5.3 Module `FRILO Ressources` (Phase 3)

Objectif fonctionnel :
- suivi employés, fournisseurs, stocks, contrats
- synthèse mensuelle consolidée

Interface fonctionnelle minimale (cible) :
- `manage_employees`
- `manage_suppliers`
- `manage_inventory`
- `manage_contracts`
- `get_consolidated_dashboard`

---

## 6. Règles de Gouvernance

- Aucun contrat de ce document n'est considéré en production tant qu'il n'est pas :
  - implémenté en code
  - couvert par tests
  - référencé dans `03_ACCEPTANCE_CRITERIA_FRILO.md`
- En cas de conflit avec les invariants techniques validés, `DECISIONS_FRILO.md` fait autorité.
