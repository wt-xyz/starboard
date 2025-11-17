/**
 * Seeded random number generator for deterministic mock data.
 * Uses a simple multiplicative hash function for the seed.
 */
export function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  let state = Math.abs(hash);
  
  return function() {
    // Linear congruential generator
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Generate a random integer between min and max (inclusive) using a seeded random generator.
 */
export function seededRandomInt(seed: string, min: number, max: number): number {
  const rand = seededRandom(seed);
  return Math.floor(rand() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max using a seeded random generator.
 */
export function seededRandomFloat(seed: string, min: number, max: number): number {
  const rand = seededRandom(seed);
  return rand() * (max - min) + min;
}




