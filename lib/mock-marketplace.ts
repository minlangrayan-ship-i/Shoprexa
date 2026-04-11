export type AccountRole = 'client' | 'seller' | 'admin';
export type SellerType = 'min_shop' | 'dropshipper' | 'company';

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
  phone: string;
  country: string;
  city: string;
  verified: boolean;
  identityVerified: boolean;
  sellerType: SellerType;
  about: string;
  logoUrl?: string;
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
  images: string[];
  category: string;
  categorySlug: string;
  problemTag: string;
  sellerId: string;
  companyName: string;
  sellerCountry: string;
  sellerCity: string;
  badges: Array<'new' | 'popular' | 'low_stock'>;
  averageRating: number;
  viewCount: number;
  kind?: 'product' | 'service';
  serviceDuration?: string;
  serviceAvailability?: string;
  targetCountries?: string[];
};

export type SellerReview = {
  id: string;
  sellerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type SellerOrder = {
  id: string;
  sellerId: string;
  productId: string;
  customerName: string;
  quantity: number;
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
};

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: AccountRole;
  country: string;
  city: string;
  phone: string;
  avatar?: string;
  sellerId?: string;
  sellerType?: SellerType;
  createdAt: string;
  preferences?: string[];
};

export type RecruitmentOffer = {
  id: string;
  companySellerId: string;
  targetSellerId: string;
  productIds: string[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
};

export type SellerComplaint = {
  id: string;
  sellerId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
};

export type ClientTestimonial = {
  id: string;
  country: string;
  city: string;
  name: string;
  rating: number;
  comment: string;
};

export const defaultAvatar =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80&auto=format&fit=crop';

export const africaCountries: CountryOption[] = [
  { country: 'Cameroun', cities: ['Yaounde', 'Douala', 'Bafoussam'] },
  { country: 'Cote d\'Ivoire', cities: ['Abidjan', 'Bouake', 'Yamoussoukro'] },
  { country: 'Senegal', cities: ['Dakar', 'Thies', 'Saint-Louis'] },
  { country: 'Congo', cities: ['Brazzaville', 'Pointe-Noire'] },
  { country: 'Tchad', cities: ['N\'Djamena', 'Moundou'] },
  { country: 'Nigeria', cities: ['Lagos', 'Abuja', 'Kano'] },
  { country: 'Kenya', cities: ['Nairobi', 'Mombasa', 'Kisumu'] }
];

export const countryPhonePrefixes: Record<string, string> = {
  'Cameroun': '+237',
  'Cote d\'Ivoire': '+225',
  'Senegal': '+221',
  'Congo': '+242',
  'Tchad': '+235',
  'Nigeria': '+234',
  'Kenya': '+254',
  'France': '+33'
};

export const marketplaceCategories = [
  { label: 'Energie', slug: 'energie' },
  { label: 'Cuisine', slug: 'cuisine' },
  { label: 'Securite', slug: 'securite' },
  { label: 'Mobilite', slug: 'mobilite' },
  { label: 'Fitness', slug: 'fitness' },
  { label: 'Organisation', slug: 'organisation' }
];

export const sellerProfiles: MarketplaceSeller[] = [
  {
    id: 'seller-1',
    slug: 'sahel-energy-tools',
    name: 'Mireille Tchana',
    company: 'Sahel Energy Tools',
    email: 'mireille@saheltools.cm',
    password: 'SellerMireille123',
    phone: '+237 671000111',
    country: 'Cameroun',
    city: 'Yaounde',
    verified: true,
    identityVerified: true,
    sellerType: 'min_shop',
    about: 'Solutions energie et cuisine pour foyers, etudiants et petits commerces.'
  },
  {
    id: 'seller-2',
    slug: 'secure-home-west',
    name: 'Ibrahim Konate',
    company: 'Secure Home West',
    email: 'ibrahim@securehome.ci',
    password: 'SellerIbrahim123',
    phone: '+225 0102030405',
    country: 'Cote d\'Ivoire',
    city: 'Abidjan',
    verified: true,
    identityVerified: true,
    sellerType: 'company',
    about: 'Equipements securite et organisation pour familles et commerces urbains.'
  },
  {
    id: 'seller-3',
    slug: 'urban-mobility-lab',
    name: 'Linda Okafor',
    company: 'Urban Mobility Lab',
    email: 'linda@uml.ng',
    password: 'SellerLinda123',
    phone: '+234 8030001111',
    country: 'Nigeria',
    city: 'Lagos',
    verified: true,
    identityVerified: false,
    sellerType: 'dropshipper',
    about: 'Mobilite urbaine et bien-etre pour etudiants, pros et livreurs.'
  }
];

export const dropshippers: Dropshipper[] = [
  {
    id: 'drop-1',
    name: 'Atlas Dropship Afrique',
    email: 'contact@atlasdrop.africa',
    country: 'Senegal',
    city: 'Dakar',
    productIds: ['prod-1', 'prod-2', 'prod-7', 'prod-10', 'prod-14']
  },
  {
    id: 'drop-2',
    name: 'Nile Fulfillment Hub',
    email: 'ops@nilehub.africa',
    country: 'Kenya',
    city: 'Nairobi',
    productIds: ['prod-5', 'prod-8', 'prod-12', 'prod-17', 'prod-18']
  }
];

const imageSets = {
  solar: [
    'https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497449493050-aad1e7cad165?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1400&q=85&auto=format&fit=crop'
  ],
  power: [
    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1622445275576-721325763afe?w=1400&q=85&auto=format&fit=crop'
  ],
  kitchen: [
    'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1585515656191-9b37ec30f6d0?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1400&q=85&auto=format&fit=crop'
  ],
  security: [
    'https://images.unsplash.com/photo-1558002038-1055907df827?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557324232-b8917d04d3f7?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558002038-0f75cf2330ef?w=1400&q=85&auto=format&fit=crop'
  ],
  mobility: [
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1604868189265-219ba7bf7ea7?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1400&q=85&auto=format&fit=crop'
  ],
  fitness: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596357395217-80de13130e92?w=1400&q=85&auto=format&fit=crop'
  ],
  organization: [
    'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1400&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517148815978-75f6acaaf32c?w=1400&q=85&auto=format&fit=crop'
  ]
};

