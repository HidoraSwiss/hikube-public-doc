---
sidebar_position: 6
title: FAQ
---

# FAQ — API publique

### L'API est-elle prête pour la production ?

Elle est en **préversion** (`v1alpha1`) : les chemins, les champs et l'URL publique peuvent encore évoluer. Vous pouvez l'utiliser pour vos automatisations, à condition de suivre ses évolutions dans le [changelog](/blog).

---

### Comment obtenir une clé d'API ?

La gestion des clés arrive bientôt dans la console. En attendant, un administrateur du projet ou de l'organisation la demande au [support](mailto:support@hidora.io), en précisant le nom, les scopes et la durée de validité souhaités (voir [Obtenir une clé](./authentication.md#obtenir)).

---

### Où trouver l'identifiant de mon projet ?

La console ne l'affiche pas encore. Il vous est communiqué avec la clé d'API. C'est un UUID, distinct du nom du projet et de l'**ID de l'Organisation** affiché dans **Mon Compte**.

---

### Puis-je utiliser une même clé pour plusieurs projets ?

Non. Une clé est rattachée à un seul projet et toute requête visant un autre projet est refusée. Utilisez une clé par projet.

---

### Puis-je créer une clé d'API avec une autre clé d'API ?

Non. La gestion des clés est réservée aux administrateurs, depuis leur session dans la console : une clé ne peut ni créer ni révoquer de clé. Cela empêche une clé compromise de se recréer des accès.

---

### Quel scope choisir ?

`read` pour consulter (inventaire, supervision), `admin` pour créer, modifier ou supprimer des ressources (déploiement). Voir [Scopes](./authentication.md#scopes).

---

### Pourquoi une clé ne peut-elle pas être illimitée ?

Une clé oubliée ou divulguée finit ainsi par expirer d'elle-même. La durée maximale est d'un an (`365d`) ; prévoyez le remplacement des clés de vos intégrations avant leur expiration.

---

### J'ai perdu le secret de ma clé. Peut-on me le renvoyer ?

Non. Hikube ne conserve qu'une empreinte du secret, qui n'est affiché qu'à la création. Faites révoquer la clé perdue et créer une nouvelle clé.

---

### Ma clé a fuité. Que faire ?

Faites-la **révoquer immédiatement** (via le support, en attendant la console) en donnant son `keyId`, jamais le secret. La révocation prend effet dès la requête suivante. Créez ensuite une nouvelle clé et cherchez où l'ancienne a pu être utilisée.

---

### Toutes mes requêtes renvoient `403` avec le code `10002`. Pourquoi ?

Cette réponse unique couvre tous les refus : clé invalide, expirée ou révoquée, mauvais identifiant de projet, scope insuffisant, ou opération non accessible aux clés. Voir [Accès refusé](./errors.md#acces-refuse).

---

### Toutes les opérations de la console sont-elles disponibles dans l'API ?

Non. L'API couvre les ressources des projets (VM, disques, buckets, Kubernetes, réseau, bases de données, RabbitMQ) et les catalogues. La gestion du compte, de l'organisation, des projets, des membres et des clés reste dans la console. La [référence de l'API](./reference/hikube-api.info.mdx) liste exactement les opérations disponibles.

---

### Existe-t-il un client officiel ou un provider Terraform ?

Pas encore. Vous pouvez générer un client dans votre langage depuis la [spécification OpenAPI](pathname:///openapi/hikube-public.swagger.json). Un provider Terraform fondé sur l'API publique est envisagé (voir [Terraform](../tools/terraform.md)).

---

### L'API impose-t-elle un nombre maximal de requêtes ?

La préversion ne documente pas de limite de débit. Évitez néanmoins d'interroger l'état d'une ressource en boucle serrée : un intervalle de quelques secondes entre deux `GET` suffit pour suivre une création.
