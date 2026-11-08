import { buildApp } from './app.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const app = await buildApp();
  try {
    const address = await app.listen({ port: PORT, host: HOST });
    console.log(`[OpenForm Steps API] Server listening at ${address}`);
    console.log(`[OpenForm Steps API] OpenAPI docs available at ${address}/docs`);
  } catch (err) {
    console.error('Failed to start OpenForm Steps API server:', err);
    process.exit(1);
  }
}

main();
