import { categoryKeywords } from '@/db/mock-ai-data';
import { marketplaceCategories } from '@/lib/mock-marketplace';
import { getLaunchCities, launchCountryName } from '@/lib/geo-config';
import type { ParsedUserQuery, QueryIntent } from '@/types/marketplace-ai';

const STOP_WORDS = new Set([
  'je', 'cherche', 'un', 'une', 'de', 'des', 'du', 'le', 'la', 'les', 'et', 'pour', 'avec', 'dans',
  'the', 'a', 'an', 'to', 'for', 'in', 'on', 'at', 'is', 'are', 'please', 'svp'
]);

function tokenize(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

function parseIntent(text: string): QueryIntent {
  if (text.includes('comparer') || text.includes('compare') || text.includes('difference')) return 'compare_products';
  if (text.includes('livraison') || text.includes('delivery') || text.includes('delai')) return 'delivery_question';
  if (text.includes('cherche') || text.includes('find') || text.includes('buy') || text.includes('besoin')) return 'find_product';
  return 'general_help';
}

function parseBudget(text: string) {
  const compact = text.replace(/\s/g, '');
  const match = compact.match(/(\d{4,9})/);
  if (!match) return null;
  return Number(match[1]);
}

function parseCategory(text: string) {
  const normalized = text.toLowerCase();
  for (const category of marketplaceCategories) {
    if (normalized.includes(category.slug)) return category.slug;
    if (normalized.includes(category.label.toLowerCase())) return category.slug;
  }

  for (const [slug, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) return slug;
  }

  return null;
}

function parseLocation(text: string) {
  const normalized = text.toLowerCase();
  const cities = getLaunchCities();
  let country: string | null = null;
  let city: string | null = null;

  if (normalized.includes(launchCountryName.toLowerCase())) {
    country = launchCountryName;
  }

  for (const cityName of cities) {
    if (normalized.includes(cityName.toLowerCase())) {
      city = cityName;
      country = launchCountryName;
    }
  }

  return { country, city };
}

export function parseUserQuery(input: string): ParsedUserQuery {
  const intent = parseIntent(input.toLowerCase());
  const categorySlug = parseCategory(input);
  const budgetMax = parseBudget(input);
  const location = parseLocation(input);
  const tokens = tokenize(input);
  const needs = tokens.filter((token) => !STOP_WORDS.has(token)).slice(0, 8);

  return {
    raw: input,
    intent,
    categorySlug,
    budgetMax,
    country: location.country,
    city: location.city,
    needs,
    tokens
  };
}
