# LOT A — MATRICE PARCOURS CLIENT V1 (10/04/2026)
## Attendu vs Réel vs Correctifs

Version : 1.0  
Statut : ACTIF  
Owner : Product Lead + Frontend Lead + Backend Lead + QA Lead

---

## 1. Objectif

Évaluer la V1 depuis la perspective client réelle (et non uniquement technique), puis fermer les écarts bloquants avant validation finale Gate B/Gate C.

---

## 2. Matrice exécutable

| Étape parcours client | Attendu V1 | État actuel | Gap principal | Action corrective | Priorité | Statut |
|---|---|---|---|---|---|---|
| Découverte catalogue (`/templates`, `/secteurs`) | Trouver un modèle rapidement, filtres robustes, états vides clairs | Fonctionnel | Peu de signaux de réassurance business globale | Renforcer preuve sociale + clarifier CTA (itération UX) | P1 | TODO |
| Prévisualisation template | Voir rendu immersif desktop/mobile + navigation sections | Fonctionnel | Qualité perçue variable selon template | Standardiser presets/qualité visuelle par template | P1 | TODO |
| Tunnel de commande | Parcours fluide auth -> détails -> confirmation, gestion erreur explicite | Fonctionnel | Réassurance partiellement couverte | Ajouter aide contextuelle/support direct + reprise brouillon guidée | P1 | IN PROGRESS (10/04/2026) |
| Confirmation + suivi client | Confirmation claire + tracking statut dans dashboard | Fonctionnel | Notification proactive client absente lors des changements de statut admin | Implémenter notification email de changement de statut commande | P0 | DONE (10/04/2026) |
| Relation support (`/contact`) | Canal support opérationnel avec traçabilité | Fonctionnel | Pas de lien explicite commande <-> demande support | Ajouter champ optionnel `order_reference` dans flux support + visibilité admin | P1 | DONE (10/04/2026) |
| Confiance légale et engagement | Pages légales accessibles + promesse SLA cohérente | Fonctionnel | Validation juridique finale encore ouverte | Faire signer version juridique finale | P0 | TODO |
| Recette utilisateur réelle | Validation de bout en bout signée (PV) | Non finalisé | Gate B pas signé | Campagne recette métier + PV | P0 | TODO |

---

## 3. Livraison Lot A — Itération 1 (faite)

- Mise en place de la notification email client lors d’un changement de statut de commande.
- Test unitaire ajouté pour verrouiller l’envoi de notification sur transition valide.
- Ajout du champ optionnel `order_reference` dans `POST /api/contact`, persistance DB et affichage/filtrage dans l’admin support.
- Ajout de réassurance tunnel : bloc assistance contextuel + lien support pré-rempli + restauration automatique d’un brouillon local.

---

## 4. Prochaines itérations Lot A (ordre recommandé)

1. Renforcer la réassurance client dans le tunnel (aide + reprise guidée).
2. Exécuter et signer la recette fonctionnelle complète (Gate B).
3. Préparer validation préprod + smoke tests (Gate C).
