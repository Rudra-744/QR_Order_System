// Centralized JWT configuration.
// Fails fast if JWT_SECRET is missing in production.

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET environment variable is not set.");
  console.error("   Set JWT_SECRET in your .env file or environment.");
  process.exit(1);
}

module.exports = { JWT_SECRET };
