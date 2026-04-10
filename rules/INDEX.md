# RULES — FRILO
## Index de la Documentation de Gouvernance

---

## STRATEGY_FOUNDATION
- [01_PROJECT_CHARTER_FRILO.md](STRATEGY_FOUNDATION/01_PROJECT_CHARTER_FRILO.md) — Vision produit, KPIs, périmètre, stack, risques
- [DECISIONS_FRILO.md](STRATEGY_FOUNDATION/DECISIONS_FRILO.md) — Registre canonique des décisions d'architecture (ADR)

## PRODUCT_SPEC
- [02_ARCHITECTURE_BASELINE_FRILO.md](PRODUCT_SPEC/02_ARCHITECTURE_BASELINE_FRILO.md) — Architecture technique de référence (Laravel + Next.js)
- [03_ACCEPTANCE_CRITERIA_FRILO.md](PRODUCT_SPEC/03_ACCEPTANCE_CRITERIA_FRILO.md) — Critères d'acceptation Given/When/Then par fonctionnalité
- [04_DEFINITION_OF_DONE_FRILO.md](PRODUCT_SPEC/04_DEFINITION_OF_DONE_FRILO.md) — Critères obligatoires pour considérer une feature comme livrée
- [05_DOMAIN_MODEL_FRILO.md](PRODUCT_SPEC/05_DOMAIN_MODEL_FRILO.md) — Entités métier, agrégats, états, invariants
- [06_BUSINESS_INTERFACE_CONTRACTS_FRILO.md](PRODUCT_SPEC/06_BUSINESS_INTERFACE_CONTRACTS_FRILO.md) — Contrats pricing/paiement/SLA et interfaces futures FRILO Suite
- [DATA_MODEL_FRILO.md](PRODUCT_SPEC/DATA_MODEL_FRILO.md) — Schéma logique MySQL, tables, relations, index
- [API_INTEGRATION_LAYER_FRILO.md](PRODUCT_SPEC/API_INTEGRATION_LAYER_FRILO.md) — Contrat d'interface REST (endpoints, payloads, codes HTTP)

## BUSINESS_EXECUTION
- [README.md](BUSINESS_EXECUTION/README.md) — Périmètre du bloc business/exécution + owners/versioning
- [AUDIT_CONFORMITE_BP2026_FRILO.md](BUSINESS_EXECUTION/AUDIT_CONFORMITE_BP2026_FRILO.md) — Audit formel de conformité Business Plan 2026
- [MATRICE_TRACABILITE_BP2026_VERS_RULES.md](BUSINESS_EXECUTION/MATRICE_TRACABILITE_BP2026_VERS_RULES.md) — Traçabilité section par section BP2026 -> `rules/`
- [GO_TO_MARKET_EXECUTION_FRILO.md](BUSINESS_EXECUTION/GO_TO_MARKET_EXECUTION_FRILO.md) — Plan d'acquisition, canaux, CAC cibles
- [OPERATIONS_SOP_DELIVERY_SUPPORT_FRILO.md](BUSINESS_EXECUTION/OPERATIONS_SOP_DELIVERY_SUPPORT_FRILO.md) — SOP delivery/support + SLA contractuels
- [BUSINESS_MODEL_FINANCE_GOVERNANCE_FRILO.md](BUSINESS_EXECUTION/BUSINESS_MODEL_FINANCE_GOVERNANCE_FRILO.md) — Modèle économique, unit economics, KPI finance
- [EXPANSION_MULTI_PAYS_FRILO.md](BUSINESS_EXECUTION/EXPANSION_MULTI_PAYS_FRILO.md) — Cadre de duplication pays + gates
- [FRILO_SUITE_TRAJECTOIRE_FRILO.md](BUSINESS_EXECUTION/FRILO_SUITE_TRAJECTOIRE_FRILO.md) — Trajectoire Compta/Fiscal/Ressources
- [OPERATING_RHYTHM_FRILO.md](BUSINESS_EXECUTION/OPERATING_RHYTHM_FRILO.md) — Cadence hebdo/mensuelle de pilotage
- [ROADMAP_MAITRE_2026_2028_FRILO.md](BUSINESS_EXECUTION/ROADMAP_MAITRE_2026_2028_FRILO.md) — Roadmap trimestrielle master 2026-2028
- [V1_DELIVERY_SPRINT_PLAN_S1_S6_FRILO.md](BUSINESS_EXECUTION/V1_DELIVERY_SPRINT_PLAN_S1_S6_FRILO.md) — Plan sprinté de livraison V1 (backend/frontend/QA)
- [V1_PRODUCTION_EXECUTION_STATUS_2026-04-09.md](BUSINESS_EXECUTION/V1_PRODUCTION_EXECUTION_STATUS_2026-04-09.md) — Statut exécutable du plan V1 (done/in-progress/next)
- [FRONTEND_V1_REMAINING_ROADMAP_2026-04-10.md](BUSINESS_EXECUTION/FRONTEND_V1_REMAINING_ROADMAP_2026-04-10.md) — Priorisation frontend restante V1 (P0/P1/P2)
- [LOT_A_PARCOURS_CLIENT_MATRIX_2026-04-10.md](BUSINESS_EXECUTION/LOT_A_PARCOURS_CLIENT_MATRIX_2026-04-10.md) — Matrice exécutable “attendu vs réel” du parcours client V1

