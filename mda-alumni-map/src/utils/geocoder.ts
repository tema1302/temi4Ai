import { logger } from '../services/logger';

export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
}

export async function searchAddresses(query: string, bias?: { lat: number, lon: number }): Promise<GeocodeResult[]> {
  if (!query || query.length < 3) return [];

  try {
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    
    // Bias results towards user location if available (approx 1 degree around the user)
    if (bias) {
      const viewbox = `${bias.lon - 1},${bias.lat + 1},${bias.lon + 1},${bias.lat - 1}`;
      url += `&viewbox=${viewbox}`;
    }

    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'ru-RU,ru;q=0.9',
        'User-Agent': 'MDA-Alumni-Map-App'
      }
    });

    if (!response.ok) throw new Error('Search service error');

    const data = await response.json();

    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      displayName: item.display_name
    }));
  } catch (error) {
    logger.error('Search failed', error);
    return [];
  }
}
