require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  db: {
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'error_tracker',
    port:     process.env.DB_PORT     || 3306,
  },
  ai: {
    apiKey: process.env.AI_API_KEY || '',
    model:  process.env.AI_MODEL   || 'gemini-2.0-flash',
  },
  jwt: {
    secret:    process.env.JWT_SECRET     || 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};
