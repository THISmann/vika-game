// Client Redis réutilisable pour tous les microservices
// Usage: const redis = require('./shared/redis-client');

const redis = require('redis');

let client = null;
let isConnected = false;

// Configuration Redis depuis les variables d'environnement
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || null;
const REDIS_DB = process.env.REDIS_DB || 0;

// Créer le client Redis
function createClient() {
  if (client && isConnected) {
    return client;
  }

  const config = {
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT,
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('❌ Redis: Too many reconnection attempts, giving up');
          return new Error('Too many reconnection attempts');
        }
        const delay = Math.min(retries * 100, 3000);
        console.log(`🔄 Redis: Reconnecting in ${delay}ms (attempt ${retries})`);
        return delay;
      }
    }
  };

  if (REDIS_PASSWORD) {
    config.password = REDIS_PASSWORD;
  }

  if (REDIS_DB) {
    config.database = parseInt(REDIS_DB);
  }

  client = redis.createClient(config);

  // Gestion des erreurs
  client.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
    isConnected = false;
  });

  client.on('connect', () => {
    console.log('🔄 Redis: Connecting...');
  });

  client.on('ready', () => {
    console.log('✅ Redis: Connected and ready');
    isConnected = true;
  });

  client.on('reconnecting', () => {
    console.log('🔄 Redis: Reconnecting...');
    isConnected = false;
  });

  client.on('end', () => {
    console.log('🔌 Redis: Connection ended');
    isConnected = false;
  });

  return client;
}

// Connecter au Redis
async function connect() {
  try {
    if (!client) {
      createClient();
    }
    
    if (!isConnected) {
      await client.connect();
    }
    
    return client;
  } catch (error) {
    console.error('❌ Redis: Connection failed:', error);
    isConnected = false;
    throw error;
  }
}

// Déconnecter de Redis
async function disconnect() {
  try {
    if (client && isConnected) {
      await client.quit();
      isConnected = false;
      console.log('🔌 Redis: Disconnected');
    }
  } catch (error) {
    console.error('❌ Redis: Disconnect error:', error);
  }
}

// Obtenir le client (se connecte automatiquement si nécessaire)
async function getClient() {
  if (!client) {
    createClient();
  }
  
  if (!isConnected) {
    await connect();
  }
  
  return client;
}

// Helper pour vérifier si Redis est disponible
async function isAvailable() {
  try {
    const cli = await getClient();
    await cli.ping();
    return true;
  } catch (error) {
    return false;
  }
}

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', async () => {
  await disconnect();
});

process.on('SIGINT', async () => {
  await disconnect();
});

module.exports = {
  getClient,
  connect,
  disconnect,
  isAvailable,
  createClient
};

