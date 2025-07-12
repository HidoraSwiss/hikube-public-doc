---
title: MySQL sur Hikube
---

# MySQL - Base de données relationnelle

**MySQL** sur Hikube offre une base de données relationnelle robuste et performante pour vos applications. Ce service vous permet de déployer MySQL avec haute disponibilité, sauvegardes automatiques et monitoring intégré.

---

## Qu'est-ce que MySQL ?

MySQL est une base de données relationnelle open-source qui est largement utilisée pour les applications web et les systèmes de gestion de contenu. Sur Hikube, MySQL est déployé avec réplication automatique et haute disponibilité.

### Avantages sur Hikube

- **🔒 Haute disponibilité** : Réplication automatique
- **💾 Persistance** : Stockage persistant intégré
- **📈 Scalabilité** : Scaling horizontal et vertical
- **🔧 Simplicité** : Configuration déclarative
- **📊 Monitoring** : Métriques et alertes intégrées
- **🔄 Backup** : Sauvegardes automatiques

### Cas d'usage

- **Applications web** : Sites web dynamiques
- **CMS** : WordPress, Drupal, Joomla
- **E-commerce** : Boutiques en ligne
- **Analytics** : Données analytiques
- **Reporting** : Rapports et tableaux de bord
- **Legacy applications** : Applications existantes

---

## Architecture

```
┌─────────────────────────────────────┐
│         Application Layer           │
├─────────────────────────────────────┤
│         MySQL Client                │
├─────────────────────────────────────┤
│  Primary │ Replica 1 │ Replica 2   │
├─────────────────────────────────────┤
│         Storage Layer               │
│    (Persistent Volumes)             │
└─────────────────────────────────────┘
```

### Composants

- **MySQL Primary** : Instance principale en écriture
- **MySQL Replicas** : Instances en lecture seule
- **Proxy** : Répartition de charge
- **Storage** : Volumes persistants pour les données
- **Client** : Connexions depuis les applications

---

## Fonctionnalités MySQL

### Moteurs de stockage

- **InnoDB** : Moteur transactionnel par défaut
- **MyISAM** : Moteur pour tables de lecture
- **Memory** : Tables en mémoire
- **Archive** : Compression pour archives
- **CSV** : Tables au format CSV

### Fonctionnalités avancées

- **Transactions** : Support ACID complet
- **Foreign Keys** : Intégrité référentielle
- **Triggers** : Automatisation des actions
- **Stored Procedures** : Logique métier
- **Views** : Vues personnalisées
- **Partitioning** : Partitionnement des tables

---

## Comparaison avec d'autres solutions

| Fonctionnalité | MySQL Hikube | AWS RDS | GCP Cloud SQL | Azure MySQL |
|----------------|---------------|---------|---------------|-------------|
| **Performance** | ⚡ Optimisé | ⚡ Optimisé | ⚡ Optimisé | ⚡ Optimisé |
| **Setup** | ⚡ Instantané | ⚡ Instantané | ⚡ Instantané | ⚡ Instantané |
| **Coût** | 💰 Prévisible | 💰 Variable | 💰 Variable | 💰 Variable |
| **K8s Integration** | ✅ Native | ⚠️ Partielle | ⚠️ Partielle | ⚠️ Partielle |
| **Monitoring** | 📊 Intégré | 📊 CloudWatch | 📊 Cloud Monitoring | 📊 Azure Monitor |
| **Backup** | 🔄 Automatique | 🔄 Automatique | 🔄 Automatique | 🔄 Automatique |

---

## Intégration avec l'écosystème Hikube

### Kubernetes

MySQL s'intègre parfaitement avec Kubernetes :

- **Custom Resources** : Définition déclarative
- **Operators** : Gestion automatique
- **Services** : Découverte de service automatique
- **Secrets** : Gestion sécurisée des credentials
- **ConfigMaps** : Configuration centralisée

### Applications

Intégration avec les autres services Hikube :

- **Redis** : Cache de requêtes
- **Kubernetes** : Applications conteneurisées
- **Buckets** : Sauvegardes et exports
- **Monitoring** : Métriques et alertes

---

## Exemples d'usage

### Connexion simple

```python
import mysql.connector

# Connexion à MySQL
config = {
    'host': 'mysql-mon-app.default.svc.cluster.local',
    'port': 3306,
    'user': 'admin',
    'password': 'mon-mot-de-passe-securise',
    'database': 'monapp'
}

conn = mysql.connector.connect(**config)
cursor = conn.cursor()

# Exécuter une requête
cursor.execute("SELECT * FROM users")
users = cursor.fetchall()

for user in users:
    print(f"User: {user}")

cursor.close()
conn.close()
```

### ORM avec SQLAlchemy

