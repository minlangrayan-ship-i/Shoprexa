export const launchCountry = 'CM';
export const launchCountryName = 'Cameroun';

export const cameroonGeo = {
  Yaounde: ['Bastos', 'Mvog-Ada', 'Ngoa-Ekelle', 'Etoudi', 'Nkolbisson', 'Mendong', 'Odza'],
  Douala: ['Bonamoussadi', 'Akwa', 'Deido', 'Makepe', 'Logpom', 'Bonaberi'],
  Bafoussam: ['Djeleng', 'Kamkop', 'Tyo-ville', 'Tamdja'],
  Sud: ['Ebolowa', 'Sangmelima', 'Kribi']
} as const;

export type CameroonCity = keyof typeof cameroonGeo;

export function getLaunchCities() {
  return Object.keys(cameroonGeo) as CameroonCity[];
}

export function getCityDistricts(city: string) {
  return cameroonGeo[city as CameroonCity] ?? [];
}

export function getLogisticsZone(city: string) {
  if (city === 'Yaounde' || city === 'Douala') return city;
  if (city === 'Bafoussam') return 'Bafoussam';
  return 'Sud';
}

export function isLaunchCountry(country: string) {
  return country === launchCountryName;
}

export function isSupportedLaunchCity(city: string) {
  return getLaunchCities().includes(city as CameroonCity);
}

export function normalizeToLaunchCountry() {
  return launchCountryName;
}

export function getDeliveryInfo(city: string, district?: string) {
  const districtSuffix = district ? ` (${district})` : '';
  const logisticsZone = getLogisticsZone(city);

  if (logisticsZone === 'Yaounde' || logisticsZone === 'Douala') {
    return {
      zoneLogistique: logisticsZone,
      estimatedDelay: '24h - 48h',
      messageUtilisateur: `Livraison estimée : 24h à 48h pour ${city}${districtSuffix}.`
    };
  }

  if (logisticsZone === 'Bafoussam') {
    return {
      zoneLogistique: 'Bafoussam',
      estimatedDelay: '2 - 4 jours',
      messageUtilisateur: `Livraison estimée : 2 à 4 jours pour Bafoussam${districtSuffix}.`
    };
  }

  return {
    zoneLogistique: 'Sud',
    estimatedDelay: '2 - 5 jours',
    messageUtilisateur: `Livraison estimée : 2 à 5 jours pour la zone Sud${districtSuffix}.`
  };
}
