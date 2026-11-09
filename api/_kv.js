const { createClient } = require('redis');
let client;
async function getClient() {
  if (client && client.isOpen) return client;
  const c = createClient({ url: process.env.REDIS_URL });
  c.on('error', () => {});
  await c.connect();
  client = c;
  return c;
}
async function kv(cmd) {
  const c = await getClient();
  return c.sendCommand(cmd);
}
const auth = (req) => !!process.env.ADMIN_PASSWORD && req.headers['x-admin-password'] === process.env.ADMIN_PASSWORD;
module.exports = { kv, auth };
