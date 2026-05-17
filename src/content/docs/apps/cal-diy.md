---
title: "cal.diy"
description: "Page de réservation mono-prestataire avec paiements Stripe, magasin d'apps calendrier (Google / Outlook / Apple / CalDAV), et un parcours de réservation publ..."
---

Page de réservation mono-prestataire avec paiements Stripe, magasin d'apps calendrier (Google / Outlook / Apple / CalDAV), et un parcours de réservation public soigné. Version auto-hébergée de Cal.com.

- **Projet original :** <https://github.com/calcom/cal.diy>
- **Remplace :** **Calendly**, **Acuity**, **SavvyCal**, **Cal.com Cloud**
- **Connexion (SSO) :** Non disponible -- l'édition communautaire de cette app ne supporte pas OIDC. Les utilisateurs gardent un email/mot de passe par app.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~2-3 min au premier démarrage (les migrations Prisma s'exécutent au démarrage du conteneur).
2. Visitez votre domaine cal.diy et complétez l'assistant initial (courriel admin, mot de passe, nom). L'assistant crée un compte avec le rôle `ADMIN` et `identityProvider=CAL`.
3. **Débloquer la connexion admin (une seule fois).** L'image héritée force tout admin `identityProvider=CAL` à `INACTIVE_ADMIN` tant que la 2FA n'est pas activée, ce qui fait rebondir la redirection après connexion. Ouvrez le **Terminal** Dokploy sur le service `db` et exécutez :
   ```sql
   UPDATE "users" SET role='USER' WHERE email='<votre-courriel-admin>';
   ```
   Connectez-vous. Ouvrez **Settings -> Security -> Two-factor authentication**, activez la 2FA. Puis de retour dans le terminal :
   ```sql
   UPDATE "users" SET role='ADMIN' WHERE email='<votre-courriel-admin>';
   ```
4. Branchez un calendrier : **Settings -> Apps -> Calendars** -> installez Google Calendar / Microsoft / CalDAV / Apple -> autorisez.
5. *(Optionnel)* Activez les réservations payantes Stripe : **Apps -> Stripe** -> connectez un compte Stripe -> sur chaque type d'événement, activez **Requires Payment** et fixez le prix.
6. Configurez vos types d'événements sous **Event Types**. Partagez l'URL publique `https://cal.<votre-domaine>/<utilisateur>/<slug-événement>` avec vos clients.

### Situation de l'image

cal.diy est le nouveau build open-source sous licence MIT de Cal.com. Aucune image Docker `calcom/cal.diy` n'a encore été publiée par l'amont ; ce template utilise l'image héritée `calcom/cal.com:v6.2.0` qui fonctionne mécaniquement mais embarque encore du code commercial (téléphone-maison de licence, garde `INACTIVE_ADMIN` ci-dessus). Quand cal.com publiera une image cal.diy propre sans les gardes, l'opérateur basculera le tag et la danse assistant-puis-SQL disparaîtra.

### Fonctionnalités retirées dans le passage open-source

Le rebrand cal.com `open-source-to-closed-source` a déplacé en commercial uniquement : **Organizations & Teams**, **Routing Forms**, **Workflows** (rappels automatisés), **Instant Booking**, **AI Phone**, **Insights** (analytique), **API v1**, **SAML/SSO**, **Impersonation** admin + **Booking Audit**. Si votre flux dépend d'un de ces éléments, branchez le webhook de réservation dans n8n et reconstruisez la pièce manquante là. Parlez à votre opérateur avant de compter sur l'un de ces éléments.

### Ressources

cal.diy tourne sur Next.js + Postgres dans deux conteneurs. Prévoyez ~1-2 GB de RAM au repos, premier démarrage plus lent que la plupart des apps du catalogue.

### Avertissement multi-locataire

