const roundNumber = (value: number, precision = 2) => {
  const base = Math.pow(10, precision)

  return Math.round(value * base) / base
}

export default roundNumber
