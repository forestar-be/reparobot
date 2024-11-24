require('dotenv').config();

module.exports = {
  env: {
    API_URL: process.env.API_URL,
    AUTH_TOKEN: process.env.AUTH_TOKEN,
  },
  productionBrowserSourceMaps: true
};
