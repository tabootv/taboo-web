/**
 * Environment variable validation utility.
 * Throws errors if required environment variables are missing.
 */

/**
 * Gets an environment variable, throwing an error if it's not set.
 *
 * @param key - The environment variable key
 * @returns The environment variable value
 * @throws {Error} If the environment variable is not set
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];

  if (value === undefined || value === '') {
    throw new Error(
      `Missing required environment variable: ${key}. Please set it in your .env file.`
    );
  }

  return value;
}
