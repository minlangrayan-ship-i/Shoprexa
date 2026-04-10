export type CountryOption = {
  country: string;
  cities: string[];
};

export type MarketplaceSeller = {
  id: string;
  slug: string;
  name: string;
  company: string;
  email: string;
  password: string;
  country: string;
  city: string;
  verified: boolean;
};

export type Dropshipper = {
  id: string;
  name: string;
  email: string;
  country: string;
  city: string;
  productIds: string[];
};

export type MarketplaceProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  image: string;
  category: string;
  categorySlug: string;
  problemTag: string;
  sellerId: string;
  companyName: string;
  sellerCountry: string;
  sellerCity: string;
};

export type SellerReview = {
  id: string;
  sellerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'client' | 'seller' | 'admin';
  country: string;
  city: string;
  sellerId?: string;
};

export const africaCountries: CountryOption[] = [
  { country: 'Cameroun', cities: ['Yaounde', 'Douala', 'Bafoussam'] },
  { country: 'Cote d\'Ivoire', cities: ['Abidjan', 'Bouake', 'Yamoussoukro'] },
  { country: 'Senegal', cities: ['Dakar', 'Thies', 'Saint-Louis'] },
  { country: 'Congo', cities: ['Brazzaville', 'Pointe-Noire'] },
  { country: 'Tchad', cities: ['N\'Djamena', 'Moundou'] },
  { country: 'Nigeria', cities: ['Lagos', 'Abuja', 'Kano'] },
  { country: 'Kenya', cities: ['Nairobi', 'Mombasa', 'Kisumu'] }
];

export const sellerProfiles: MarketplaceSeller[] = [
  {
    id: 'seller-1',
    slug: 'sahel-energy-tools',
    name: 'Mireille Tchana',
    company: 'Sahel Energy Tools',
    email: 'mireille@saheltools.cm',
    password: 'SellerMireille123',
    country: 'Cameroun',
    city: 'Yaounde',
    verified: true
  },
  {
    id: 'seller-2',
    slug: 'secure-home-west',
    name: 'Ibrahim Konate',
    company: 'Secure Home West',
    email: 'ibrahim@securehome.ci',
    password: 'SellerIbrahim123',
    country: 'Cote d\'Ivoire',
    city: 'Abidjan',
    verified: true
  },
  {
    id: 'seller-3',
    slug: 'urban-mobility-lab',
    name: 'Linda Okafor',
    company: 'Urban Mobility Lab',
    email: 'linda@uml.ng',
    password: 'SellerLinda123',
    country: 'Nigeria',
    city: 'Lagos',
    verified: true
  }
];

export const dropshippers: Dropshipper[] = [
  {
    id: 'drop-1',
    name: 'Atlas Dropship Afrique',
    email: 'contact@atlasdrop.africa',
    country: 'Senegal',
    city: 'Dakar',
    productIds: ['prod-1', 'prod-2', 'prod-7', 'prod-10']
  },
  {
    id: 'drop-2',
    name: 'Nile Fulfillment Hub',
    email: 'ops@nilehub.africa',
    country: 'Kenya',
    city: 'Nairobi',
    productIds: ['prod-5', 'prod-8', 'prod-12', 'prod-17']
  }
];

