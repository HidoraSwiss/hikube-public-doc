---
title: Console Hikube v1.5.1
authors: [hikube]
tags: [release]
---

La console accompagne l'API v1.7.1. Elle devient plus accessible, au clavier comme avec un lecteur d'écran, et s'affiche mieux sur petit écran. Le thème peut suivre celui du système, et la console garde moins de données dans le navigateur.

<!-- truncate -->

## Ajouté

- **Thème** — Le menu de thème propose **Clair**, **Sombre** ou **Système**. En mode **Système**, la console suit le thème de l'ordinateur, y compris quand il change, et un changement fait dans un onglet s'applique aux autres onglets ouverts.

- **GPU** — Le GPU NVIDIA L4 se choisit dans les assistants de création des instances VM et des clusters Kubernetes.

## Modifié

Ces changements modifient un comportement existant de la console.

- **Formulaires** — Une erreur de saisie s'affiche une fois le champ quitté, et non plus dès la première lettre tapée. Elle disparaît dès la correction. Les messages d'erreur sont liés à leur champ, et les champs obligatoires sont annoncés par les lecteurs d'écran.

- **Navigation** — Les actions qui mènent à une page, comme **Voir** et **Modifier** dans les listes, sont de vrais liens : le clic du milieu et **Ouvrir dans un nouvel onglet** fonctionnent.

- **Accessibilité** — Chaque page a son propre titre d'onglet. Les zones de navigation, l'état des menus et les étapes des assistants sont annoncés par les lecteurs d'écran, comme les actions en cours. Le contraste et le contour de focus sont renforcés, les infobulles s'ouvrent au clavier et au toucher, et les textes suivent la taille de police réglée dans le navigateur.

- **Petits écrans** — Sur un écran étroit, les tableaux des membres, des invitations, des liaisons de rôles SSO et des clés d'API passent en disposition empilée, sans défilement horizontal. La hauteur des pages tient compte des barres du navigateur mobile.

- **Thème sombre** — Les barres de défilement, les listes déroulantes, les sélecteurs de date et les champs remplis automatiquement par le navigateur suivent le thème sombre.

- **Performance** — Les pages se chargent plus vite, et les mises à jour périodiques s'arrêtent tant que l'onglet est masqué.

## Corrigé

- **Console d'instance** — En plein écran, les fenêtres de dialogue, les notifications et les infobulles s'affichent par-dessus la console.

- **Instances VM** — La fenêtre qui affiche une seule fois le mot de passe Windows ne se ferme plus avec la touche Échap.

## Sécurité

- **Console** — Les brouillons des assistants, mots de passe d'initialisation compris, restent en mémoire et ne sont plus écrits dans le stockage du navigateur, sauf le temps d'un changement de langue. Le fichier kubeconfig n'est plus gardé en cache. Une déconnexion efface les données du site dans le navigateur.

- **Console** — La politique de sécurité du contenu est resserrée, et la console est isolée des autres sites. Les mesures de performance n'envoient plus les noms des organisations, des projets ni des ressources.
