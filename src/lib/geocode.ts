import { GeocodeResult } from './types';

// Simple reverse geocode using OpenStreetMap Nominatim API
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=zh`,
      {
        headers: {
          'User-Agent': 'MemoryPlanet/1.0',
        },
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const address = data.address || {};
    return {
      city: address.city || address.town || address.village || address.county || '',
      country: address.country || '',
      displayName: data.display_name || '',
    };
  } catch {
    return null;
  }
}

// Search locations by name (for the add-memory form)
export async function searchLocation(query: string): Promise<{ lat: number; lng: number; name: string }[]> {
  if (!query || query.length < 2) return [];
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&accept-language=zh`,
      {
        headers: {
          'User-Agent': 'MemoryPlanet/1.0',
        },
      }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      name: item.display_name,
    }));
  } catch {
    return [];
  }
}
