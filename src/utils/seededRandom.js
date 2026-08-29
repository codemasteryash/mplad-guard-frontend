// Small deterministic PRNG so the same project id always produces the same
// "AI" scorecard, anomalies, and risk numbers across page visits — without
// needing a backend to persist anything.

export function hashStringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeededRandom(key) {
  const rand = mulberry32(hashStringToSeed(String(key)));
  return {
    next: () => rand(),
    int: (min, max) => Math.floor(rand() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(rand() * arr.length)],
    bool: (probability = 0.5) => rand() < probability,
  };
}
