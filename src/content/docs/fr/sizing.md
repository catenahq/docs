---
title: "Quel VPS me faut-il ?"
description: "Empreinte ressources par application pour choisir un palier de VPS. Dernière mesure : 2026-04-29."
---

Empreinte ressources de chaque application pré-configurée, pour choisir
un palier de VPS adapté à ce que vous comptez déployer.

**Dernière mesure :** 2026-04-29
**Mesuré sur :** dev1 (1 vCPU / 2 GB OVH VPS)

## Tableau d'empreinte

| Application | RAM (repos) | RAM (pic) | CPU (repos) | CPU (pic) | Disque (base) |
|---|---|---|---|---|---|
| Nextcloud | 420 MB | 880 MB | 2% | 65% | 320 MB |
| Rocket.Chat | 520 MB | 720 MB | 3% | 35% | 180 MB |
| OnlyOffice | 380 MB | 620 MB | 1% | 80% | 90 MB |
| Outline | 280 MB | 420 MB | 1% | 25% | 110 MB |
| EspoCRM | 240 MB | 480 MB | 1% | 40% | 200 MB |
| Twenty | 580 MB | 920 MB | 4% | 55% | 220 MB |
| Plane | 720 MB | 1040 MB | 4% | 50% | 380 MB |
| Zammad | 1850 MB | 2200 MB | 6% | 60% | 520 MB |
| Chatwoot | 540 MB | 780 MB | 2% | 45% | 240 MB |
| WordPress | 320 MB | 600 MB | 1% | 70% | 180 MB |
| n8n | 280 MB | 700 MB | 2% | 80% | 150 MB |
| ERPNext | 2100 MB | 2900 MB | 8% | 90% | 850 MB |
| Actual Budget | 80 MB | 180 MB | 1% | 15% | 30 MB |
| Postiz | 480 MB | 680 MB | 2% | 35% | 200 MB |
| DocuSeal | 320 MB | 540 MB | 1% | 35% | 140 MB |
| Documenso (déprécié) | 380 MB | 620 MB | 2% | 30% | 160 MB |

Le CPU est normalisé sur un cœur : 100 % = un vCPU complet. Les pics
correspondent à ce que nous avons observé en exerçant l'application
selon les [étapes de configuration](/docs/fr/apps/) (premier import
massif Nextcloud, première passe de l'assistant ERPNext, etc.).

## Recommandations par palier

Ce sont des points de départ ; vos chiffres réels dépendent du nombre
d'utilisateurs et de l'intensité de la charge.

- **VPS 2 Go :** une seule application légère (Nextcloud, EspoCRM,
  WordPress, n8n, Outline, Actual Budget) ou deux-trois légères côte à
  côte. À éviter pour Zammad / ERPNext / Plane.
- **VPS 4 Go :** un combo productivité confortable (Nextcloud + EspoCRM
  + Rocket.Chat + Outline) ou un template lourd seul (Zammad, Plane).
- **VPS 8 Go :** indispensable pour ERPNext avec une autre application
  significative, ou un combo productivité incluant Zammad.

## Notes par application

### Nextcloud

La pile app + db + redis + cron tourne à ~420 Mo au repos. Le
service le plus lourd est `app` (PHP-FPM) à ~280 Mo au repos,
~600 Mo lors du premier import massif. Avec S3 en stockage
primaire, le disque du VPS reste stable -- c'est le seau qui
grossit.
### Rocket.Chat

Le replica set MongoDB + le process Node Rocket.Chat. Le cache
WiredTiger de MongoDB domine ; limitez WIRED_TIGER_CACHE_SIZE_GB
sur un VPS 2 Go.
### OnlyOffice

Au repos, c'est léger ; chaque session d'édition lance des
workers par document. Trois éditeurs concurrents poussent le CPU
à 80 % sur un seul vCPU. À utiliser avec Nextcloud (pas d'UI
directe).
### Outline

App Node + Postgres + Redis. Léger en régime de croisière ; la
couche websocket de l'éditeur collaboratif ajoute ~50 Mo par
éditeur connecté.
### EspoCRM

PHP-Apache + MariaDB + sidecar cron. Léger au quotidien ; envoi
mass-email ou import en masse poussent à ~480 Mo et ~40 % CPU sur
un vCPU.
### Twenty

Server + worker + Postgres + Redis -- quatre conteneurs ; RAM au
repos plus élevée qu'EspoCRM. Choisissez Twenty pour l'UI
moderne ; EspoCRM pour l'empreinte plus légère.
### Plane

Pile multi-conteneurs (api + worker + beat + frontend + space +
MinIO + Postgres + Redis). Empreinte RAM importante ; prévoyez
1 Go au-dessus du reste de la pile.
### Zammad

Embarque Elasticsearch qui réserve ~1,5 Go de heap à lui seul.
Prévoyez un VPS >=4 Go. La première migration de l'assistant
ajoute ~300 Mo transitoirement.
### Chatwoot

Rails + Sidekiq + Postgres + Redis. Plus léger que Zammad (pas
d'Elasticsearch). Orienté conversation ; tient sur un VPS 2 Go
sans difficulté.
### WordPress

nginx + php-fpm + MariaDB + Redis. Le cache FastCGI absorbe le
trafic anonyme ; PHP ne s'active que sur cache miss + sessions
admin. Pic de connexions éditeurs ou install plugin font monter
le CPU.
### n8n

Léger au repos ; un workflow lance des processus Node par nœud
et peut faire pointer RAM/CPU. Si vous automatisez beaucoup,
dimensionnez sur le pic, pas le repos.
### ERPNext

~10 conteneurs. Le template le plus lourd du catalogue. Prévoyez
un VPS dédié >=4 Go ; ne le colocalisez pas avec Nextcloud +
Rocket.Chat sur un VPS 2 Go.
### Actual Budget

Un seul conteneur Node, sqlite. Empreinte négligeable ; ajout
quasi gratuit.
### Postiz

Postiz + Postgres + Redis. Poids moyen ; les publications avec
images sollicitent fortement la bibliothèque Sharp lors de la
planification.
### DocuSeal

Rails + Postgres. Léger au repos ; le tamponnage PDF du flux de
signature est le pic de charge.
### Documenso (déprécié)

DÉPRÉCIÉ -- utilisez DocuSeal. Conservé ici pour que les clients
pas encore migrés voient les bons chiffres.

---

Si vous avez besoin d'un palier différent de celui initialement
provisionné, contactez votre opérateur — un changement de palier est
une migration en une commande vers un nouveau VPS avec les mêmes
données.