export const marketplaceProducts: MarketplaceProduct[] = [
  {
    id: 'prod-1',
    slug: 'lampe-solaire-famille-6h',
    name: 'Lampe solaire famille 6h',
    description: 'Eclairage solaire pour coupures de courant et etudes du soir.',
    price: 18500,
    oldPrice: 22500,
    stock: 34,
    image: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=1200&q=80&auto=format&fit=crop',
    category: 'Energie',
    categorySlug: 'energie',
    problemTag: 'Coupures d\'electricite',
    sellerId: 'seller-1',
    companyName: 'CamSun Energy',
    sellerCountry: 'Cameroun',
    sellerCity: 'Yaounde'
  },
  {
    id: 'prod-2',
    slug: 'power-bank-30000-mah',
    name: 'Power bank 30000 mAh',
    description: 'Recharge smartphones et routeurs pendant 3 jours de coupure.',
    price: 24500,
    oldPrice: null,
    stock: 42,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1200&q=80&auto=format&fit=crop',
    category: 'Energie',
    categorySlug: 'energie',
    problemTag: 'Autonomie mobile',
    sellerId: 'seller-1',
    companyName: 'Yaounde Power Hub',
    sellerCountry: 'Cameroun',
    sellerCity: 'Yaounde'
  },
  {
    id: 'prod-3',
    slug: 'mixeur-portable-usb',
    name: 'Mixeur portable USB',
    description: 'Prepare jus et sauces sans prise secteur.',
    price: 15900,
    oldPrice: 19900,
    stock: 28,
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=1200&q=80&auto=format&fit=crop',
    category: 'Cuisine',
    categorySlug: 'cuisine',
    problemTag: 'Cuisine rapide',
    sellerId: 'seller-1',
    companyName: 'Kitchen Nova CM',
    sellerCountry: 'Cameroun',
    sellerCity: 'Yaounde'
  },
  {
    id: 'prod-4',
    slug: 'rechaud-gaz-economique',
    name: 'Rechaud gaz economique',
    description: 'Cuisson rapide avec faible consommation de gaz.',
    price: 13900,
    oldPrice: null,
    stock: 19,
    image: 'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=1200&q=80&auto=format&fit=crop',
    category: 'Cuisine',
    categorySlug: 'cuisine',
    problemTag: 'Cuisine quotidienne',
    sellerId: 'seller-1',
    companyName: 'Gaz Smart Home',
    sellerCountry: 'Cameroun',
    sellerCity: 'Yaounde'
  },
  {
    id: 'prod-5',
    slug: 'alarme-porte-sans-fil',
    name: 'Alarme porte sans fil',
    description: 'Alerte sonore immediate pour maisons et commerces.',
    price: 17200,
    oldPrice: 21000,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80&auto=format&fit=crop',
    category: 'Securite',
    categorySlug: 'securite',
    problemTag: 'Protection maison',
    sellerId: 'seller-2',
    companyName: 'Abidjan SafeTech',
    sellerCountry: 'Cote d\'Ivoire',
    sellerCity: 'Abidjan'
  },
  {
    id: 'prod-6',
    slug: 'camera-wifi-nuit',
    name: 'Camera WiFi vision nuit',
    description: 'Surveillance a distance avec alertes smartphone.',
    price: 35900,
    oldPrice: 39900,
    stock: 14,
    image: 'https://images.unsplash.com/photo-1557324232-b8917d04d3f7?w=1200&q=80&auto=format&fit=crop',
    category: 'Securite',
    categorySlug: 'securite',
    problemTag: 'Surveillance',
    sellerId: 'seller-2',
    companyName: 'Ivoire Vision Guard',
    sellerCountry: 'Cote d\'Ivoire',
    sellerCity: 'Abidjan'
  },
  {
    id: 'prod-7',
    slug: 'serrure-intelligente-rfid',
    name: 'Serrure intelligente RFID',
    description: 'Controle d\'acces pour boutiques et appartements.',
    price: 42900,
    oldPrice: null,
    stock: 11,
    image: 'https://images.unsplash.com/photo-1558002038-c6d5f2c4c0f9?w=1200&q=80&auto=format&fit=crop',
    category: 'Securite',
    categorySlug: 'securite',
    problemTag: 'Controle acces',
    sellerId: 'seller-2',
    companyName: 'LockPro Afrique',
    sellerCountry: 'Cote d\'Ivoire',
    sellerCity: 'Abidjan'
  },
  {
    id: 'prod-8',
    slug: 'detecteur-fumee-smart',
    name: 'Detecteur fumee smart',
    description: 'Alerte incendie rapide pour cuisines et entrepots.',
    price: 12800,
    oldPrice: 14900,
    stock: 31,
    image: 'https://images.unsplash.com/photo-1616628182509-6f1177b16f11?w=1200&q=80&auto=format&fit=crop',
    category: 'Securite',
    categorySlug: 'securite',
    problemTag: 'Prevention incendie',
    sellerId: 'seller-2',
    companyName: 'FireShield CI',
    sellerCountry: 'Cote d\'Ivoire',
    sellerCity: 'Abidjan'
  },
  {
    id: 'prod-9',
    slug: 'scooter-electrique-ville',
    name: 'Scooter electrique ville',
    description: 'Mobilite urbaine economique pour trajets quotidiens.',
    price: 689000,
    oldPrice: 735000,
    stock: 6,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&q=80&auto=format&fit=crop',
    category: 'Mobilite',
    categorySlug: 'mobilite',
    problemTag: 'Transport urbain',
    sellerId: 'seller-3',
    companyName: 'Lagos RideX',
    sellerCountry: 'Nigeria',
    sellerCity: 'Lagos'
  },
  {
    id: 'prod-10',
    slug: 'trottinette-pliable-pro',
    name: 'Trottinette pliable pro',
    description: 'Solution anti-embouteillage pour etudiants et pros.',
    price: 212000,
    oldPrice: null,
    stock: 9,
    image: 'https://images.unsplash.com/photo-1604868189265-219ba7bf7ea7?w=1200&q=80&auto=format&fit=crop',
    category: 'Mobilite',
    categorySlug: 'mobilite',
    problemTag: 'Embouteillages',
    sellerId: 'seller-3',
    companyName: 'SwiftMove NG',
    sellerCountry: 'Nigeria',
    sellerCity: 'Lagos'
  },
  {
    id: 'prod-11',
    slug: 'sac-fitness-hydra',
    name: 'Sac fitness Hydra',
    description: 'Sac leger pour sport, hydratation et deplacements.',
    price: 18900,
    oldPrice: 23000,
    stock: 23,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80&auto=format&fit=crop',
    category: 'Fitness',
    categorySlug: 'fitness',
    problemTag: 'Bien-etre',
    sellerId: 'seller-3',
    companyName: 'FitPulse Lagos',
    sellerCountry: 'Nigeria',
    sellerCity: 'Lagos'
  },
  {
    id: 'prod-12',
    slug: 'montre-fitness-pulse',
    name: 'Montre fitness Pulse',
    description: 'Suivi cardio et activite avec autonomie 10 jours.',
    price: 46500,
    oldPrice: null,
    stock: 17,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80&auto=format&fit=crop',
    category: 'Fitness',
    categorySlug: 'fitness',
    problemTag: 'Suivi sante',
    sellerId: 'seller-3',
    companyName: 'VitalTrack NG',
    sellerCountry: 'Nigeria',
    sellerCity: 'Lagos'
  },
  {
    id: 'prod-13',
    slug: 'lampe-solaire-rue-mini',
    name: 'Lampe solaire rue mini',
    description: 'Eclairage exterieur pour cours, kiosques et rues.',
    price: 21900,
    oldPrice: 25900,
    stock: 26,
    image: 'https://images.unsplash.com/photo-1536895058696-a69b1c7ba34f?w=1200&q=80&auto=format&fit=crop',
    category: 'Energie',
    categorySlug: 'energie',
    problemTag: 'Eclairage exterieur',
    sellerId: 'seller-1',
    companyName: 'Solar Street Yaounde',
    sellerCountry: 'Cameroun',
    sellerCity: 'Yaounde'
  },
  {
    id: 'prod-14',
    slug: 'friteuse-sans-huile-compacte',
    name: 'Friteuse sans huile compacte',
    description: 'Cuisine plus saine avec faible consommation electrique.',
    price: 52900,
    oldPrice: 59900,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1200&q=80&auto=format&fit=crop',
    category: 'Cuisine',
    categorySlug: 'cuisine',
    problemTag: 'Cuisine saine',
    sellerId: 'seller-1',
    companyName: 'AirChef Afrique',
    sellerCountry: 'Cameroun',
    sellerCity: 'Yaounde'
  },
  {
    id: 'prod-15',
    slug: 'kit-ustensiles-gadgets-8pcs',
    name: 'Kit gadgets cuisine 8pcs',
    description: 'Gadgets pratiques pour cuisiner vite en famille.',
    price: 11800,
    oldPrice: null,
    stock: 39,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80&auto=format&fit=crop',
    category: 'Cuisine',
    categorySlug: 'cuisine',
    problemTag: 'Gain de temps',
    sellerId: 'seller-2',
    companyName: 'Cuisine Plus Abidjan',
    sellerCountry: 'Cote d\'Ivoire',
    sellerCity: 'Abidjan'
  },
  {
    id: 'prod-16',
    slug: 'casque-velo-led',
    name: 'Casque velo LED securite',
    description: 'Protection et visibilite la nuit pour mobilite urbaine.',
    price: 27400,
    oldPrice: 31900,
    stock: 21,
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1200&q=80&auto=format&fit=crop',
    category: 'Mobilite',
    categorySlug: 'mobilite',
    problemTag: 'Securite routiere',
    sellerId: 'seller-3',
    companyName: 'RideSafe Gear',
    sellerCountry: 'Nigeria',
    sellerCity: 'Lagos'
  },
  {
    id: 'prod-17',
    slug: 'corde-connectee-fitness',
    name: 'Corde connectee fitness',
    description: 'Compteur intelligent pour sessions cardio a domicile.',
    price: 14500,
    oldPrice: 17800,
    stock: 33,
    image: 'https://images.unsplash.com/photo-1596357395217-80de13130e92?w=1200&q=80&auto=format&fit=crop',
    category: 'Fitness',
    categorySlug: 'fitness',
    problemTag: 'Sport maison',
    sellerId: 'seller-3',
    companyName: 'CardioFlex Afrique',
    sellerCountry: 'Nigeria',
    sellerCity: 'Lagos'
  },
  {
    id: 'prod-18',
    slug: 'coffre-securite-bureau',
    name: 'Coffre securite bureau',
    description: 'Protection documents et caisse pour petits commerces.',
    price: 64900,
    oldPrice: null,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1558002038-0f75cf2330ef?w=1200&q=80&auto=format&fit=crop',
    category: 'Securite',
    categorySlug: 'securite',
    problemTag: 'Protection business',
    sellerId: 'seller-2',
    companyName: 'CoffreSure West',
    sellerCountry: 'Cote d\'Ivoire',
    sellerCity: 'Abidjan'
  }
];

