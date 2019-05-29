const path = require('path');

module.exports = {
    entry: [
        './src/main.js',
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'gol.js',
        libraryTarget: 'umd',
        globalObject: 'this',
        library: 'gol',        
    },
    module: {
        rules: [
            {
                loader: 'babel-loader',
                test: /\.js$/,
                include: [path.resolve(__dirname, 'src')],
                exclude: /node_modules/,
                query: {
                    presets: ['@babel/env']
                }
            }
        ]
    }
};
