---
title: "Comment choisir votre outil de réservation"
description: "Arbre de décision pour choisir la bonne application open-source de réservation pour votre entreprise : prises de rendez-vous clients, réservation de ressources, sondages de groupe, événements publics, inscriptions aux classes, ou calendrier interne."
---

Les besoins en réservation sont trop variés pour qu'une seule application par défaut convienne à toutes les entreprises. Ce guide parcourt un court arbre de décision, puis recommande une application à déployer sur votre serveur.

## Que voulez-vous gérer ?

Choisissez la ligne qui correspond à votre situation. Chaque branche aboutit à une application recommandée et son guide d'installation.

### Des clients qui réservent du temps avec mon équipe (clinique, salon, atelier, cours)

**Recommandé :** [Easy!Appointments](/apps/easyappointments/).

Une page de réservation publique ; calendriers indépendants par prestataire ; rappels par courriel ; export ICS. Connexion locale du personnel (pas de SSO côté upstream pour l'instant).

### Juste moi qui prends les réservations (un seul prestataire, payant ou non)

**Recommandé :** [cal.diy](/apps/cal-diy/).

Page de réservation mono-prestataire avec paiements Stripe natifs, un magasin d'apps calendrier (Google / Outlook / Apple / CalDAV), et un parcours de réservation client soigné. Version auto-hébergée de Cal.com.

### Réserver des salles, du matériel, ou d'autres ressources partagées

**Recommandé :** LibreBooking.

La réservation de ressources est une voie étroite dans le segment PME. Parlez à votre opérateur du besoin concret pour que le picker vous y dirige.

### Trouver un moment de réunion à plusieurs, ponctuel

**Recommandé :** [Nextcloud Polls](/nextcloud-apps-vs-suite/).

Nextcloud Polls couvre le besoin -- sélecteurs de date et sondages à choix multiples avec un lien public, sans compte requis pour les participants. Activez l'application sous Applications -> Vos applications dans Nextcloud.

### Inscription aux événements publics / annuaire d'événements communautaires

**Recommandé :** Mobilizon ou Gancio.

Deux candidats : Mobilizon pour les organisations multi-régions fédérées ; Gancio pour les annuaires hyperlocaux. Parlez à votre opérateur pour que le picker livre le bon outil.

### Inscriptions aux classes / cohortes (yoga, cours, fitness)

**Recommandé :** [Easy!Appointments en mode groupe](/apps/easyappointments/).

Easy!Appointments gère les séances de groupe d'emblée ; même configuration que le flux réservations clients, avec capacité par créneau.

### Calendrier interne du personnel uniquement (pas de page client)

**Recommandé :** [Calendrier EspoCRM](/apps/espocrm/).

Déjà dans la suite via le CRM. Pas besoin d'un outil séparé.

### Je ne suis pas certain / aucune des options

Parlez à votre opérateur. Les besoins en réservation varient ; un appel de 30 minutes clarifie votre cas plus vite qu'une liste de cases à cocher.
