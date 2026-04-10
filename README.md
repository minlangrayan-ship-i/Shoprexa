# Min-shop

Min-shop est une plateforme e-commerce moderne conçue pour le Cameroun et le marché africain. Le projet est construit avec **Next.js + TypeScript + Tailwind + Prisma + PostgreSQL** et inclut une base admin, un catalogue dynamique, un panier, un checkout simulé, des formulaires fonctionnels et une architecture prête pour Flutterwave/Paystack.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- API routes Next.js (backend Node.js)

## Fonctionnalités incluses

- Page d’accueil orientée conversion (hero, catégories, produits vedette, témoignages, FAQ)
- Catalogue dynamique (recherche, filtres, tri, pagination)
- Détail produit avec CTA commande et WhatsApp
- Pages À propos, Contact, Vendeurs
- Panier dynamique (localStorage)
- Checkout avec simulation paiement et enregistrement en base
- Auth démo (inscription/connexion)
- Dashboard admin simple (produits CRUD, commandes, messages, demandes vendeurs)
- Seed de données réalistes (catégories, 11 produits, compte admin)

## Démarrage local

### 1) Prérequis

- Node.js 20+
- PostgreSQL 14+

### 2) Installation

```bash
npm install
cp .env.example .env
```

### 3) Configurer la base

```bash
npm run prisma:generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### 4) Lancer le projet

```bash
npm run dev
```

Accès: `http://localhost:3000`

## Admin de démonstration

- URL: `http://localhost:3000/admin`
- Email: `admin@min-shop.africa`
- Mot de passe: `Admin@1234`

## Routes principales

- `/` Accueil
- `/shop` Catalogue
- `/product/[slug]` Détail produit
- `/cart` Panier
- `/checkout` Checkout
- `/about` À propos
- `/contact` Contact
- `/sellers` Devenir vendeur
- `/auth/login`, `/auth/register`
- `/admin` Dashboard admin

## Structure

- `app/` pages + API routes
- `components/` composants UI réutilisables
- `lib/` utilitaires (prisma, prix, types, paiement)
- `prisma/` schéma + seed

## Préparation intégrations

- Paiements: structure de provider (`MOCK`, `FLUTTERWAVE`, `PAYSTACK`) et endpoints de commande prêts à connecter.
- WhatsApp: CTA global configurable via `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- Email/analytics: architecture API prête à étendre.

## Prochaines améliorations

1. Ajouter authentification sécurisée (NextAuth/Auth.js + sessions JWT).
2. Appliquer RBAC serveur pour protéger `/admin`.
3. Ajouter upload média (Cloudinary/S3) pour produits.
4. Intégrer paiement réel Flutterwave/Paystack webhooks.
5. Ajouter tests E2E (Playwright) et monitoring.
