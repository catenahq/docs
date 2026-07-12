---
title: Modèle de sécurité
description: Les frontières que la suite défend, ce que nous garantissons à chacune, et ce que nous laissons délibérément hors de portée.
---

Voici le résumé public du modèle de menaces que nous maintenons à
l'interne. Il énonce contre quoi nous défendons et comment, sans
publier une carte de la surface d'attaque. Chaque garantie est
exercée par les [répétitions automatisées](/fr/trust/what-we-test/) et
les barrières décrites dans [Comment nous validons](/fr/trust/how-we-validate/).

## Qui détient les clés

Vous. Les sauvegardes sont chiffrées **sur votre serveur, avant que
quoi que ce soit en sorte**, et aboutissent dans un stockage objet
sous votre propre compte. Le trousseau de reprise (une poignée
d'identifiants documentés à l'intégration) vit dans votre
gestionnaire de mots de passe -- avec lui, votre serveur entier se
reconstruit à partir de zéro; sans lui, personne ne peut lire vos
sauvegardes, nous y compris. Le trousseau est délibérément à
connaissance nulle : le perdre alors que le serveur est aussi disparu
est irrécupérable par conception, d'où l'insistance sur le
gestionnaire de mots de passe à l'intégration.

## Ce que le serveur expose

Rien d'inutile. Le trafic web entre par un tunnel chiffré, la machine
elle-même n'a donc aucun port web ouvert; l'administration à distance
passe par un réseau privé, pas par l'internet public; la seule
exception est le relais média audio/vidéo, qui a besoin de chemins de
paquets directs pour fonctionner. Un balayage externe fait partie de
la validation et la fait échouer si quoi que ce soit d'inattendu
répond.

## Qui peut se connecter où

Un compte par personne, par la connexion unique de la suite, avec
authentification multifacteur disponible et contrôle d'accès par
application appliqué **en amont** des applications. Les surfaces
administratives exigent en plus le rôle d'administrateur; les comptes
du personnel ne peuvent pas les atteindre, et des répétitions
vérifient exactement cela.

## Ce qu'un rançongiciel peut et ne peut pas faire

Un attaquant qui contrôle entièrement votre serveur détient les
identifiants du stockage de sauvegarde en direct -- la conception
suppose donc que cette copie peut être détruite. La seconde copie hors
site (Catena Pro) est écrite de façon additive chez un fournisseur
différent avec verrouillage en écriture : rien de ce qui se passe sur
le serveur ne peut modifier ou effacer ce qui s'y trouve déjà, et la
restaurabilité des deux copies est vérifiée selon un calendrier.

## Que se passe-t-il si le pire arrive

La reprise est une procédure répétée, pas une improvisation :
reconstruire le serveur à partir de la sauvegarde et du trousseau,
restaurer sur place, ou migrer entièrement chez un autre fournisseur.
Les trois chemins sont exercés en continu, y compris à travers les
versions majeures du système d'exploitation et de la base de données.

## Ce que nous ne prétendons pas

L'honnêteté sur la portée fait partie du modèle. Nous ne défendons pas
contre une compromission des fournisseurs infonuagiques eux-mêmes
(atténuée par la séparation des fournisseurs, acceptée comme risque
résiduel), et la conformité légale est auditée par des personnes, pas
imposée par du code. Quand un contrôle relève de la politique plutôt
que du logiciel, nous le disons.
