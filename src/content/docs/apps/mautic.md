---
title: "Mautic"
description: "Automatisation marketing open-source. Segments de contacts, campagnes courriel, séquences drip, pages de destination, formulaires, scoring de prospects."
---

Automatisation marketing open-source. Segments de contacts, campagnes courriel, séquences drip, pages de destination, formulaires, scoring de prospects. Remplace Mailchimp / ActiveCampaign / HubSpot Marketing.

- **Projet original :** <https://www.mautic.org/>
- **Remplace :** **Mailchimp**, **ActiveCampaign**, **HubSpot Marketing**, **Brevo (Sendinblue)**
- **Connexion (SSO) :** Non disponible - l'édition communautaire de cette app ne supporte pas OIDC. Les utilisateurs gardent un email/mot de passe par app.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~2 min pour le premier démarrage (les migrations de base s'exécutent au premier lancement).
2. Visitez votre domaine Mautic et complétez l'assistant initial :
   - **Base de données** : pré-remplie (hôte `db`, nom `mautic`, utilisateur `mautic`, mot de passe depuis la variable `DB_PASSWORD`).
   - **Utilisateur admin** : créez votre compte admin initial.
   - **Paramètres courriel** : collez les identifiants SMTP de votre relais géré (hôte, port `587`, nom d'utilisateur, mot de passe, adresse expéditeur). Sautez cette étape si vous préférez la configurer plus tard sous **Settings** -> **Configuration** -> **Email Settings**.
3. Vérifiez que les conteneurs cron + worker tournent dans Dokploy (Mautic a besoin de `mautic_cron` pour les campagnes planifiées + `mautic_worker` pour la file d'envoi).
4. Créez votre premier segment : **Segments** -> **New** -> filtrez par attribut de contact.
5. Créez votre première campagne : **Campaigns** -> **New** -> glissez l'action **Send email** sur un déclencheur de segment.

### Authentification

Mautic édition communautaire ne fournit pas d'OIDC natif. Connexion locale par nom d'utilisateur/mot de passe par défaut. SAML2 est supporté en amont mais demande une configuration par déploiement ; des plugins OAuth2 génériques tiers existent. Si un SSO unifié pour la stack est requis, contactez votre opérateur pour ajouter une couche oauth2-proxy en façade (le groupe Keycloak `client-staff` filtre l'accès au niveau Traefik avant que le trafic n'atteigne Mautic).

### SMTP et réputation d'envoi

Mautic n'envoie PAS directement les courriels. Il remet chaque envoi à votre relais SMTP géré (voir le [guide des fournisseurs courriel](/docs/guides/email-providers/) pour les choix recommandés). Réputation d'envoi, SPF/DKIM/DMARC, et gestion des rebonds vivent au niveau du relais. Configurez SMTP sous **Settings** -> **Configuration** -> **Email Settings** avec les identifiants de votre relais avant la première campagne.

### Contenu d'aimant à prospects et copie des séquences drip

Le template fournit le moteur. La rédaction des PDF d'aimants, des séquences drip et des modèles d'envoi est le travail de votre équipe (ou de votre opérateur, s'il offre des services de contenu marketing). Mautic lui-même ne livre aucune campagne pré-bâtie.

### Ressources

Mautic tourne en Apache + MariaDB + un worker sidecar + un cron sidecar. Prévoyez ~1.5 GB RAM au repos (worker + cron consomment ~300 MB chacun), ~3 GB sous envois de campagne ou reconstruction de segments. Le stockage croît avec les uploads de médias et l'historique des événements courriel ; budgétez ~10 GB après la première année d'usage régulier.

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose Dokploy. Les secrets aléatoires sont générés automatiquement au premier semi du template - vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `MAUTIC_HOSTNAME` | `marketing.yourdomain.com` |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |
| `DB_ROOT_PASSWORD` | _valeur aléatoire auto-générée_ |
| `SMTP_HOST` | _à renseigner avant déploiement_ |
| `SMTP_PORT` | `587` |
| `SMTP_USERNAME` | _à renseigner avant déploiement_ |
| `SMTP_PASSWORD` | _à renseigner avant déploiement_ |
| `SMTP_FROM_ADDRESS` | _à renseigner avant déploiement_ |

## Domaine

- **Service et port :** `mautic_web:80`
- **Nom d'hôte :** `marketing.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ; modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si vous souhaitez autre chose.

---

[Retour au catalogue des applications pré-configurées](/docs/apps/)
