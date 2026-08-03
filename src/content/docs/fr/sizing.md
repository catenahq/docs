---
title: "Dimensionner un VPS"
description: "Empreinte ressources par application pour choisir un palier de VPS. Dernière mesure : 2026-04-29."
---

Empreinte ressources de chaque application pré-configurée, pour choisir
un palier de VPS adapté au déploiement prévu.

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
| Windshift | _n/a_ | 2300 MB | _n/a_ | _n/a_ | _n/a_ |
| WordPress | 320 MB | 600 MB | 1% | 70% | 180 MB |
| n8n | 280 MB | 700 MB | 2% | 80% | 150 MB |
| ERPNext | 2100 MB | 2900 MB | 8% | 90% | 850 MB |
| Actual Budget | 80 MB | 180 MB | 1% | 15% | 30 MB |
| Postiz | 480 MB | 680 MB | 2% | 35% | 200 MB |
| DocuSeal | 320 MB | 540 MB | 1% | 35% | 140 MB |
| Mautic | 1500 MB | 3000 MB | 3% | 75% | 420 MB |
| Collabora Online (CODE) | _n/a_ | 1024 MB | _n/a_ | _n/a_ | _n/a_ |
| Element / Matrix | _n/a_ | 1536 MB | _n/a_ | _n/a_ | _n/a_ |
| Zammad | _n/a_ | 1536 MB | _n/a_ | _n/a_ | _n/a_ |
| Chatwoot | _n/a_ | 768 MB | _n/a_ | _n/a_ | _n/a_ |
| Easy!Appointments | _n/a_ | 384 MB | _n/a_ | _n/a_ | _n/a_ |
| Kimai | 250 MB | 500 MB | 1% | 35% | 180 MB |
| Invoice Ninja | 400 MB | 800 MB | 2% | 45% | 350 MB |
| Serveur de courriel + webmail | 520 MB | 900 MB | 3% | 40% | 600 MB |

Le CPU est normalisé sur un cœur : 100 % = un vCPU complet. Les pics
correspondent à ce que nous avons observé en exerçant l'application
selon les [étapes de configuration](/fr/apps/) (premier import
massif Nextcloud, première passe de l'assistant ERPNext, etc.).

## Recommandations par palier

Ce sont des points de départ. Les chiffres réels dépendent du nombre
d'utilisateurs et de l'intensité de la charge.

- **VPS 6 Go (palier de départ) :** confortable pour le combo
  productivité (Nextcloud + EspoCRM + Rocket.Chat + Outline) plus une
  application de poids moyen (Plane, Twenty, Postiz, Outline). À
  éviter pour ERPNext.
- **VPS 8 Go :** indispensable pour ERPNext avec une autre
  application significative, ou pour toute combinaison qui ajoute
  une deuxième application de poids moyen au combo productivité.
- **VPS 12 Go ou plus :** ERPNext avec le combo productivité complet,
  ou toute combinaison de deux applications lourdes.

## Notes par application

### Nextcloud

La pile app + db + redis + cron tourne à ~420 Mo au repos. Le
service le plus lourd est `app` (PHP-FPM) à ~280 Mo au repos,
~600 Mo lors du premier import massif. Avec S3 en stockage
primaire, le disque du VPS reste stable -- c'est le seau qui
grossit. L'antivirus (files_antivirus, mode Daemon) est câblé par
l'opérateur vers le clamd PARTAGÉ (réseau catena-clamav, ~1,5 Go
résident), NON compté ici -- c'est de l'infrastructure partagée
avec le serveur de courriel ; à budgéter une fois au niveau du VPS.
### Rocket.Chat

Le replica set MongoDB + le process Node Rocket.Chat. Le cache
WiredTiger de MongoDB domine ; les réglages par défaut tiennent
sans difficulté sur le palier de départ 6 Go.
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
1 Go au-dessus du reste de la suite.
### Windshift

NON MESURÉ. La valeur peak_ram_mb est un budget déclaré, pas une
observation : 2048 Mo correspond au budget que Windshift applique
par défaut (WINDSHIFT_MEMORY_LIMIT_MB, aligné sur mem_limit: 2g
dans le compose), plus ~250 Mo pour la base Postgres. Le
planificateur du banc exige un entier positif, et surestimer ne
coûte que des créneaux parallèles. À remplacer par les cinq
mesures réelles dès la première campagne.
### WordPress

