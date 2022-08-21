const generator = require('./main');

let password = generator.generate({
	length: 15,
	numbers: true,
	symbols: true,
	uppercase: true,
	strict: true
});

console.log(password);