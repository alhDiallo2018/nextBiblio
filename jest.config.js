module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/app/$1",  
  },
  modulePaths: ["<rootDir>/app"],
  moduleDirectories: [
    "node_modules",
    "<rootDir>/app", 
  ],
};
