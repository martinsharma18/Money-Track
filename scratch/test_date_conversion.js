const bs = require('bikram-sambat');

const date = new Date('2024-04-17');
const bsDate = bs.toBik(date);
console.log('2024-04-17 AD to BS:', bsDate);

const date2 = new Date();
const bsDate2 = bs.toBik(date2);
console.log('Today AD to BS:', bsDate2);