Déploiements mono-locataire uniquement. La version communautaire n'a pas de vraie coordination d'organisation/équipe. Si vous avez besoin de plusieurs prestataires avec disponibilités partagées (clinique / salon / atelier), utilisez plutôt [Easy!Appointments](/apps/easyappointments/).

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template -- vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `CALDIY_HOSTNAME` | `cal.yourdomain.com` |
| `NEXTAUTH_SECRET` | _valeur aléatoire auto-générée_ |
| `CALENDSO_ENCRYPTION_KEY` | _valeur aléatoire auto-générée_ |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |

## Domaine

- **Service et port :** `caldiy:3000`
- **Nom d'hôte :** `cal.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

```yaml
# cal.diy -- MIT-licensed open-source build of Cal.com (scheduling
# links / Calendly alternative). cal.diy is the post-rebrand name
# for the self-hostable Cal.com codebase. Source:
# https://github.com/calcom/cal.diy. No standalone calcom/cal.diy
# Docker image yet; the legacy `calcom/cal.com` image (latest tag
# v6.2.0, 2026-03-02) is the runtime stand-in until upstream
# publishes one. SAML SSO is gated to the commercial Cal.com
# edition, so this template ships email/password admin login only --
# no Keycloak realm client, no BoxyHQ Jackson sidecar.
#
# v6.x auto-runs `prisma migrate deploy` on container boot
# (start.sh entrypoint). No first-deploy operator step needed.
#
# `INACTIVE_ADMIN` gate: the legacy image force-downgrades any
# `IdentityProvider=CAL` admin to INACTIVE_ADMIN unless the
# password passes the strict validator AND 2FA is enabled.
# Wizard-created admins land in INACTIVE_ADMIN and bounce on
# post-login redirect. Workaround documented in the catalog
# setup_steps (demote to USER -> 2FA -> re-promote).

services:
  caldiy:
    image: calcom/cal.com:v6.2.0
    restart: unless-stopped
    environment:
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      CALENDSO_ENCRYPTION_KEY: ${CALENDSO_ENCRYPTION_KEY}
      DATABASE_URL: postgres://caldiy:${DB_PASSWORD}@db:5432/caldiy
      DATABASE_DIRECT_URL: postgres://caldiy:${DB_PASSWORD}@db:5432/caldiy
      NEXT_PUBLIC_WEBAPP_URL: https://${CALDIY_HOSTNAME}
      NEXTAUTH_URL: https://${CALDIY_HOSTNAME}
      NEXT_PUBLIC_LICENSE_CONSENT: agree
      LICENSE: agree
      NODE_ENV: production
      # ALLOWED_HOSTNAMES: comma-separated, JSON-quoted hostnames.
      # Cal.com wraps the value in [] then JSON.parses, so the env var
      # must hold only the array CONTENTS (no surrounding brackets).
      # Single host: '"cal.yourdomain.com"'. Multiple:
      # '"a.yourdomain.com","b.yourdomain.com"'. Without this set, Cal.com
      # warns "Match of WEBAPP_URL with ALLOWED_HOSTNAMES failed" on
      # every request and gates parts of the auth flow (org dispatch).
      # Bare unquoted strings throw JSON.parse errors; surrounding []
      # produces a nested array that fails the match.
      ALLOWED_HOSTNAMES: '"${CALDIY_HOSTNAME}"'
      # Cookie domain MUST match the exact hostname (no leading dot)
      # for a single-host deploy. A leading dot makes the cookie valid
      # for sub-subdomains too, but NextAuth treats the dotted form
      # inconsistently across versions and can fail to set the session
      # cookie on the auth callback round-trip.
      NEXTAUTH_COOKIE_DOMAIN: ${CALDIY_HOSTNAME}
      # Upstream env var read by the cal.com source; the name stays
      # CALCOM_TELEMETRY_DISABLED because that is what the binary
      # checks for, regardless of the cal.diy rebrand.
      CALCOM_TELEMETRY_DISABLED: "1"
    depends_on:
      db:
        condition: service_healthy
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - caldiy
      default: {}

  db:
    image: postgres:16.13-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: caldiy
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: caldiy
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U caldiy"]
      interval: 10s
      timeout: 5s
      retries: 5
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

volumes:
  db-data:

networks:
  dokploy-network:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](/apps/)
