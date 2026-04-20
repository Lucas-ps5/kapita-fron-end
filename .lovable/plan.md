
# MONAYA — Plan d'implémentation V1

## Vision
Application web de suivi financier pour l'économie informelle camerounaise. Interface ultra-simple, mobile-first, permettant de voir son solde en un coup d'œil et d'enregistrer des transactions en moins de 10 secondes.

---

## 1. Design System & Thème
- Palette : vert doux (primaire) + gris clair (secondaire) — **à ajuster selon le logo/couleurs du client**
- Police minimum 14pt, contraste élevé pour utilisation en plein soleil
- Coins arrondis, boutons larges (56dp minimum), zone tactile confortable
- Design léger, pas d'animations lourdes, compatible écrans 5" à 6.5"
- Devise par défaut : FCFA avec formatage automatique (ex: 25 000)

## 2. Authentification & Onboarding
- **Écran d'accueil** : logo, slogan, bouton "Commencer"
- **Inscription** par email (Supabase Auth) — l'OTP par SMS nécessiterait un service tiers externe
- **Configuration initiale** : type d'activité (Boutique, Petit job, Étudiant, Autre), devise, objectif (suivre, savoir si je gagne, suivre dettes)
- Profil utilisateur avec préférences stockées en base

## 3. Dashboard Principal
- **Zone 1 (60% écran)** : Solde total en très grand (36-42pt), couleur dynamique (vert si positif, rouge si négatif)
- **Zone 2 (20%)** : Résumé mensuel — total entrées et total sorties
- **Zone 3 (20%)** : Deux gros boutons CTA — "💰 Argent reçu" et "💸 Argent sorti"
- Affichage des dettes à recevoir et à payer

## 4. Ajouter une Transaction
- Header minimal ("Ajouter argent reçu" ou "Ajouter argent sorti")
- Clavier numérique avec formatage automatique
- Note optionnelle
- Catégories pour les sorties : Stock, Transport, Nourriture, Crédit téléphonique, Loyer
- Animation subtile à la validation + retour automatique au dashboard avec micro bounce sur le solde

## 5. Historique des Transactions
- Liste verticale chronologique avec montant, note et date
- Filtres par date, type (entrée/sortie) et catégorie
- Swipe gauche pour supprimer une transaction
- Espacement généreux pour lisibilité

## 6. Gestion des Dettes (Premium)
- **Quelqu'un me doit** : nom, montant, date prévue, description
- **Je dois à quelqu'un** : même logique
- Action "Marquer comme payé" qui génère automatiquement une transaction liée
- Liste des dettes avec statut (en attente / payé)

## 7. Écran Premium
- Comparatif Gratuit vs Premium affiché clairement
- Gratuit : historique 30 jours
- Premium : historique illimité, gestion dettes, résumé mensuel
- CTA : "Passer Premium – 500 FCFA / mois" (fonctionnel visuellement, paiement Mobile Money à intégrer plus tard)

## 8. Paramètres
- Modifier nom
- Changer devise
- Déconnexion

## 9. Backend (Supabase)
- Tables : profiles, user_preferences, transactions, debts, user_subscription
- Row Level Security pour que chaque utilisateur ne voit que ses propres données
- Calculs de solde et résumés mensuels
