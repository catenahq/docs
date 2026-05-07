---
title: "Comment choisir votre outil de réservation"
description: "Arbre de décision pour choisir la bonne application open-source de réservation pour votre entreprise : prises de rendez-vous clients, réservation de ressources, sondages de groupe, événements publics, inscriptions aux classes, ou calendrier interne."
---

Les besoins en réservation sont trop variés pour qu'une seule application par défaut convienne à toutes les entreprises. Ce guide parcourt un court arbre de décision, puis recommande une application à déployer sur votre serveur. La v1 livre **Easy!Appointments** pour les prises de rendez-vous clients ; les autres branches arriveront au fil des demandes réelles.

## Que voulez-vous gérer ?

Choisissez la ligne qui correspond à votre situation. Chaque branche aboutit à une application recommandée et son guide d'installation.

### Des clients qui réservent du temps avec mon équipe (clinique, salon, atelier, cours)

**Recommandé :** [Easy!Appointments](/docs/fr/apps/easyappointments/) (livré).

Une page de réservation publique ; calendriers indépendants par prestataire ; rappels par courriel ; export ICS. Connexion locale du personnel (pas de SSO côté upstream pour l'instant).

### Juste moi qui prends les réservations (un seul prestataire, payant ou non)

**Recommandé :** Easy!Appointments mono-prestataire (livré ; réservations payantes en feuille de route).

Même application, configurée pour un prestataire. Les réservations payantes via Stripe utilisent un petit pont en attendant que cal.diy se stabilise upstream ; parlez à votre opérateur si le paiement est bloquant pour votre lancement.

### Réserver des salles, du matériel, ou d'autres ressources partagées

**Recommandé :** LibreBooking (à venir lors d'une demande réelle).

La réservation de ressources est une voie étroite dans le segment PME. Contactez-nous si vous avez un besoin concret ; le picker vous y dirigera dès que l'entrée au catalogue arrive.

### Trouver un moment de réunion à plusieurs, ponctuel

**Recommandé :** Rallly (à venir lors d'une demande réelle).

Pour les sondages d'équipe internes, Nextcloud Polls couvre déjà le besoin. Rallly comble la zone où des participants externes sans compte doivent voter sur un moment de rencontre.

### Inscription aux événements publics / annuaire d'événements communautaires

**Recommandé :** Mobilizon ou Gancio (à venir lors d'une demande réelle).

Deux candidats : Mobilizon pour les organisations multi-régions fédérées ; Gancio pour les annuaires hyperlocaux. Contactez-nous pour que le picker livre le bon outil.

### Inscriptions aux classes / cohortes (yoga, cours, fitness)

**Recommandé :** [Easy!Appointments en mode groupe](/docs/fr/apps/easyappointments/) (livré).

Easy!Appointments gère les séances de groupe d'emblée ; même configuration que le flux réservations clients, avec capacité par créneau.

### Calendrier interne du personnel uniquement (pas de page client)

**Recommandé :** [Calendrier EspoCRM](/docs/fr/apps/espocrm/) (livré).

Déjà dans la suite via le CRM. Pas besoin d'un outil séparé.

### Je ne suis pas certain / aucune des options

Parlez à votre opérateur. Les besoins en réservation varient ; un appel de 30 minutes clarifie votre cas plus vite qu'une liste de cases à cocher.
