---
title: Redis sur Hikube
---

# Redis - Cache et base de données en mémoire

**Redis** sur Hikube offre une base de données en mémoire haute performance pour le cache, les sessions et les données temps réel. Ce service vous permet d'accélérer vos applications avec un cache distribué et persistant.

---

## Qu'est-ce que Redis ?

Redis est une base de données en mémoire qui peut servir de cache, de broker de messages et de base de données. Sur Hikube, Redis est déployé avec haute disponibilité et persistance automatique.

### Avantages sur Hikube

- **⚡ Performance** : Accès en mémoire ultra-rapide
- **🔒 Haute disponibilité** : Réplication automatique
- **💾 Persistance** : Sauvegarde automatique des données
- **📈 Scalabilité** : Cluster Redis automatique
- **🔧 Simplicité** : Configuration déclarative
- **📊 Monitoring** : Métriques intégrées

### Cas d'usage

- **Cache applicatif** : Accélération des requêtes
- **Sessions** : Stockage des sessions utilisateurs
- **Queue de messages** : Communication inter-services
- **Real-time data** : Données temps réel
- **Rate limiting** : Limitation de débit
- **Leaderboards** : Classements en temps réel

---

## Architecture

```
┌─────────────────────────────────────┐
│         Application Layer           │
├─────────────────────────────────────┤
│         Redis Client                │
├─────────────────────────────────────┤
│  Master │ Replica 1 │ Replica 2    │
├─────────────────────────────────────┤
│         Storage Layer               │
│    (Persistent Volumes)             │
└─────────────────────────────────────┘
```

### Composants

- **Redis Master** : Instance principale en écriture
- **Redis Replicas** : Instances en lecture seule
- **Sentinel** : Monitoring et failover automatique
- **Storage** : Volumes persistants pour les données
- **Client** : Connexions depuis les applications

---

## Fonctionnalités Redis

### Types de données

- **Strings** : Valeurs simples
- **Lists** : Listes ordonnées
- **Sets** : Ensembles uniques
- **Sorted Sets** : Ensembles triés
- **Hashes** : Objets clé-valeur
- **Streams** : Flux de données temps réel

### Fonctionnalités avancées

- **Pub/Sub** : Communication asynchrone
- **Transactions** : Opérations atomiques
- **Lua Scripting** : Scripts personnalisés
- **Modules** : Extensions Redis
- **Clustering** : Distribution automatique

---

## Comparaison avec d'autres solutions

| Fonctionnalité | Redis Hikube | AWS ElastiCache | GCP Memorystore | Azure Cache |
|----------------|---------------|-----------------|-----------------|-------------|
| **Performance** | ⚡ Ultra-rapide | ⚡ Ultra-rapide | ⚡ Ultra-rapide | ⚡ Ultra-rapide |
| **Setup** | ⚡ Instantané | ⚡ Instantané | ⚡ Instantané | ⚡ Instantané |
| **Coût** | 💰 Prévisible | 💰 Variable | 💰 Variable | 💰 Variable |
| **K8s Integration** | ✅ Native | ⚠️ Partielle | ⚠️ Partielle | ⚠️ Partielle |
| **Monitoring** | 📊 Intégré | 📊 CloudWatch | 📊 Cloud Monitoring | 📊 Azure Monitor |
| **Persistence** | 💾 Automatique | 💾 Configurable | 💾 Configurable | 💾 Configurable |

---

## Intégration avec l'écosystème Hikube

### Kubernetes

Redis s'intègre parfaitement avec Kubernetes :

- **Custom Resources** : Définition déclarative
- **Operators** : Gestion automatique
- **Services** : Découverte de service automatique
- **Secrets** : Gestion sécurisée des credentials
- **ConfigMaps** : Configuration centralisée

### Applications

Intégration avec les autres services Hikube :

- **PostgreSQL** : Cache de requêtes
- **Kubernetes** : Sessions et cache
- **Applications** : Cache applicatif
- **Monitoring** : Métriques et alertes

---

## Exemples d'usage

### Cache simple

```python
import redis

# Connexion à Redis
r = redis.Redis(
    host='redis-mon-app.default.svc.cluster.local',
    port=6379,
    db=0
)

# Stocker une valeur
r.set('user:123', '{"name": "Alice", "email": "alice@example.com"}')

# Récupérer une valeur
user_data = r.get('user:123')
print(user_data)
```

