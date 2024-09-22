export default {
	extensionsToTreatAsEsm: [".ts", ".tsx", ".jsx"],
	transform: {
		"^.+\\.(t|j)sx?$": [
			"babel-jest",
			{
				presets: [
					"@babel/preset-env",
					"@babel/preset-react",
					"@babel/preset-typescript",
				],
			},
		],
		"^.+\\.(js|jsx|mjs)$": "babel-jest",
	},
	transformIgnorePatterns: [
		"node_modules/(?!@apollo/client)" // Allow Apollo Client files to be transformed
	  ],
	preset: 'ts-jest',
	testEnvironment: "jsdom",
	setupFilesAfterEnv: ["./test/jest.setup.js"]
};
