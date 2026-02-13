Go to your GitHub repository
Click on craco.config.js
Click the pencil icon (edit)
Delete everything in the file
Copy and paste this instead:
// craco.config.js - Simplified for production deployment
const path = require("path");

module.exports = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