### Cache avec expiration

```python
import redis
import json

r = redis.Redis(host='redis-mon-app.default.svc.cluster.local', port=6379)

# Cache avec TTL (Time To Live)
# Exemple de fonction get_user(user_id):
# 1. Essayer de récupérer du cache
cached_user = r.get('user:123')
if cached_user:
    user_data = json.loads(cached_user)
    print("User from cache:", user_data)

# 2. Si pas en cache, récupérer depuis la DB
# user = fetch_user_from_database(user_id)

# 3. Stocker en cache pour 1 heure
r.setex('user:123', 3600, json.dumps({'name': 'Alice', 'email': 'alice@example.com'}))
```

### Session management

```python
import redis
import uuid

r = redis.Redis(host='redis-mon-app.default.svc.cluster.local', port=6379)

# Exemple de gestion de sessions
# Créer une session
session_id = str(uuid.uuid4())
session_data = {
    'user_id': 123,
    'created_at': time.time(),
    'last_activity': time.time()
}

# Stocker la session pour 1 heure
r.setex(f'session:{session_id}', 3600, json.dumps(session_data))

# Récupérer une session
session_data = r.get(f'session:{session_id}')
if session_data:
    session = json.loads(session_data)
    # Mettre à jour l'activité
    session['last_activity'] = time.time()
    r.setex(f'session:{session_id}', 3600, json.dumps(session))
    print("Session active:", session)
```

### Rate limiting

```python
import redis
import time

r = redis.Redis(host='redis-mon-app.default.svc.cluster.local', port=6379)

# Exemple de rate limiting
# Rate limiting: max_requests requêtes par window secondes
key = 'rate_limit:user123'
current_time = int(time.time())

# Ajouter la requête actuelle
r.zadd(key, {str(current_time): current_time})

# Supprimer les anciennes requêtes
r.zremrangebyscore(key, 0, current_time - 3600)

# Compter les requêtes dans la fenêtre
request_count = r.zcard(key)

if request_count > 100:
    print("Rate limit dépassé")
else:
    print("Requête autorisée")
    # Définir l'expiration de la clé
    r.expire(key, 3600)
```

### Pub/Sub

```python
import redis
import json
import threading

r = redis.Redis(host='redis-mon-app.default.svc.cluster.local', port=6379)

# Publisher - Exemple de publication d'événement
message = {
    'type': 'user_login',
    'data': {'user_id': 123, 'ip': '192.168.1.1'},
    'timestamp': time.time()
}
r.publish('events', json.dumps(message))

# Subscriber - Exemple de réception d'événements
pubsub = r.pubsub()
pubsub.subscribe('events')

# Écouter les messages
for message in pubsub.listen():
    if message['type'] == 'message':
        event = json.loads(message['data'])
        print(f"Received event: {event}")
```

### Leaderboard

```python
import redis

r = redis.Redis(host='redis-mon-app.default.svc.cluster.local', port=6379)

# Exemple de leaderboard
leaderboard_name = 'game_scores'

# Ajouter des scores
r.zadd(leaderboard_name, {'user1': 1000, 'user2': 1500, 'user3': 800})

# Obtenir le rang d'un utilisateur (1-based)
rank = r.zrevrank(leaderboard_name, 'user2')
if rank is not None:
    print(f"User2 rank: {rank + 1}")

# Obtenir les meilleurs utilisateurs
top_users = r.zrevrange(leaderboard_name, 0, 4, withscores=True)
for user_id, score in top_users:
    print(f"User {user_id}: {score} points")

# Obtenir le score d'un utilisateur
score = r.zscore(leaderboard_name, 'user1')
print(f"User1 score: {score}")
```

---

## Prochaines étapes

1. **[Démarrage rapide](quick-start.md)** : Déployez Redis en 5 minutes
2. **[Référence API](api-reference.md)** : Tous les paramètres disponibles
3. **[Tutoriels](tutorials/)** : Guides avancés
4. **[Dépannage](troubleshooting.md)** : Solutions aux problèmes courants
5. **[Patterns](patterns/)** : Patterns d'utilisation courants
6. **[Optimisation](optimization/)** : Techniques d'optimisation 