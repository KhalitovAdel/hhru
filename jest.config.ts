export default {
    displayName: 'hh',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.json',
        },
    },
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'html'],
};