## UI_UX_GUIDELINES
- [CHARTE_GRAPHIQUE_FRILO.md](UI_UX_GUIDELINES/CHARTE_GRAPHIQUE_FRILO.md) — Design system, couleurs, typographie, composants, règles UX

## BACKOFFICE_DESIGN
- [BACKOFFICE_FRILO_MENUS_PAR_ROLE.md](BACKOFFICE_DESIGN/BACKOFFICE_FRILO_MENUS_PAR_ROLE.md) — Navigation par rôle (admin custom / client / visiteur)
- [BACKOFFICE_FRILO_CRUDS_ET_FONCTIONNALITES.md](BACKOFFICE_DESIGN/BACKOFFICE_FRILO_CRUDS_ET_FONCTIONNALITES.md) — Opérations CRUD du backoffice admin Laravel custom
- [BACKOFFICE_ROUTES_PERMISSIONS_FRILO.md](BACKOFFICE_DESIGN/BACKOFFICE_ROUTES_PERMISSIONS_FRILO.md) — Routes API, middlewares, policies, erreurs

## SECURITY_ACCESS
- [MASTER_SECURITY_FRILO.md](SECURITY_ACCESS/MASTER_SECURITY_FRILO.md) — Référentiel de sécurité unifié (auth, RBAC, validation, CORS, logs)

## WORKFLOW_ENGINE
- [WORKFLOW_COMMANDE_FRILO.md](WORKFLOW_ENGINE/WORKFLOW_COMMANDE_FRILO.md) — Tunnel commande (5 étapes) + workflow statuts backend

## OPERATIONS_GOVERNANCE
- [AGENT_CONTRACT_FRILO.md](OPERATIONS_GOVERNANCE/AGENT_CONTRACT_FRILO.md) — Contrat opératoire des agents IA sur ce dépôt
- [CHANGE_POLICY_FRILO.md](OPERATIONS_GOVERNANCE/CHANGE_POLICY_FRILO.md) — Politique de modification du code et du domaine
- [REPO_DELIVERY_PROTOCOL_FRILO.md](OPERATIONS_GOVERNANCE/REPO_DELIVERY_PROTOCOL_FRILO.md) — Git, branches, commits, PR, déploiement
- [RUNBOOK_RELEASE_ROLLBACK_V1_FRILO.md](OPERATIONS_GOVERNANCE/RUNBOOK_RELEASE_ROLLBACK_V1_FRILO.md) — Procédure release/rollback V1 et smoke tests post-deploy

## BACKLOG
- [BACKLOG_PRODUIT_FRILO.md](BACKLOG/BACKLOG_PRODUIT_FRILO.md) — Epics, features et user stories V1

## QUALITY_ASSURANCE
- [CHECKLIST_RECETTE_FRILO.md](QUALITY_ASSURANCE/CHECKLIST_RECETTE_FRILO.md) — Checklist de recette fonctionnelle et technique
- [E2E_CRITICAL_PATH_FRILO.md](QUALITY_ASSURANCE/E2E_CRITICAL_PATH_FRILO.md) — Scénario E2E métier automatisé V1 (Playwright)

---

## Hiérarchie de lecture recommandée

1. `01_PROJECT_CHARTER_FRILO.md` — comprendre le produit
2. `AUDIT_CONFORMITE_BP2026_FRILO.md` — comprendre les écarts et arbitrages
3. `MATRICE_TRACABILITE_BP2026_VERS_RULES.md` — vérifier la couverture business -> doc
4. `ROADMAP_MAITRE_2026_2028_FRILO.md` — comprendre la trajectoire d'exécution
5. `02_ARCHITECTURE_BASELINE_FRILO.md` — comprendre la technique
6. `05_DOMAIN_MODEL_FRILO.md` — comprendre les entités métier
7. `WORKFLOW_COMMANDE_FRILO.md` — comprendre le flux principal
8. `AGENT_CONTRACT_FRILO.md` — avant toute intervention IA
9. `MASTER_SECURITY_FRILO.md` — règles de sécurité obligatoires