export const seededReviews: SellerReview[] = [
  { id: 'rev-1', sellerId: 'seller-1', customerName: 'Nadine', rating: 5, comment: 'Livraison rapide et produits utiles.', createdAt: '2026-03-01' },
  { id: 'rev-2', sellerId: 'seller-1', customerName: 'Kevin', rating: 4, comment: 'Bonne qualite des lampes solaires.', createdAt: '2026-03-10' },
  { id: 'rev-3', sellerId: 'seller-2', customerName: 'Aicha', rating: 5, comment: 'Materiel securite fiable.', createdAt: '2026-03-12' },
  { id: 'rev-4', sellerId: 'seller-2', customerName: 'Yao', rating: 4, comment: 'Service client reactif.', createdAt: '2026-03-14' },
  { id: 'rev-5', sellerId: 'seller-3', customerName: 'Emeka', rating: 5, comment: 'Produits mobilite top pour Lagos.', createdAt: '2026-03-07' },
  { id: 'rev-6', sellerId: 'seller-3', customerName: 'Sophie', rating: 4, comment: 'Montre fitness conforme.', createdAt: '2026-03-11' }
];

export const demoUsers: DemoUser[] = [
  {
    id: 'admin-1',
    name: 'Minlang Rayan',
    email: 'admin@min-shop.com',
    password: 'MinShopAdmin2026!',
    role: 'admin',
    country: 'Cameroun',
    city: 'Yaounde'
  },
  {
    id: 'client-1',
    name: 'Aline Mvondo',
    email: 'aline.client@min-shop.com',
    password: 'ClientAline123',
    role: 'client',
    country: 'Cameroun',
    city: 'Yaounde'
  },
  {
    id: 'client-2',
    name: 'Cheikh Ndiaye',
    email: 'cheikh.client@min-shop.com',
    password: 'ClientCheikh123',
    role: 'client',
    country: 'Senegal',
    city: 'Dakar'
  },
  ...sellerProfiles.map((seller) => ({
    id: `user-${seller.id}`,
    name: seller.name,
    email: seller.email,
    password: seller.password,
    role: 'seller' as const,
    country: seller.country,
    city: seller.city,
    sellerId: seller.id
  }))
];

