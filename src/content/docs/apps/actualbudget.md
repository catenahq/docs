---
title: "Actual Budget"
description: "Finances personnelles auto-hébergées. Budgétisation par enveloppes, synchro bancaire via SimpleFIN ou GoCardless, chiffré de bout en bout."
---

Finances personnelles auto-hébergées. Budgétisation par enveloppes, synchro bancaire via SimpleFIN ou GoCardless, chiffré de bout en bout.

- **Projet original :** <https://actualbudget.org/>
- **Remplace :** **YNAB (You Need A Budget)**, **Mint**, **EveryDollar**
- **Connexion (SSO) :** Non disponible -- l'édition communautaire de cette app ne supporte pas OIDC. Les utilisateurs gardent un email/mot de passe par app.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~30 s.
2. Visitez votre domaine Actual Budget. Définissez un mot de passe serveur au premier accès (stocké localement ; retenez-le -- pas de récupération).
3. Créez un nouveau budget ou importez-en un existant (menu fichier -> Importer depuis YNAB4 / YNAB5 / nYNAB).
4. *(Optionnel)* Connectez des comptes bancaires via **Settings** -> **Connected Accounts** -> SimpleFIN (USD/CAD, payant) ou GoCardless (EUR/GBP, gratuit).

**À propos de la connexion.** Actual Budget utilise un mot de passe serveur partagé pour déverrouiller l'UI, pas des connexions par utilisateur. Le multi-utilisateurs fonctionne au niveau du budget (partage de fichier budget) mais l'auth serveur est un secret unique. C'est la conception upstream : typiquement un foyer par serveur. OIDC/SSO non supporté.

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template -- vous n'avez pas à les générer vous-même.

_(aucune variable d'environnement à configurer)_

## Domaine

- **Service et port :** `actual:5006`
- **Nom d'hôte :** `budget.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

```yaml
# Actual Budget -- self-hosted personal finance (YNAB / Mint alternative).
# Single-container app with a local SQLite database + file storage.
# Server uses its own password login (set on first visit) -- no OIDC
# support in the upstream project.

services:
  actual:
    image: actualbudget/actual-server:26.5.1-alpine
    restart: unless-stopped
    environment:
      ACTUAL_HTTPS: "false"               # TLS terminated by Traefik
      ACTUAL_TRUST_PROXY: "true"
      ACTUAL_PORT: "5006"
    volumes:
      - actual-data:/data
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - actualbudget
      default: {}

volumes:
  actual-data:

networks:
  dokploy-network:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](./)
