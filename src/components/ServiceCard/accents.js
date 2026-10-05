/**
 * Teintes du catalogue, reprises de hikube.cloud (hikube-web, src/content/accents.ts).
 *
 * Sur le site, la couleur dit de quoi parle la page (bleu compute, cyan
 * Kubernetes, violet GPU, orange bases de données…) et le vert reste réservé à
 * l'action. Les cartes de la doc suivent la même taxonomie.
 *
 * `bright` est calibrée pour le graphite, `deep` pour le papier (≥ 4,5:1).
 */
export const ACCENTS = {
  compute: {bright: '#3b82f6', deep: '#085ce6'},
  kubernetes: {bright: '#25bdeb', deep: '#0c6f8d'},
  gpu: {bright: '#ae62f8', deep: '#8e20f7'},
  databases: {bright: '#f97316', deep: '#ab4803'},
  messaging: {bright: '#f4511e', deep: '#be3307'},
  storage: {bright: '#059669', deep: '#037350'},
  neutral: {bright: '#a99e95', deep: '#6b6158'},
};

// Mots-clés cherchés dans le href et le chemin de l'icône, dans cet ordre.
const KEYWORDS = [
  ['gpu', 'gpu'],
  ['kubernetes', 'kubernetes'],
  ['compute', 'compute'],
  ['virtual-machine', 'compute'],
  ['networking', 'compute'],
  ['vpc', 'compute'],
  ['messaging', 'messaging'],
  ['kafka', 'messaging'],
  ['rabbitmq', 'messaging'],
  ['nats', 'messaging'],
  ['storage', 'storage'],
  ['disk', 'storage'],
  ['bucket', 'storage'],
  ['s3', 'storage'],
  ['databases', 'databases'],
  ['postgres', 'databases'],
  ['mysql', 'databases'],
  ['mariadb', 'databases'],
  ['redis', 'databases'],
  ['clickhouse', 'databases'],
  ['mongo', 'databases'],
];

/**
 * Résout la teinte d'une carte : prop `accent` explicite (nom de famille ou
 * couleur hexadécimale), sinon déduite du lien et de l'icône, sinon neutre.
 */
export function resolveAccent({accent, href = '', icon = ''}) {
  if (accent && ACCENTS[accent]) return ACCENTS[accent];
  if (accent && /^#[0-9a-f]{3,8}$/i.test(accent)) {
    return {bright: accent, deep: accent};
  }
  const haystack = `${href} ${icon}`.toLowerCase();
  const match = KEYWORDS.find(([keyword]) => haystack.includes(keyword));
  return match ? ACCENTS[match[1]] : ACCENTS.neutral;
}
