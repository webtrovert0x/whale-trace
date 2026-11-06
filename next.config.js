const webpack = require("webpack");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@x402/evm": false,
      "@x402/core": false,
      "@x402/svm": false,
      "@x402/evm/upto/client": false,
      "@x402/evm/exact/client": false,
      "@x402/core/client": false,
      "@x402/svm/exact/client": false,
      mppx: false,
      "mppx/client": false,
      "@metamask/connect-evm": false,
      accounts: false,
    };
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(@x402|mppx|@metamask\/connect-evm|accounts)/,
      })
    );
    return config;
  },
};

module.exports = nextConfig;
