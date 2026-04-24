const serverless = require('serverless-http');
const app = require('../../server/src/app');

// Wrap Express app with serverless-http for Netlify Functions
// We enable binary support for file uploads (CVs)
module.exports.handler = serverless(app, {
    binary: ['*/*']
});
