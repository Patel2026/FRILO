# RUNBOOK — ROTATION CLÉS PAIEMENT & ROLLBACK CONFIG
## Paramètres plateforme (Backoffice `/admin/settings`)

Version : 1.0  
Owner : Backend Lead + Ops Lead  
Statut : OPÉRATIONNEL

---

## 1. Objectif

Ce runbook décrit la procédure standard pour :
- faire une rotation sécurisée des secrets FedaPay (`secret_key`, `webhook_secret`)
- tester puis publier la nouvelle configuration
- revenir rapidement à une version précédente en cas d'incident

---

## 2. Pré-requis

- Compte avec rôle `super_admin`
- Nouvelles clés FedaPay disponibles côté fournisseur
- Fenêtre d’intervention validée (si possible hors pic)
- Canal incident ouvert (Slack/WhatsApp interne) pour coordination

---

## 3. Rotation standard (Brouillon -> Tester -> Publier)

1. Ouvrir `/admin/settings` (section **Paiement**).
2. Vérifier que la révision active est connue (ID publié actuel).
3. Dans le brouillon courant :
   - renseigner `secret_key` et `webhook_secret` (champs secrets)
   - garder les champs inchangés si pas de besoin (`base_url`, `currency`, etc.)
4. Enregistrer la section.
5. Cliquer **Tester la connexion**.
6. Si test OK, publier avec une note de changement explicite :
   - exemple : `Rotation clés FedaPay - 2026-04-10`
7. Vérifier que la nouvelle version est `published` et qu’un nouveau `draft` a été créé.

---

## 4. Vérifications post-publication (obligatoires)

- Initier un paiement test sur une commande de test
- Vérifier callback et synchronisation webhook
- Vérifier logs applicatifs :
  - `settings.payment.test.succeeded`
  - `settings.published`
  - `payment.fedapay.initiated`
- Confirmer absence d’erreurs 401/403/5xx côté paiement

---

## 5. Rollback de configuration publiée

Cas d’usage : erreurs de checkout, signature webhook invalide, refus API fournisseur.

1. Aller sur `/admin/settings/history`.
2. Identifier la dernière révision stable.
3. Action **Restaurer en brouillon** sur cette révision.
4. Ouvrir `/admin/settings`, vérifier la section Paiement.
5. Publier immédiatement le brouillon restauré avec note :
   - exemple : `Rollback config paiement vers révision #XYZ`
6. Refaire les vérifications post-publication.

Résultat attendu :
- la configuration stable redevient `published`
- l’incident opérationnel est stoppé sans rollback applicatif global

---

## 6. Règles de sécurité

- Ne jamais copier les secrets dans un ticket, commit, Slack ou email
- Les secrets doivent rester dans le formulaire admin (stockage chiffré)
- Champ secret vide = conservation de la valeur existante
- Toute rotation doit être tracée par une note de changement

---

## 7. Journalisation attendue

- `settings.section.updated`
- `settings.payment.test.succeeded` ou `settings.payment.test.failed`
- `settings.published`
- `settings.draft.restored` (si rollback)

Les logs ne doivent jamais contenir la valeur des secrets.