export const marketplaceProducts: MarketplaceProduct[] = [
  {
    id: 'prod-1',
    slug: 'lampe-solaire-famille-6h',
    name: 'Lampe solaire famille 6h',
    description: 'Eclairage solaire pour coupures de courant et etudes du soir.',
    price: 18500,
    oldPrice: 22500,
    stock: 34,
    images: imageSets.solar,
    category: 'Energie',
    categorySlug: 'energie',
    problemTag: 'Coupures d\'electricite',
    sellerId: 'seller-1',
    companyName: 'CamSun Energy',
    sellerCountry: 'Cameroun',
    sellerCity: 'Yaounde',
    badges: ['popular'],
    averageRating: 4.7,
    viewCount: 492
  },
  {
    id: 'prod-2',
    slug: 'power-bank-30000-mah',
    name: 'Power bank 30000 mAh',
    description: 'Recharge smartphones et routeurs pendant 3 jours de coupure.',
    price: 24500,
    oldPrice: null,
    stock: 42,
    images: imageSets.power,
    category: 'Energie',
    categorySlug: 'energie',
    problemTag: 'Autonomie mobile',
    sellerId: 'seller-1',
    companyName: 'Yaounde Power Hub',
    sellerCountry: 'Cameroun',
    sellerCity: 'Yaounde',
    badges: ['popular'],
    averageRating: 4.6,
    viewCount: 403
  },
  {
    id: 'prod-3',
    slug: 'mixeur-portable-usb',
    name: 'Mini mixeur portable USB',
    description: 'Prepare jus et sauces sans prise secteur, ideal etudiants.',
    price: 15900,
    oldPrice: 19900,
    stock: 28,
    images: imageSets.kitchen,
    category: 'Cuisine',
    categorySlug: 'cuisine',
    problemTag: 'Cuisine rapide',
    sellerId: 'seller-1',
    companyName: 'Kitchen Nova CM',
    sellerCountry: 'Cameroun',
    sellerCity: 'Yaounde',
    badges: ['new'],
    averageRating: 4.4,
    viewCount: 251
  },
  {
    id: 'prod-4',
    slug: 'rechaud-gaz-economique',
    name: 'Rechaud gaz economique',
    description: 'Cuisson rapide avec faible consommation de gaz.',
    price: 13900,
    oldPrice: null,
    stock: 19,
    images: imageSets.kitchen,
    category: 'Cuisine',
    categorySlug: 'cuisine',
    problemTag: 'Cuisine quotidienne',
    sellerId: 'seller-1',
    companyName: 'Gaz Smart Home',
    sellerCountry: 'Cameroun',
    sellerCity: 'Yaounde',
    badges: [],
    averageRating: 4.3,
    viewCount: 174
  },
  {
    id: 'prod-5',
    slug: 'alarme-porte-sans-fil',
    name: 'Alarme porte sans fil',
    description: 'Alerte sonore immediate pour maisons et commerces.',
    price: 17200,
    oldPrice: 21000,
    stock: 25,
    images: imageSets.security,
    category: 'Securite',
    categorySlug: 'securite',
    problemTag: 'Protection maison',
    sellerId: 'seller-2',
    companyName: 'Abidjan SafeTech',
    sellerCountry: 'Cote d\'Ivoire',
    sellerCity: 'Abidjan',
    badges: ['popular'],
    averageRating: 4.8,
    viewCount: 522
  },
  {
    id: 'prod-6',
    slug: 'camera-wifi-nuit',
    name: 'Camera WiFi vision nuit',
    description: 'Surveillance a distance avec alertes smartphone.',
    price: 35900,
    oldPrice: 39900,
    stock: 14,
    images: imageSets.security,
    category: 'Securite',
    categorySlug: 'securite',
    problemTag: 'Surveillance',
    sellerId: 'seller-2',
    companyName: 'Ivoire Vision Guard',
    sellerCountry: 'Cote d\'Ivoire',
    sellerCity: 'Abidjan',
    badges: ['new'],
    averageRating: 4.5,
    viewCount: 298,
    kind: 'service',
    serviceDuration: '2h installation + 30min configuration',
    serviceAvailability: 'Lun-Sam, 08:00-18:00',
    targetCountries: ['Cote d\'Ivoire', 'Cameroun']
  },
  {
    id: 'prod-7',
    slug: 'serrure-intelligente-rfid',
    name: 'Serrure intelligente RFID',
    description: 'Controle d\'acces pour boutiques et appartements.',
    price: 42900,
    oldPrice: null,
    stock: 11,
    images: imageSets.security,
    category: 'Securite',
    categorySlug: 'securite',
    problemTag: 'Controle acces',
    sellerId: 'seller-2',
    companyName: 'LockPro Afrique',
    sellerCountry: 'Cote d\'Ivoire',
    sellerCity: 'Abidjan',
    badges: ['low_stock'],
    averageRating: 4.4,
    viewCount: 241
  },
  {
    id: 'prod-8',
    slug: 'detecteur-fumee-smart',
    name: 'Detecteur fumee smart',
    description: 'Alerte incendie rapide pour cuisines et entrepots.',
    price: 12800,
    oldPrice: 14900,
    stock: 31,
    images: imageSets.security,
    category: 'Securite',
    categorySlug: 'securite',
    problemTag: 'Prevention incendie',
    sellerId: 'seller-2',
    companyName: 'FireShield CI',
    sellerCountry: 'Cote d\'Ivoire',
    sellerCity: 'Abidjan',
    badges: [],
    averageRating: 4.2,
    viewCount: 180,
    kind: 'service',
    serviceDuration: 'Audit securite de 3h',
    serviceAvailability: 'Sur rendez-vous',
    targetCountries: ['Cote d\'Ivoire', 'Senegal']
  },
  {
    id: 'prod-9',
    slug: 'scooter-electrique-ville',
    name: 'Scooter electrique ville',
    description: 'Mobilite urbaine economique pour trajets quotidiens.',
    price: 689000,
    oldPrice: 735000,
    stock: 6,
    images: imageSets.mobility,
    category: 'Mobilite',
    categorySlug: 'mobilite',
    problemTag: 'Transport urbain',
    sellerId: 'seller-3',
    companyName: 'Lagos RideX',
    sellerCountry: 'Nigeria',
    sellerCity: 'Lagos',
    badges: ['low_stock', 'popular'],
    averageRating: 4.9,
    viewCount: 601
  },
  {
    id: 'prod-10',
    slug: 'trottinette-pliable-pro',
    name: 'Trottinette pliable pro',
    description: 'Solution anti-embouteillage pour etudiants et pros.',
    price: 212000,
    oldPrice: null,
    stock: 9,
    images: imageSets.mobility,
    category: 'Mobilite',
    categorySlug: 'mobilite',
    problemTag: 'Embouteillages',
    sellerId: 'seller-3',
    companyName: 'SwiftMove NG',
    sellerCountry: 'Nigeria',
    sellerCity: 'Lagos',
    badges: ['low_stock'],
    averageRating: 4.6,
    viewCount: 329
  },
  {
    id: 'prod-11',
    slug: 'sac-fitness-hydra',
    name: 'Sac fitness Hydra',
    description: 'Sac leger pour sport, hydratation et deplacements.',
    price: 18900,
    oldPrice: 23000,
    stock: 23,
    images: imageSets.fitness,
    category: 'Fitness',
    categorySlug: 'fitness',
    problemTag: 'Bien-etre',
    sellerId: 'seller-3',
    companyName: 'FitPulse Lagos',
    sellerCountry: 'Nigeria',
    sellerCity: 'Lagos',
    badges: ['new'],
    averageRating: 4.3,
    viewCount: 216
  },
  {
    id: 'prod-12',
    slug: 'montre-fitness-pulse',
    name: 'Montre fitness Pulse',
    description: 'Suivi cardio et activite avec autonomie 10 jours.',
    price: 46500,
    oldPrice: null,
    stock: 17,
    images: imageSets.fitness,
    category: 'Fitness',
    categorySlug: 'fitness',
    problemTag: 'Suivi sante',
    sellerId: 'seller-3',
    companyName: 'VitalTrack NG',
    sellerCountry: 'Nigeria',
    sellerCity: 'Lagos',
    badges: [],
    averageRating: 4.5,
    viewCount: 272
  },
  {
    id: 'prod-13',
    slug: 'lampe-solaire-rue-mini',
    name: 'Lampe solaire rue mini',
    description: 'Eclairage exterieur pour cours, kiosques et rues.',
    price: 21900,
    oldPrice: 25900,
    stock: 26,
    images: imageSets.solar,
    category: 'Energie',
    categorySlug: 'energie',
    problemTag: 'Eclairage exterieur',
    sellerId: 'seller-1',
    companyName: 'Solar Street Yaounde',
    sellerCountry: 'Cameroun',
    sellerCity: 'Yaounde',
    badges: ['popular'],
    averageRating: 4.6,
    viewCount: 340
  },
  {
    id: 'prod-14',
    slug: 'friteuse-sans-huile-compacte',
    name: 'Friteuse sans huile compacte',
    description: 'Cuisine plus saine avec faible consommation electrique.',
    price: 52900,
    oldPrice: 59900,
    stock: 15,
    images: imageSets.kitchen,
    category: 'Cuisine',
    categorySlug: 'cuisine',
    problemTag: 'Cuisine saine',
    sellerId: 'seller-1',
    companyName: 'AirChef Afrique',
    sellerCountry: 'Cameroun',
    sellerCity: 'Yaounde',
    badges: ['new'],
    averageRating: 4.7,
    viewCount: 447
  },
  {
    id: 'prod-19',
    slug: 'poivre-penja-premium',
    name: 'Poivre de Penja premium 250g',
    description: 'Epice locale premium tres prisee pour cuisine familiale et restauration.',
    price: 9800,
    oldPrice: null,
    stock: 64,
    images: imageSets.kitchen,
    category: 'Cuisine',
    categorySlug: 'cuisine',
    problemTag: 'Produits locaux Cameroun',
    sellerId: 'seller-1',
    companyName: 'Sahel Energy Tools',
    sellerCountry: 'Cameroun',
    sellerCity: 'Douala',
    badges: ['new', 'popular'],
    averageRating: 4.5,
    viewCount: 312,
    kind: 'product',
    targetCountries: ['Cameroun', 'Congo', 'Tchad']
  },
  {
    id: 'prod-20',
    slug: 'artisanat-senegal-pack',
    name: 'Pack artisanat Senegal',
    description: 'Selection d articles artisanaux pour decoration et cadeaux.',
    price: 21500,
    oldPrice: 24900,
    stock: 27,
    images: imageSets.organization,
    category: 'Organisation',
    categorySlug: 'organisation',
    problemTag: 'Produits locaux Senegal',
    sellerId: 'seller-2',
    companyName: 'Secure Home West',
    sellerCountry: 'Senegal',
    sellerCity: 'Dakar',
    badges: ['new'],
    averageRating: 4.3,
    viewCount: 205,
    kind: 'product',
    targetCountries: ['Senegal', 'Cote d\'Ivoire', 'Cameroun']
  },
  {
    id: 'prod-21',
    slug: 'conciergerie-livraison-pro',
    name: 'Service conciergerie livraison pro',
    description: 'Service entreprise: suivi logistique et coordination des expeditions multi-pays.',
    price: 45000,
    oldPrice: null,
    stock: 999,
    images: imageSets.mobility,
    category: 'Mobilite',
    categorySlug: 'mobilite',
    problemTag: 'Service logistique',
    sellerId: 'seller-2',
    companyName: 'Secure Home West',
    sellerCountry: 'Cote d\'Ivoire',
    sellerCity: 'Abidjan',
    badges: ['popular'],
    averageRating: 4.4,
    viewCount: 267,
    kind: 'service',
    serviceDuration: 'Contrat mensuel',
    serviceAvailability: '7j/7',
    targetCountries: ['Cote d\'Ivoire', 'Cameroun', 'Nigeria', 'Senegal']
  },
  {
    id: 'prod-22',
    slug: 'gadgets-tech-lagos-bundle',
    name: 'Bundle gadgets tech Lagos',
    description: 'Accessoires tech populaires au Nigeria pour etudiants et freelances.',
    price: 34900,
    oldPrice: 39500,
    stock: 31,
    images: imageSets.power,
    category: 'Energie',
    categorySlug: 'energie',
    problemTag: 'Produits locaux Nigeria',
    sellerId: 'seller-3',
    companyName: 'Urban Mobility Lab',
    sellerCountry: 'Nigeria',
    sellerCity: 'Lagos',
    badges: ['new'],
    averageRating: 4.2,
    viewCount: 198,
    kind: 'product',
    targetCountries: ['Nigeria', 'Kenya', 'Cameroun']
  },
  {
    id: 'prod-15',
    slug: 'boite-rangement-modulaire',
    name: 'Boite rangement modulaire',
    description: 'Organisation simple pour chambre et petit commerce.',
    price: 11800,
    oldPrice: null,
    stock: 39,
    images: imageSets.organization,
    category: 'Organisation',
    categorySlug: 'organisation',
    problemTag: 'Gain de place',
    sellerId: 'seller-2',
    companyName: 'Cuisine Plus Abidjan',
    sellerCountry: 'Cote d\'Ivoire',
    sellerCity: 'Abidjan',
    badges: ['popular'],
    averageRating: 4.4,
    viewCount: 386
  },
  {
    id: 'prod-16',
    slug: 'casque-velo-led',
    name: 'Casque velo LED securite',
    description: 'Protection et visibilite la nuit pour mobilite urbaine.',
    price: 27400,
    oldPrice: 31900,
    stock: 21,
    images: imageSets.mobility,
    category: 'Mobilite',
    categorySlug: 'mobilite',
    problemTag: 'Securite routiere',
    sellerId: 'seller-3',
    companyName: 'RideSafe Gear',
    sellerCountry: 'Nigeria',
    sellerCity: 'Lagos',
    badges: [],
    averageRating: 4.5,
    viewCount: 245
  },
  {
    id: 'prod-17',
    slug: 'corde-connectee-fitness',
    name: 'Corde connectee fitness',
    description: 'Compteur intelligent pour sessions cardio a domicile.',
    price: 14500,
    oldPrice: 17800,
    stock: 33,
    images: imageSets.fitness,
    category: 'Fitness',
    categorySlug: 'fitness',
    problemTag: 'Sport maison',
    sellerId: 'seller-3',
    companyName: 'CardioFlex Afrique',
    sellerCountry: 'Nigeria',
    sellerCity: 'Lagos',
    badges: ['popular'],
    averageRating: 4.3,
    viewCount: 271
  },
  {
    id: 'prod-18',
    slug: 'coffre-securite-bureau',
    name: 'Coffre securite bureau',
    description: 'Protection documents et caisse pour petits commerces.',
    price: 64900,
    oldPrice: null,
    stock: 8,
    images: imageSets.security,
    category: 'Securite',
    categorySlug: 'securite',
    problemTag: 'Protection business',
    sellerId: 'seller-2',
    companyName: 'CoffreSure West',
    sellerCountry: 'Cote d\'Ivoire',
    sellerCity: 'Abidjan',
    badges: ['low_stock'],
    averageRating: 4.8,
    viewCount: 434,
    kind: 'product',
    targetCountries: ['Cote d\'Ivoire', 'Cameroun']
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

export const seededSellerOrders: SellerOrder[] = [
  { id: 'ord-1', sellerId: 'seller-1', productId: 'prod-1', customerName: 'Jean', quantity: 2, total: 37000, status: 'delivered', createdAt: '2026-04-07' },
  { id: 'ord-2', sellerId: 'seller-1', productId: 'prod-14', customerName: 'Mimi', quantity: 1, total: 52900, status: 'processing', createdAt: '2026-04-08' },
  { id: 'ord-3', sellerId: 'seller-2', productId: 'prod-5', customerName: 'Koffi', quantity: 3, total: 51600, status: 'paid', createdAt: '2026-04-08' },
  { id: 'ord-4', sellerId: 'seller-2', productId: 'prod-18', customerName: 'Ruth', quantity: 1, total: 64900, status: 'shipped', createdAt: '2026-04-09' },
  { id: 'ord-5', sellerId: 'seller-3', productId: 'prod-9', customerName: 'Tunde', quantity: 1, total: 689000, status: 'delivered', createdAt: '2026-04-06' },
  { id: 'ord-6', sellerId: 'seller-3', productId: 'prod-17', customerName: 'Ayo', quantity: 2, total: 29000, status: 'pending', createdAt: '2026-04-09' },
  { id: 'ord-7', sellerId: 'seller-1', productId: 'prod-2', customerName: 'Brice', quantity: 1, total: 24500, status: 'delivered', createdAt: '2026-03-20' },
  { id: 'ord-8', sellerId: 'seller-1', productId: 'prod-3', customerName: 'Prisca', quantity: 2, total: 31800, status: 'delivered', createdAt: '2026-03-22' },
  { id: 'ord-9', sellerId: 'seller-1', productId: 'prod-13', customerName: 'Jonas', quantity: 1, total: 21900, status: 'delivered', createdAt: '2026-03-24' },
  { id: 'ord-10', sellerId: 'seller-1', productId: 'prod-19', customerName: 'Rita', quantity: 3, total: 29400, status: 'delivered', createdAt: '2026-03-26' },
  { id: 'ord-11', sellerId: 'seller-1', productId: 'prod-14', customerName: 'Carine', quantity: 1, total: 52900, status: 'shipped', createdAt: '2026-03-28' },
  { id: 'ord-12', sellerId: 'seller-1', productId: 'prod-1', customerName: 'Paul', quantity: 2, total: 37000, status: 'delivered', createdAt: '2026-03-30' },
  { id: 'ord-13', sellerId: 'seller-1', productId: 'prod-4', customerName: 'Dora', quantity: 1, total: 13900, status: 'delivered', createdAt: '2026-04-01' },
  { id: 'ord-14', sellerId: 'seller-1', productId: 'prod-2', customerName: 'Leo', quantity: 1, total: 24500, status: 'delivered', createdAt: '2026-04-02' },
  { id: 'ord-15', sellerId: 'seller-2', productId: 'prod-21', customerName: 'SME Dakar', quantity: 1, total: 45000, status: 'delivered', createdAt: '2026-04-02' },
  { id: 'ord-16', sellerId: 'seller-2', productId: 'prod-8', customerName: 'Awa', quantity: 2, total: 25600, status: 'delivered', createdAt: '2026-04-04' },
  { id: 'ord-17', sellerId: 'seller-2', productId: 'prod-20', customerName: 'Nafi', quantity: 1, total: 21500, status: 'shipped', createdAt: '2026-04-05' },
  { id: 'ord-18', sellerId: 'seller-3', productId: 'prod-9', customerName: 'Ife', quantity: 1, total: 689000, status: 'delivered', createdAt: '2026-04-04' },
  { id: 'ord-19', sellerId: 'seller-3', productId: 'prod-22', customerName: 'Amina', quantity: 2, total: 69800, status: 'paid', createdAt: '2026-04-07' }
];

export const seededSellerViews: Record<string, number[]> = {
  'seller-1': [120, 140, 170, 190, 210, 260, 290],
  'seller-2': [110, 130, 150, 180, 200, 230, 270],
  'seller-3': [150, 170, 210, 250, 300, 340, 390]
};

export const seededRecruitmentOffers: RecruitmentOffer[] = [
  {
    id: 'offer-1',
    companySellerId: 'seller-2',
    targetSellerId: 'seller-3',
    productIds: ['prod-5', 'prod-6', 'prod-18'],
    status: 'pending',
    createdAt: '2026-04-09'
  }
];

export const seededSellerComplaints: SellerComplaint[] = [
  { id: 'cmp-1', sellerId: 'seller-2', reason: 'Retard repete sur prestation', severity: 'medium', createdAt: '2026-04-06' },
  { id: 'cmp-2', sellerId: 'seller-2', reason: 'Qualite produit jugee moyenne', severity: 'low', createdAt: '2026-04-07' }
];

export const seededTestimonials: ClientTestimonial[] = [
  { id: 'tes-1', country: 'Cameroun', city: 'Yaounde', name: 'Client satisfait', rating: 5, comment: 'Livraison rapide et service WhatsApp tres rassurant.' },
  { id: 'tes-2', country: 'Cameroun', city: 'Douala', name: 'Acheteuse locale', rating: 4, comment: 'Produits utiles pour le quotidien, bons vendeurs verifies.' },
  { id: 'tes-3', country: 'Nigeria', city: 'Lagos', name: 'Startup founder', rating: 5, comment: 'Excellent suivi et delais bien annonces.' },
  { id: 'tes-4', country: 'Senegal', city: 'Dakar', name: 'Client business', rating: 4, comment: 'Le choix des vendeurs par niche est tres pratique.' }
];

export const demoUsers: DemoUser[] = [
  {
    id: 'admin-1',
    name: 'Minlang Rayan',
    email: 'admin@min-shop.com',
    password: 'MinShopAdmin2026!',
    role: 'admin',
    country: 'Cameroun',
    city: 'Yaounde',
    phone: '+237 692714985',
    avatar: defaultAvatar,
    sellerType: undefined,
    createdAt: '2026-01-05',
    preferences: []
  },
  {
    id: 'client-1',
    name: 'Aline Mvondo',
    email: 'aline.client@min-shop.com',
    password: 'ClientAline123',
    role: 'client',
    country: 'Cameroun',
    city: 'Yaounde',
    phone: '+237 671111222',
    avatar: defaultAvatar,
    sellerType: undefined,
    createdAt: '2026-02-08',
    preferences: ['energie', 'cuisine']
  },
  {
    id: 'client-2',
    name: 'Cheikh Ndiaye',
    email: 'cheikh.client@min-shop.com',
    password: 'ClientCheikh123',
    role: 'client',
    country: 'Senegal',
    city: 'Dakar',
    phone: '+221 770001122',
    avatar: defaultAvatar,
    sellerType: undefined,
    createdAt: '2026-02-17',
    preferences: ['mobilite', 'organisation']
  },
  ...sellerProfiles.map((seller) => ({
    id: `user-${seller.id}`,
    name: seller.name,
    email: seller.email,
    password: seller.password,
    role: 'seller' as const,
    country: seller.country,
    city: seller.city,
    phone: seller.phone,
    avatar: defaultAvatar,
    sellerId: seller.id,
    sellerType: seller.sellerType,
    createdAt: '2026-03-01',
    preferences: []
  }))
];

export function getAverageRating(reviews: SellerReview[], sellerId: string) {
  const sellerReviews = reviews.filter((review) => review.sellerId === sellerId);
  if (sellerReviews.length === 0) return 0;
  const total = sellerReviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / sellerReviews.length).toFixed(1));
}

