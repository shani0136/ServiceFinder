import type { Provider } from '../types';

/**
 * Generates a URL-encoded WhatsApp deep link with the required pre-filled message:
 * "Hi, I found your service on ServiceFinder. I need help with [service/problem]. I am located in [area]. Are you available?"
 * Uses the provider's registered phone number.
 */
export function buildWhatsAppUrl(
  provider: Provider,
  problemOrService: string,
  area: string
): string {
  // Use registered whatsapp number, or fallback to phone
  const rawNumber = (provider.whatsapp || provider.phone || '').replace(/\D/g, '');
  const number = rawNumber.startsWith('91')
    ? rawNumber
    : rawNumber.length === 10
    ? `91${rawNumber}`
    : rawNumber;

  const neededService = problemOrService || provider.service;
  const userArea = area || provider.serviceArea;

  const message = `Hi, I found your profile on ServiceFinder. I need your ${neededService} service in ${userArea}. Are you available?`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}
