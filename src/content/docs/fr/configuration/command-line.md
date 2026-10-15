---
title: "Ligne de commande"
description: "Lancez n'importe quelle action du panneau d'administration depuis le serveur, par SSH, avec catena-panel : lister les actions, passer des arguments, confirmer, lire le JSON, donner les secrets sur l'entrée standard et retrouver l'exécution dans le journal d'audit."
---

Chaque action qu'offre le [tableau de bord d'administration](/fr/features/admin-dashboard/) peut aussi se lancer depuis la ligne de commande du serveur. La ligne de commande exécute la même action que le bouton du panneau : mêmes vérifications (votre abonnement, les arguments de l'action, la confirmation) et même enregistrement d'audit.

Vous la lancez en tant que root, par SSH, avec `catena-panel`. Connectez-vous en tant que `ops` (voir [SSH vers le serveur en tant que ops](/fr/configuration/admin-access/#ssh-vers-le-serveur-en-tant-que-ops)) et placez `sudo` devant :

```bash
sudo catena-panel <commande> [--<argument>=<valeur> ...]
```

`catena-panel` exécute l'action dans le panneau en cours d'exécution. Si le panneau ne tourne pas, la commande s'arrête avec le code de sortie 2 et le message "no task of the catena-admin service runs on this server". Lancez `docker service ps catena-admin` pour en voir la raison. Lancez `sudo catena-panel` sans commande pour afficher l'aide.

## Lister les actions

```bash
sudo catena-panel --list
```

Chaque ligne est une action. La marque `(job)` désigne une action qui s'exécute un certain temps et diffuse sa sortie. La marque `(read-only)` désigne une action qui ne change rien. Sous chaque action, une ligne par argument donne son nom et son genre (`text`, `secret`, `bool`, `int`, `enum`, `list` ou `file`), puis `required`, les choix d'un `enum` (`one of a|b`) ou le maximum qu'accepte une `list` (`at most 5`). La liste ne montre que les actions que votre abonnement débloque.

## Passer des arguments

Écrivez chaque argument sous la forme `--<nom>=<valeur>` :

```bash
sudo catena-panel <commande> --nom=valeur
```

- Répétez un argument `list` une fois par valeur : `--app=une --app=deux`.
- Un argument `bool` écrit seul, comme `--confirm`, signifie oui.
- Un argument absent de la liste, ou une valeur du mauvais genre, est refusé et rien ne s'exécute. Le message nomme l'argument, jamais sa valeur.

## Confirmer une action

Une action qui demande une confirmation, comme la case de confirmation du panneau, indique `confirm: bool, required` parmi ses arguments. Sans cet argument, elle est refusée ("the command runs only once confirmed") et rien ne s'exécute. Ajoutez `--confirm` pour la lancer :

```bash
sudo catena-panel <commande> --confirm
```

## Donner un secret ou un fichier

Un secret ne se place jamais dans un argument : la liste des processus du serveur l'afficherait, et la commande refuse `--<nom>=<valeur>` pour un argument secret. Écrivez les arguments sous la forme d'un objet JSON dans un fichier que vous seul pouvez lire, et donnez ce fichier sur l'entrée standard avec `--args-stdin` :

```bash
sudo catena-panel <commande> --args-stdin < arguments.json
```

L'objet contient les arguments par nom, chacun une chaîne, un nombre, `true` ou `false`, ou une liste de ces valeurs :

```json
{"password": "le secret", "app": ["une", "deux"]}
```

Supprimez le fichier une fois l'action exécutée.

Un argument du genre `file` reçoit le fichier sur l'entrée standard avec `--file-stdin`. Le fichier garde le nom de l'argument, sauf si vous en donnez un autre : `--file-stdin=backup.tar`.

```bash
sudo catena-panel <commande> --file-stdin < le-fichier
```

`--args-stdin` et `--file-stdin` ne s'emploient pas ensemble, parce que l'entrée standard n'en porte qu'un. Passez les autres arguments comme options.

Quand une action rend un secret, comme un nouveau mot de passe, la commande l'affiche une seule fois parmi les lignes du résultat. Le journal d'audit et l'action en cours ne le conservent jamais.

## Lire le résultat

Une action qui répond tout de suite affiche une ligne `clé: valeur` pour son code, son détail et chacune de ses données, et se termine avec le code 0 si elle a réussi et 1 sinon. Une action absente de votre liste (inconnue, ou verrouillée par votre abonnement) se termine avec le code 1. Une erreur dans la commande elle-même, comme une option inconnue, se termine avec le code 2 et affiche l'aide.

Ajoutez `--json` pour afficher ce même résultat, ou la liste, en JSON. Un résultat comporte `code`, `ok`, `detail`, `data`, `secret` et `rc`.

```bash
sudo catena-panel <commande> --json
```

## Actions longues

Une action marquée `(job)` démarre tout de suite et affiche sa sortie à mesure qu'elle arrive, les erreurs sur la sortie d'erreur. La commande se termine avec le code de sortie de l'action. Le code 2 signifie aussi que la commande n'a pas pu joindre le panneau ou lire sa réponse. Avec `--json`, la commande n'affiche rien avant la fin de l'action, puis un seul objet contenant `job`, `lines` et `result`.

L'action s'exécute dans le panneau, que quelqu'un regarde sa sortie ou non. Si votre session SSH tombe, l'action continue et le journal d'audit consigne sa fin. La ligne de commande ne peut pas se rattacher à l'action : la sortie affichée après la coupure est perdue pour votre terminal. Pour conserver la sortie d'une action longue quand votre connexion est instable, lancez-la dans `tmux` ou `screen`.

## Le journal d'audit

Une action qui modifie le serveur laisse un enregistrement dans le journal d'audit, comme un clic dans le panneau. L'enregistrement nomme l'action, la personne, l'adresse et le code de sortie, et porte le canal par lequel elle est passée : `cli` pour la ligne de commande, `panel` pour le navigateur. Les actions en lecture seule ne laissent aucun enregistrement. Le panneau **Journal d'audit** (Catena Business) montre les enregistrements; voir [Personnes et piste d'audit](/fr/features/single-sign-on/#personnes-et-piste-daudit).

L'enregistrement porte le courriel d'administration de votre serveur. Pour consigner une autre personne, ajoutez `--as` :

```bash
sudo catena-panel <commande> --as=quelquun@yourdomain.com
```

`--as` nomme la personne dans l'enregistrement; il ne vérifie pas qui vous êtes. Quiconque peut lancer `sudo catena-panel` est déjà root sur le serveur.

## Voir aussi

- [Tableau de bord d'administration](/fr/features/admin-dashboard/)
- [Accès administrateur et réseau privé](/fr/configuration/admin-access/)
- [Paramètres du serveur](/fr/configuration/server/)
