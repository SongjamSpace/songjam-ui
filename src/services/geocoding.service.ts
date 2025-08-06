import { NominatimResponse } from '../types/map.types';
import {
  createGeocodingDoc,
  getGeocodingDoc,
  createFailedGeocodingDoc,
} from './db/geocoding.service';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export interface GeocodingOptions {
  limit?: number;
  format?: 'json' | 'xml';
  addressdetails?: number;
  extratags?: number;
  namedetails?: number;
}

/**
 * Geocode a location with Firebase caching
 * First checks if coordinates are cached in Firebase, if not calls the API and stores the result
 * @param location - The location string to geocode
 * @param options - Optional parameters for the API request
 * @returns Promise<NominatimResponse[]> - Array of geocoding results
 */
export const geocodeLocationWithCache = async (
  location: string,
  options: GeocodingOptions = {}
): Promise<NominatimResponse[]> => {
  try {
    // First, check if we have cached coordinates in Firebase
    const cachedData = await getGeocodingDoc(location);

    if (cachedData) {
      // Check if this location was previously marked as invalid
      if (cachedData.invalid) {
        console.log(
          `Location "${location}" was previously marked as invalid, skipping`
        );
        return [];
      }

      // Check if we have valid cached coordinates
      if (cachedData.lat && cachedData.lon) {
        // Return cached data in NominatimResponse format
        const cachedResponse: NominatimResponse = {
          place_id: cachedData.place_id,
          licence: '',
          osm_type: '',
          osm_id: 0,
          boundingbox: [],
          lat: cachedData.lat.toString(),
          lon: cachedData.lon.toString(),
          display_name: cachedData.display_name,
          name: cachedData.name || cachedData.display_name,
          class: '',
          type: cachedData.type,
          importance: 0,
        };
        return [cachedResponse];
      }
    }

    // If not cached, call the API
    const apiResult = await geocodeLocation(location, options);

    // If API call was successful and we got coordinates, cache them
    if (apiResult && apiResult.length > 0) {
      const firstResult = apiResult[0];
      const coordinates = extractCoordinates(apiResult);

      if (coordinates) {
        try {
          await createGeocodingDoc(location, {
            lat: parseFloat(firstResult.lat),
            lon: parseFloat(firstResult.lon),
            display_name: firstResult.display_name,
            place_id: firstResult.place_id,
            type: firstResult.type,
            name: firstResult.name,
          });
        } catch (cacheError) {
          console.warn('Failed to cache geocoding result:', cacheError);
          // Don't throw here, we still want to return the API result
        }
      } else {
        // No coordinates found, mark as invalid
        try {
          await createFailedGeocodingDoc(
            location,
            'No coordinates found in API response'
          );
        } catch (cacheError) {
          console.warn('Failed to cache failed geocoding result:', cacheError);
        }
      }
    } else {
      // API returned no results, mark as invalid
      try {
        await createFailedGeocodingDoc(
          location,
          'No results from geocoding API'
        );
      } catch (cacheError) {
        console.warn('Failed to cache failed geocoding result:', cacheError);
      }
    }

    return apiResult;
  } catch (error) {
    console.error('Geocoding with cache error:', error);

    // Store the failed attempt
    try {
      await createFailedGeocodingDoc(
        location,
        error instanceof Error ? error.message : 'Unknown error'
      );
    } catch (cacheError) {
      console.warn('Failed to cache failed geocoding result:', cacheError);
    }

    throw error;
  }
};

/**
 * Geocode a location string using Nominatim API
 * @param location - The location string to geocode
 * @param options - Optional parameters for the API request
 * @returns Promise<NominatimResponse[]> - Array of geocoding results
 */
export const geocodeLocation = async (
  location: string,
  options: GeocodingOptions = {}
): Promise<NominatimResponse[]> => {
  try {
    const params = new URLSearchParams({
      q: location,
      format: options.format || 'json',
      limit: (options.limit || 1).toString(),
      addressdetails: (options.addressdetails || 0).toString(),
      extratags: (options.extratags || 0).toString(),
      namedetails: (options.namedetails || 0).toString(),
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'User-Agent': 'SongJam-UI/1.0', // Required by Nominatim terms of service
      },
    });

    if (!response.ok) {
      throw new Error(
        `Geocoding failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

/**
 * Geocode multiple locations with Firebase caching and rate limiting
 * @param locations - Array of location strings to geocode
 * @param delayMs - Delay between requests in milliseconds (default: 1000ms)
 * @returns Promise<NominatimResponse[][]> - Array of geocoding results for each location
 */
export const geocodeLocationsWithCache = async (
  locations: string[],
  delayMs: number = 1000
): Promise<NominatimResponse[][]> => {
  const results: NominatimResponse[][] = [];

  for (let i = 0; i < locations.length; i++) {
    try {
      const result = await geocodeLocationWithCache(locations[i]);
      results.push(result);

      // Add delay between requests to respect rate limits
      if (i < locations.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Failed to geocode location "${locations[i]}":`, error);
      results.push([]); // Empty array for failed geocoding
    }
  }

  return results;
};

/**
 * Extract coordinates from Nominatim response
 * @param response - Nominatim API response
 * @returns [number, number] | null - [longitude, latitude] or null if no coordinates
 */
export const extractCoordinates = (
  response: NominatimResponse[]
): [number, number] | null => {
  if (!response || response.length === 0) {
    return null;
  }

  const firstResult = response[0];
  const lat = parseFloat(firstResult.lat);
  const lon = parseFloat(firstResult.lon);

  if (isNaN(lat) || isNaN(lon)) {
    return null;
  }

  return [lon, lat]; // Return as [longitude, latitude] for MapView compatibility
};

/**
 * Get cached coordinates for a location without making API calls
 * @param location - The location string to get cached coordinates for
 * @returns Promise<[number, number] | null> - Cached coordinates or null if not cached
 */
export const getCachedCoordinates = async (
  location: string
): Promise<[number, number] | null> => {
  try {
    const cachedData = await getGeocodingDoc(location);

    // Check if this location was previously marked as invalid
    if (cachedData && cachedData.invalid) {
      console.log(
        `Location "${location}" was previously marked as invalid, skipping`
      );
      return null;
    }

    if (cachedData && cachedData.lat && cachedData.lon) {
      return [parseFloat(cachedData.lon), parseFloat(cachedData.lat)];
    }
    return null;
  } catch (error) {
    console.error('Error getting cached coordinates:', error);
    return null;
  }
};

/**
 * Check if a location is marked as invalid in the cache
 * @param location - The location string to check
 * @returns Promise<boolean> - True if marked as invalid, false otherwise
 */
export const isLocationInvalid = async (location: string): Promise<boolean> => {
  try {
    const cachedData = await getGeocodingDoc(location);
    return !!(cachedData && cachedData.invalid);
  } catch (error) {
    console.error('Error checking if location is invalid:', error);
    return false;
  }
};
