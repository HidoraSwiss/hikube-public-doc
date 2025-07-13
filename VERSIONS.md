# 📚 Guide du Système de Versioning - Documentation Hikube

## 🎯 **Structure Actuelle**

Votre documentation Hikube utilise maintenant un système de versioning simplifié avec deux versions principales :

### 📌 **Versions Disponibles**

| Version | Statut | URL | Description |
|---------|--------|-----|-------------|
| **1.0** | 📍 **Stable (Défaut)** | `/` | Version stable actuelle, recommandée pour la production |
| **2.0** | ⚠️ **Future** | `/2.0/` | Version future avec nouvelles fonctionnalités (instable) |

### 🌐 **URLs d'accès**

- **Page d'accueil (v1.0)** : `http://localhost:3000/`
- **Version 1.0** : `http://localhost:3000/get-started`
- **Version 2.0** : `http://localhost:3000/2.0/get-started`
- **Page des versions** : `http://localhost:3000/versions`

## 📁 **Structure des Fichiers**

```
documentation-hikube/
├── docs/                     # 🗂️ Répertoire original (peut être supprimé)
├── versioned_docs/           # 📦 Documents versionnés
│   ├── version-1.0/         # 📍 Version 1.0 (stable)
│   └── version-2.0/         # ⚠️ Version 2.0 (future)
├── versioned_sidebars/       # 🧭 Sidebars versionnés
│   ├── version-1.0-sidebars.json
│   └── version-2.0-sidebars.json
├── versions.json             # 📋 Liste des versions ["2.0", "1.0"]
└── src/pages/versions.js     # 📄 Page personnalisée des versions
```

## ⚙️ **Configuration**

### `docusaurus.config.js`

```javascript
docs: {
  // Configuration du versioning
  includeCurrentVersion: false,    // ❌ Pas de version "Next"
  lastVersion: '1.0',             // 📍 Version par défaut
  versions: {
    '1.0': {
      label: '1.0.0 (Stable)',
      path: '/',                   // 🏠 Racine du site
      banner: 'none',
    },
    '2.0': {
      label: '2.0.0 (Future)',
      path: '/2.0',               // 🔮 Chemin vers version future
      banner: 'unreleased',       // ⚠️ Bannière d'avertissement
    },
  },
}
```

## 🛠️ **Commandes Utiles**

### Créer une nouvelle version
```bash
npm run docusaurus docs:version 3.0
```

### Compiler le site
```bash
npm run build
```

### Servir en local
```bash
npm run serve
```

### Nettoyer le cache
```bash
npm run clear
```

## 🎨 **Navigation**

### Navbar
- **Sélecteur de version** : Dropdown avec toutes les versions
- **Lien "Toutes les versions"** : Vers `/versions`

### Page des Versions
- **Tableaux organisés** par statut
- **Badges visuels** : "Actuelle" pour v1.0, "Future" pour v2.0
- **Liens directs** vers chaque version
- **Descriptions contextuelles**

## 🔄 **Workflow de Versioning**

### 1. Version Stable (1.0)
- ✅ **Production ready**
- 🏠 **URL racine** (`/`)
- 📍 **Version par défaut**
- 🔒 **Contenu figé** (pas de modifications)

### 2. Version Future (2.0)
- ⚠️ **En développement**
- 🔮 **URL préfixée** (`/2.0/`)
- 🧪 **Nouvelles fonctionnalités**
- 🚨 **Bannière d'avertissement**

### 3. Évolution Future
Quand la v2.0 sera prête :
1. Faire de v2.0 la nouvelle version par défaut
2. Optionnellement créer une v3.0 pour le futur
3. Maintenir v1.0 comme version legacy

## 🧹 **Nettoyage Optionnel**

Le dossier `docs/` n'est plus utilisé depuis que `includeCurrentVersion: false`. Vous pouvez :

1. **Le supprimer** si vous n'en avez plus besoin
2. **Le garder** pour une future version de développement
3. **Le renommer** en `docs-archive/` pour référence

```bash
# Option 1: Supprimer
rm -rf docs/

# Option 2: Archiver
mv docs/ docs-archive/
```

## 🎯 **Avantages de cette Structure**

- ✅ **Simplicité** : Seulement 2 versions actives
- 📍 **Clarté** : Version stable clairement identifiée
- 🚀 **Performance** : Pas de version "Next" qui ralentit
- 🎨 **UX optimisée** : Navigation intuitive
- 🔧 **Maintenance facilitée** : Structure claire et organisée

---

*Cette configuration vous donne un contrôle total sur le versioning tout en maintenant une structure simple et performante.* 