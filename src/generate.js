const crypto = require('crypto');

let randomIndex;
let randomBytes;

const getNextRandomValue = function () {
	if (randomIndex === undefined || randomIndex >= randomBytes.length) {
		randomIndex = 0;
		randomBytes = crypto.randomBytes(256);
	}

	const result = randomBytes[randomIndex];
	randomIndex += 1;

	return result;
};

const randomNumber = function (max) {
	let rand = getNextRandomValue();
	while (rand >= 256 - (256 % max)) {
		rand = getNextRandomValue();
	}
	return rand % max;
};

const lowercase = 'abcdefghijklmnopqrstuvwxyz',
	uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	numbers = '0123456789',
	symbols = '!@#$%^&*()+_-=}{[]|:;"/?.><,`~',
	similarCharacters = /[ilLI|`oO0]/g,
	strictRules = [
		{name: 'lowercase', rule: /[a-z]/},
		{name: 'uppercase', rule: /[A-Z]/},
		{name: 'numbers', rule: /[0-9]/},
		{name: 'symbols', rule: /[!@#$%^&*()+_\-=}{[\]|:;"/?.><,`~]/}
	];

const generate = function (options, pool) {
	let password = '';
	const optionsLength = options.length,
		poolLength = pool.length;

	for (let i = 0; i < optionsLength; i++) {
		password += pool[randomNumber(poolLength)];
	}

	if (options.strict) {
		const fitsRules = strictRules.every(function (rule) {
			if (options[rule.name] === false) return true;

			if (rule.name === 'symbols' && typeof options[rule.name] === 'string') {
				const re = new RegExp('[' + options[rule.name] + ']');
				return re.test(password);
			}

			return rule.rule.test(password);
		});

		if (!fitsRules) return generate(options, pool);
	}

	return password;
};

module.exports.generate = function(options) {
	options = options || {};
	if (!Object.prototype.hasOwnProperty.call(options, 'length')) options.length = 10;
	if (!Object.prototype.hasOwnProperty.call(options, 'numbers')) options.numbers = false;
	if (!Object.prototype.hasOwnProperty.call(options, 'symbols')) options.symbols = false;
	if (!Object.prototype.hasOwnProperty.call(options, 'exclude')) options.exclude = '';
	if (!Object.prototype.hasOwnProperty.call(options, 'uppercase')) options.uppercase = true;
	if (!Object.prototype.hasOwnProperty.call(options, 'lowercase')) options.lowercase = true;
	if (!Object.prototype.hasOwnProperty.call(options, 'excludeSimilarCharacters')) options.excludeSimilarCharacters = false;
	if (!Object.prototype.hasOwnProperty.call(options, 'strict')) options.strict = false;

	if (options.strict) {
		const minStrictLength = 1 + (options.numbers ? 1 : 0) + (options.symbols ? 1 : 0) + (options.uppercase ? 1 : 0);
		if (minStrictLength > options.length) {
			throw new TypeError('Length must correlate with strict guidelines');
		}
	}

	let pool = '';

	if (options.lowercase) {
		pool += lowercase;
	}

	if (options.uppercase) {
		pool += uppercase;
	}
	if (options.numbers) {
		pool += numbers;
	}
	if (options.symbols) {
		if (typeof options.symbols === 'string') {
			pool += options.symbols;
		} else {
			pool += symbols;
		}
	}

	if (!pool) {
		throw new TypeError('At least one rule for pools must be true');
	}

	if (options.excludeSimilarCharacters) {
		pool = pool.replace(similarCharacters, '');
	}

	let i = options.exclude.length;
	while (i--) {
		pool = pool.replace(options.exclude[i], '');
	}

	return generate(options, pool);
};

module.exports.generateMultiple = function(amount, options) {
	const passwords = [];

	for (let i = 0; i < amount; i++) {
		passwords[i] = module.exports.generate(options);
	}

	return passwords;
};