nginx + php-fpm + MariaDB + Redis. Le cache FastCGI absorbe le
trafic anonyme ; PHP ne s'active que sur cache miss + sessions
admin. Pic de connexions éditeurs ou install plugin font monter
le CPU.
### n8n

Léger au repos ; un workflow lance des processus Node par nœud
et peut faire pointer RAM/CPU. Une automatisation intensive se
dimensionne sur le pic, pas sur le repos.
### ERPNext

~10 conteneurs. Le template le plus lourd du catalogue. Prévoyez
un VPS dédié de 8 Go ou plus ; colocaliser ERPNext avec le combo
productivité complet demande un palier de 12 Go.
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
### Mautic

Trois conteneurs Apache/PHP (web + worker + cron) au-dessus de
MariaDB. La RAM au repos est dominée par les sidecars worker et
cron (~300 Mo chacun, même à l'arrêt). Les envois de campagne et
reconstructions de segments poussent le pic RAM vers 3 Go et le
CPU au-dessus de 75 % sur un vCPU. Prévoyez un palier 6 Go si
Mautic cohabite avec Nextcloud + Rocket.Chat ; sinon un palier
4 Go tient pour de faibles volumes d'envoi.
### Collabora Online (CODE)

Éditeur de documents sans état adossé à Nextcloud. Le
dimensionnement est dominé par les workers par document lors de
l'édition active ; l'empreinte au repos est faible. La valeur de
pic ci-dessus est une estimation prudente pré-lancement, pas
encore une mesure réelle.
### Element / Matrix

Element (Synapse + Postgres + Redis) consomme beaucoup de mémoire
lors de la première synchronisation fédérée ; la valeur ci-dessus
est un plancher de mise en service. Estimation prudente
pré-lancement, pas encore une mesure réelle.
### Zammad

Zammad (Rails + Postgres + Elasticsearch + Redis) se dimensionne
autour du heap JVM d'Elastic ; prévoyez de la marge. Estimation
prudente pré-lancement, pas encore une mesure réelle.
### Chatwoot

Chatwoot (Rails + Postgres + Redis + Sidekiq) ; le pic croît avec
le nombre de conversations actives. Estimation prudente
pré-lancement, pas encore une mesure réelle.
### Easy!Appointments

PHP-Apache + MariaDB ; empreinte légère dominée par la base de
données. Estimation prudente pré-lancement, pas encore une mesure
réelle.
### Kimai

PHP-Apache + MariaDB. Au repos comparable à EspoCRM. Export de
feuilles de temps en masse ou rendu de factures de fin de mois
pousse à ~500 Mo et ~35 % CPU sur un vCPU pendant un court instant.
Estimation prudente pré-lancement, pas encore une mesure réelle.
### Invoice Ninja

Quatre conteneurs : PHP-FPM + nginx + MariaDB + Redis. RAM au
repos plus élevée que Kimai car supervisord exécute à la fois le
worker de file et le planificateur dans le conteneur app. Le pic
arrive lors de génération de factures en masse ou de rattrapage
de file après une coupure réseau (Chromium intégré démarre pour
le rendu PDF). Estimation prudente pré-lancement, pas encore une
mesure réelle.
### Serveur de courriel + webmail

docker-mailserver (Postfix + Dovecot + Rspamd + Fail2ban) domine ;
Rspamd et ses statistiques sur Redis représentent l'essentiel de
l'empreinte au repos. Roundcube (Apache + PHP, préférences SQLite)
ajoute ~120 Mo ; le nginx mta-sts est négligeable (~5 Mo). Le pic
survient lors d'une synchro de boîtes + une rafale d'analyse
antipourriel sur une fenêtre entrante chargée. Le disque de base
exclut le courriel stocké (qui grossit avec les boîtes).
Coût d'infrastructure NON compté ici : le ClamAV intégré est
DÉSACTIVÉ ; l'antivirus est le clamd PARTAGÉ géré par l'opérateur
(réseau catena-clamav), qui garde sa base de signatures en mémoire
à ~1,5 Go. Ce clamd est un service distinct (hors de ce compose),
donc il n'apparaît pas dans ces chiffres par modèle -- à budgéter
une fois au niveau du VPS. Le même clamd sert aussi Nextcloud, donc
déployer les deux ensemble est une économie nette par rapport à
deux clamd. Estimation prudente pré-lancement, pas encore mesurée.

---

Un palier autre que celui initialement provisionné est disponible
sur demande -- un changement de palier est
une migration en une commande vers un nouveau VPS avec les mêmes
données.