```python
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Configuration de la connexion
DATABASE_URL = "mysql+pymysql://admin:mon-mot-de-passe-securise@mysql-mon-app.default.svc.cluster.local:3306/monapp"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Exemple de définition du modèle User
# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(100), nullable=False)
#     email = Column(String(255), unique=True, nullable=False)
#     created_at = Column(DateTime, default=datetime.utcnow)

# Créer les tables
Base.metadata.create_all(bind=engine)

# Utilisation
db = SessionLocal()

# Créer un utilisateur (exemple)
# new_user = User(name="Alice Dupont", email="alice@example.com")
# db.add(new_user)
# db.commit()

# Récupérer tous les utilisateurs (exemple)
# users = db.query(User).all()
# for user in users:
#     print(f"User: {user.name} ({user.email})")

db.close()
```

### Migration avec Alembic

```python
# alembic.ini
[alembic]
script_location = alembic
sqlalchemy.url = mysql+pymysql://admin:mon-mot-de-passe-securise@mysql-mon-app.default.svc.cluster.local:3306/monapp

# env.py
from alembic import context
from sqlalchemy import engine_from_config, pool
from logging.config import fileConfig
from models import Base

config = context.config
fileConfig(config.config_file_name)
target_metadata = Base.metadata

# Exemple de configuration run_migrations_online():
# connectable = engine_from_config(
#     config.get_section(config.config_ini_section),
#     prefix="sqlalchemy.",
#     poolclass=pool.NullPool,
# )
# with connectable.connect() as connection:
#     context.configure(
#         connection=connection,
#         target_metadata=target_metadata
#     )
#     with context.begin_transaction():
#         context.run_migrations()

# Créer une migration
# alembic revision --autogenerate -m "Add users table"

# Appliquer les migrations
# alembic upgrade head
```

### Requêtes complexes

```sql
-- Jointures
SELECT 
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id, u.name, u.email
HAVING total_spent > 100
ORDER BY total_spent DESC;

-- Sous-requêtes
SELECT 
    category,
    AVG(price) as avg_price,
    COUNT(*) as product_count
FROM products
WHERE category IN (
    SELECT DISTINCT category 
    FROM products 
    WHERE price > 50
)
GROUP BY category;

-- Vues
CREATE VIEW user_summary AS
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as total_orders,
    SUM(o.total) as total_spent,
    MAX(o.created_at) as last_order
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name, u.email;

-- Procédures stockées
DELIMITER //
CREATE PROCEDURE GetUserStats(IN user_id INT)
BEGIN
    SELECT 
        u.name,
        u.email,
        COUNT(o.id) as order_count,
        SUM(o.total) as total_spent,
        AVG(o.total) as avg_order_value
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.id = user_id
    GROUP BY u.id, u.name, u.email;
END //
DELIMITER ;

-- Triggers
DELIMITER //
CREATE TRIGGER update_user_stats
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    UPDATE users 
    SET 
        total_orders = total_orders + 1,
        total_spent = total_spent + NEW.total,
        last_order_date = NOW()
    WHERE id = NEW.user_id;
END //
DELIMITER ;
```

### Optimisation des performances

```sql
-- Index pour optimiser les requêtes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
CREATE INDEX idx_products_category_price ON products(category, price);

-- Partitionnement pour les grandes tables
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10,2),
    created_at DATETIME
) PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Configuration des paramètres
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 67108864; -- 64MB
```

### Monitoring et métriques

```sql
-- Vérifier l'état des réplicas
SHOW SLAVE STATUS\G

-- Vérifier les processus actifs
SHOW PROCESSLIST;

-- Vérifier les variables de performance
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
SHOW VARIABLES LIKE 'max_connections';
SHOW VARIABLES LIKE 'query_cache_size';

-- Vérifier les statistiques
SHOW STATUS LIKE 'Connections';
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Queries';
SHOW STATUS LIKE 'Slow_queries';

-- Requêtes lentes
SELECT 
    sql_text,
    exec_count,
    avg_timer_wait/1000000000 as avg_time_ms,
    sum_timer_wait/1000000000 as total_time_ms
FROM performance_schema.events_statements_summary_by_digest
WHERE avg_timer_wait > 1000000000 -- Plus d'1 seconde
ORDER BY avg_timer_wait DESC
LIMIT 10;
```

---

## Prochaines étapes

1. **[Démarrage rapide](quick-start.md)** : Déployez MySQL en 5 minutes
2. **[Référence API](api-reference.md)** : Tous les paramètres disponibles
3. **[Tutoriels](tutorials/)** : Guides avancés
4. **[Dépannage](troubleshooting.md)** : Solutions aux problèmes courants
5. **[Optimisation](optimization/)** : Techniques d'optimisation
6. **[Migration](migration/)** : Migration depuis d'autres bases 