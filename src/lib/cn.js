// cn() sans dépendances — fusion simple de classes Tailwind
export function cn(...inputs) {
  return inputs
    .flat()
    .filter(x => typeof x === 'string' && x)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