export function getSellerProducts(products: MarketplaceProduct[], sellerId: string) {
  return products.filter((product) => product.sellerId === sellerId);
}

export function rankSellersByRating(
  reviews: SellerReview[],
  country?: string,
  city?: string,
  baseSellers: MarketplaceSeller[] = sellerProfiles
) {
  const sellers = baseSellers.filter((seller) => {
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

export function getSellerTrustStats(
  seller: MarketplaceSeller,
  products: MarketplaceProduct[],
  reviews: SellerReview[],
  orders: SellerOrder[],
  complaints: SellerComplaint[]
) {
  const sellerProducts = products.filter((product) => product.sellerId === seller.id);
  const sellerOrders = orders.filter((order) => order.sellerId === seller.id);
  const successfulOrders = sellerOrders.filter((order) => order.status === 'delivered' || order.status === 'shipped').length;
  const satisfiedClients = reviews.filter((review) => review.sellerId === seller.id && review.rating >= 3.5).length;
  const totalOrders = sellerOrders.length;
  const satisfactionRate = totalOrders === 0 ? 0 : Math.round((satisfiedClients / totalOrders) * 100);
  const complaintCount = complaints.filter((entry) => entry.sellerId === seller.id).length;
  const validCatalog = sellerProducts.every((product) => product.images.length > 0 && product.description.trim().length >= 16);
  const hasBadge =
    seller.identityVerified &&
    validCatalog &&
    successfulOrders >= 10 &&
    satisfactionRate >= 80 &&
    complaintCount < 3;

  return {
    hasBadge,
    successfulOrders,
    satisfiedClients,
    satisfactionRate,
    complaintCount,
    validCatalog
  };
}

export function getSellerDashboardData(
  sellerId: string,
  products: MarketplaceProduct[],
  reviews: SellerReview[],
  orders: SellerOrder[]
) {
  const sellerProducts = getSellerProducts(products, sellerId);
  const sellerOrders = orders.filter((order) => order.sellerId === sellerId);
  const totalStock = sellerProducts.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = sellerProducts.filter((product) => product.stock <= 10).length;
  const revenue = sellerOrders.reduce((sum, order) => sum + order.total, 0);
  const averageRating = getAverageRating(reviews, sellerId);

  return {
    products: sellerProducts,
    orders: sellerOrders,
    totalStock,
    lowStock,
    revenue,
    averageRating,
    reviewCount: reviews.filter((review) => review.sellerId === sellerId).length
  };
}

export function findUserByCredentials(users: DemoUser[], email: string, password: string) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password) ?? null;
}

export function findSellerBySlug(slug: string) {
  return sellerProfiles.find((seller) => seller.slug === slug) ?? null;
}
