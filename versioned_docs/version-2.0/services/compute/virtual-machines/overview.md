---
sidebar_position: 1
title: Vue d'ensemble des Machines Virtuelles
---

# Machines Virtuelles Hikube

Les **Machines Virtuelles (VMs)** d'Hikube offrent une virtualisation complète de l'infrastructure matérielle, garantissant l'exécution de systèmes d'exploitation hétérogènes et d'applications métier dans des environnements cloisonnés et conformes aux exigences de sécurité d'entreprise.
---

## 🚀 Avantages Clés

### **Isolation et Sécurité**
- **Environnements isolés** pour chaque application
- **Multi-tenancy** native avec séparation des ressources

### **Flexibilité et Performance**
- **Support multi-OS** : Linux, Windows, BSD
- **Import VM**: Importez vos workloads depuis Openstack, VMware ou Proxmox
- **Types d'instances optimisés** selon vos besoins
- **GPU passthrough** pour workloads intensifs

---

## 🌐 Accès et Connectivité

### **Méthodes d'Accès**
- **Console série** : `virtctl console <vm>`
- **Interface VNC** : `virtctl vnc <vm>`
- **SSH direct** : `virtctl ssh user@<vm>`
- **Accès externe** : LoadBalancer et NodePort

### **Networking**
- **Réseaux isolés** par tenant
- **Routeurs virtuels** pour interconnexion
- **VPN** pour accès sécurisé
- **Load balancing** automatique

---

## 🔧 Cas d'Usage Typiques

### **🏢 Infrastructure d'Entreprise**
- **Applications legacy** nécessitant un OS spécifique
- **Bases de données** haute performance
- **Services Windows** intégrés

### **🔬 Développement et Test**
- **Environnements de développement** isolés
- **Tests multi-OS** automatisés
- **CI/CD pipelines** avec VMs éphémères

### **📊 Analytics et AI/ML**
- **Traitement de données** avec ressources dédiées
- **Workloads GPU** pour machine learning
- **Calcul scientifique** haute performance

---

## 🎯 Prochaines Étapes

<div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>

**🚀 Démarrage Rapide**  
→ [Créer votre première VM](./quick-start.md)

**📚 Référence API**  
→ [Configuration avancée](./api-reference.md)

</div>

---

:::tip Performance Optimale
Pour des workloads critiques, utilisez les séries **CX** ou **RT** avec du stockage **replicated** pour garantir performance et haute disponibilité.
:::

:::info Assistance
Les machines virtuelles Hikube sont basées sur [KubeVirt](https://kubevirt.io/), bénéficiant de tout l'écosystème et des bonnes pratiques de cette technologie éprouvée.
::: 