export const marketplaceCategories = [
  { label: 'Energie', slug: 'energie' },
  { label: 'Cuisine', slug: 'cuisine' },
  { label: 'Securite', slug: 'securite' },
  { label: 'Mobilite', slug: 'mobilite' },
  { label: 'Fitness', slug: 'fitness' }
];

export function getAverageRating(reviews: SellerReview[], sellerId: string) {
  const sellerReviews = reviews.filter((review) => review.sellerId === sellerId);
  if (sellerReviews.length === 0) return 0;
  const total = sellerReviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / sellerReviews.length).toFixed(1));
}

export function getSellerProducts(sellerId: string) {
  return marketplaceProducts.filter((product) => product.sellerId === sellerId);
}

export function getProductsForLocation(country: string, city?: string) {
  return marketplaceProducts.filter((product) => {
    if (product.sellerCountry !== country) return false;
    if (!city) return true;
    return product.sellerCity === city;
  });
}

export function getSellersForLocation(country: string, city?: string) {
  return sellerProfiles.filter((seller) => {
    if (seller.country !== country) return false;
    if (!city) return true;
    return seller.city === city;
  });
}

export function rankSellersByRating(reviews: SellerReview[], country?: string, city?: string) {
  const sellers = sellerProfiles.filter((seller) => {
    if (country && seller.country !== country) return false;
    if (city && seller.city !== city) return false;
    return true;
  });

  return sellers
    .map((seller) => ({
      ...seller,
      averageRating: getAverageRating(reviews, seller.id),
      reviewCount: reviews.filter((review) => review.sellerId === seller.id).length
    }))
    .sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount);
}

export function getSellerDashboardData(sellerId: string, reviews: SellerReview[]) {
  const products = getSellerProducts(sellerId);
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const simulatedSales = products.reduce((sum, product) => sum + Math.max(3, Math.round((40 - product.stock) / 2)), 0);
  const revenue = products.reduce((sum, product) => sum + product.price * Math.max(3, Math.round((40 - product.stock) / 2)), 0);
  const sellerReviews = reviews.filter((review) => review.sellerId === sellerId);

  return {
    products,
    totalStock,
    simulatedSales,
    revenue,
    sellerReviews,
    averageRating: getAverageRating(reviews, sellerId)
  };
}

export function findUserByCredentials(email: string, password: string) {
  return demoUsers.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password) ?? null;
}

