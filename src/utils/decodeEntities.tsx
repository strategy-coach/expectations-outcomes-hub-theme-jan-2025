type EntityMap = Record<string, string>;

export function decodeEntities(encodedString: string): string {
  const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  const translate: EntityMap = {
    nbsp: " ",
    amp: "&",
    quot: '"',
    lt: "<",
    gt: ">",
  };
  return encodedString
    .replace(translate_re, function (match, entity: keyof EntityMap) {
      return translate[entity];
    })
    .replace(/&#(\d+);/gi, function (match, numStr) {
      const num = parseInt(numStr, 10);
      return String.fromCharCode(num);
    });
}