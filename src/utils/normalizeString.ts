const normalizeString = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[àáâãäåª]+/g, 'a')
    .replace(/[èéêë]+/g, 'e')
    .replace(/[ìíîï]+/g, 'i')
    .replace(/[òóôõöº]+/g, 'o')
    .replace(/[ùúûü]+/g, 'u')
    .replace(/[ýÿ]+/g, 'y')
    .replace(/[ñ]+/g, 'n')
    .replace(/[ç]+/g, 'c')
    .toUpperCase()

export default normalizeString
