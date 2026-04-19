export const faqKnowledge = {
  delivery: [
    'Les delais dependent de la ville, du stock et du transport estime.',
    'Meme ville: livraison rapide en moto. Inter-ville: voiture/camion. International: avion.'
  ],
  payment: [
    'Min-shop accepte les moyens locaux (mobile money) et les cartes selon le pays.',
    'Le paiement est confirme avant l expedition pour limiter les annulations.'
  ],
  returns: [
    'Les retours sont possibles selon la politique du vendeur et le type d article.',
    'Les produits endommages ou non conformes peuvent etre signales rapidement via support.'
  ]
};

export const complementaryCategoryMap: Record<string, string[]> = {
  energie: ['securite', 'mobilite'],
  cuisine: ['organisation', 'energie'],
  securite: ['energie', 'organisation'],
  mobilite: ['fitness', 'energie'],
  fitness: ['mobilite', 'organisation'],
  organisation: ['cuisine', 'securite'],
  sante: ['fitness', 'cuisine'],
  education: ['organisation', 'energie'],
  agriculture: ['maison', 'energie'],
  maison: ['organisation', 'securite'],
  'beaute-soins': ['sante', 'pret-a-porter'],
  'accessoires-telephone': ['energie', 'mobilite'],
  'pret-a-porter': ['beaute-soins', 'accessoires-telephone']
};

export const categoryKeywords: Record<string, string[]> = {
  energie: ['solaire', 'power', 'batterie', 'charge', 'lampe', 'energie'],
  cuisine: ['mixeur', 'friteuse', 'cuisine', 'cuisson', 'ustensile', 'gaz'],
  securite: ['alarme', 'camera', 'serrure', 'securite', 'coffre', 'protection'],
  mobilite: ['scooter', 'trottinette', 'velo', 'transport', 'mobilite', 'casque'],
  fitness: ['fitness', 'sport', 'montre', 'cardio', 'entrainement'],
  organisation: ['rangement', 'boite', 'organisation', 'bureau', 'stockage'],
  sante: ['sante', 'hygiene', 'bien-etre', 'soin', 'pharmacie'],
  education: ['education', 'ecole', 'eleve', 'etudiant', 'apprentissage'],
  agriculture: ['agriculture', 'ferme', 'semence', 'irrigation', 'recolte'],
  maison: ['maison', 'menage', 'entretien', 'domestique', 'foyer'],
  'beaute-soins': ['beaute', 'soin', 'serum', 'creme', 'peau', 'capillaire', 'cosmetique'],
  'accessoires-telephone': ['telephone', 'coque', 'chargeur', 'cable', 'ecouteurs', 'smartphone'],
  'pret-a-porter': ['pret a porter', 'mode', 'chemise', 'robe', 'sac', 'vetement', 'boutique']
};

export const vagueWords = ['divers', 'best', 'incroyable', 'miracle', 'top top', 'qualite premium absolue'];

export const cityDistanceBands: Array<{ from: string; to: string; km: number }> = [
  { from: 'Yaounde', to: 'Douala', km: 240 },
  { from: 'Yaounde', to: 'Bafoussam', km: 295 },
  { from: 'Douala', to: 'Bafoussam', km: 282 },
  { from: 'Yaounde', to: 'Ebolowa', km: 150 },
  { from: 'Douala', to: 'Kribi', km: 180 },
  { from: 'Abidjan', to: 'Yamoussoukro', km: 240 },
  { from: 'Dakar', to: 'Thies', km: 70 },
  { from: 'Lagos', to: 'Abuja', km: 760 },
  { from: 'Nairobi', to: 'Mombasa', km: 490 }
];
