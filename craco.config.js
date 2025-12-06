const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: webpackConfig => {
      // Fix for mapbox-gl
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };

      return webpackConfig;
    },
  },
  style: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
};
