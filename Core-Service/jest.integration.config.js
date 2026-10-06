module.exports = {
    preset : 'ts-jest',
    testEnvironment : 'node',
    roots: ['<rootDir>/tests/integration'],
    testMatch: ['**/*integration.test.ts'],
    setupFiles:['<rootDir>/tests/setup-env.ts'],
    globalSetup: '<rootDir>/tests/integration/globalSetup.ts',
    globalTeardown: '<rootDir>/tests/integration/teardown.ts',
    maxWorkers: 1, // Limit to 1 worker to avoid conflicts with shared resources
    forceExit: true, // Force exit after tests to ensure cleanup
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {tsconfig: 'tsconfig.test.json'}],
    }
}