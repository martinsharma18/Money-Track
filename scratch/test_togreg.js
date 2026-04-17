const bs = require('bikram-sambat');

const date = bs.toGreg(2081, 1, 1);
console.log('2081-01-01 BS to AD:', date);
console.log('Type of return:', typeof date);
console.log('Is Date instance:', date instanceof Date);
