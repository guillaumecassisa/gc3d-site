// Les tests d'intégration utilisent une base dédiée, jamais celle de développement.
const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("TEST_DATABASE_URL est requis pour les tests d'intégration.");
process.env.DATABASE_URL = url;
process.env.BETTER_AUTH_SECRET ??= "test-secret-0123456789abcdef0123456789abcdef";
(process.env as Record<string, string>).NODE_ENV = "test";
