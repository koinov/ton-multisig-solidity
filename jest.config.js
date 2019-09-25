module.exports = {
	moduleFileExtensions: [
		'js',
	],
	transform: {
		'^.+\\.js$': 'babel-jest',
	},
	testPathIgnorePatterns: [
		"<rootDir>/node_modules/",
		"<rootDir>/contracts/",
		"<rootDir>/__tests__/init.js",
	],
};
