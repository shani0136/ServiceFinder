/**
 * Reverse-geocodes the user's GPS coordinates to a human-readable city name
 * using the free OpenStreetMap Nominatim API (no API key required).
 *
 * Returns the city name string, or throws if geolocation is denied/unsupported.
 */
export async function detectUserCity(): Promise<string> {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported in this browser.');
  }

  return new Promise<string>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (!res.ok) throw new Error('Nominatim request failed');
          const data = await res.json() as {
            address?: {
              city?: string;
              town?: string;
              village?: string;
              suburb?: string;
              county?: string;
              state?: string;
            };
          };
          const a = data.address ?? {};
          const city =
            a.city ?? a.town ?? a.village ?? a.suburb ?? a.county ?? a.state ?? '';
          resolve(city);
        } catch {
          resolve(''); // non-fatal — user can type manually
        }
      },
      (err) => reject(new Error(err.message ?? 'Location permission denied'))
    );
  });
}

export const detectCity = detectUserCity;
