/**
 * Generate a UUID using the Web Crypto API
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};
