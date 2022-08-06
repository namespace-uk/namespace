const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/index.tsx",
    output: {
        path: path.join(__dirname, "/dist"),
        filename: "main.js"
        // publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.tsx$/,
                exclude: "/node_modules/",
                use: {
                    loader: "awesome-typescript-loader"
                }
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            { 
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000' 
            },
            {
                test: /\.css$/,
                use: [
                    "css-loader"
                ]
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html",
            favicon: "./public/assets/img/png/logo_nobg.png"
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        })
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    devServer: {
        historyApiFallback: true
    }
}