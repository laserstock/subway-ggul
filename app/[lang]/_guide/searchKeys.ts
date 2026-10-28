/** Lowercase, accent- and punctuation-free, without a trailing "station"/역/站/駅. */
export function normalizeQuery(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\-–.·'’()]/g, "")
    .replace(/(station|역|站|駅)$/u, "");
}
