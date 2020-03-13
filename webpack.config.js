const path = require('path');

module.exports = {
    mode: "development",
    devtool: 'inline-source-map',
    entry: {
        "examples/Applications/TrafficLight": "./examples/Applications/TrafficLight/script.ts",
        "examples/Applications/SimpleTimer": "./examples/Applications/SimpleTimer/script.ts",
    },
    output: {
        path: path.resolve(__dirname),
        filename: '[name]/bundle.js',
        libraryTarget: 'global',
    },
    module: {
        rules: [{
            test: /\.ts?$/,
            use: [{
                loader: 'ts-loader',
                options: {
                    configFile: 'tsconfig.json',
                    context: path.resolve('./examples'),
                }
            }],
            exclude: /node_modules/,
        },
        ]
    },
    resolve: {
        extensions: ['.ts'],
    },
}
