// Small helper to make unique-enough IDs without adding a uuid dependency.
export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
