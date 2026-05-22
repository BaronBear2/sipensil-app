const today = new Date("2026-06-02")
const regStart = new Date("2026-06-01")
const parts = "2026-06-01".split('-')
regStart.setFullYear(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
regStart.setHours(0, 0, 0, 0)

const isUpcoming = regStart && today < regStart
console.log('today:', today)
console.log('regStart:', regStart)
console.log('isUpcoming:', isUpcoming)
