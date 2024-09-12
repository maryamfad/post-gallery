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
	},
	testEnvironment: "jsdom",
	setupFilesAfterEnv: ["./test/jest.setup.js"]
};
