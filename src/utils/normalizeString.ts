const normalizeString = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[àáâãäåª]+/g, 'a')
    .replace(/[èéêë]+/g, 'e')
    .replace(/[ìíîï]+/g, 'i')
    .replace(/[òóôõöº]+/g, 'o')
    .replace(/[ùúûü]+/g, 'u')
    .replace(/[ýÿ]+/g, 'y')
    .replace(/[ñ]+/g, 'n')
    .replace(/[ç]+/g, 'c')

export default normalizeString
