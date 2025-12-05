// Utilitaires de cache pour les microservices
// Fournit des fonctions helper pour le cache Redis

const { getClient, isAvailable } = require('./redis-client');

// Préfixes pour organiser les clés de cache par service
const CACHE_PREFIXES = {
  QUIZ: 'quiz:',
  GAME: 'game:',
  AUTH: 'auth:',
  SCORE: 'score:',
  LEADERBOARD: 'leaderboard:'
};

// TTL par défaut (en secondes)
const DEFAULT_TTL = {
  QUESTIONS: 3600,        // 1 heure (les questions changent rarement)
  QUESTION: 1800,          // 30 minutes (question individuelle)
  GAME_STATE: 60,         // 1 minute (état du jeu change fréquemment)
  PLAYER: 1800,           // 30 minutes (infos joueur)
  LEADERBOARD: 30,        // 30 secondes (leaderboard change souvent)
  SCORE: 60,              // 1 minute (score change souvent)
  PLAYERS_LIST: 300       // 5 minutes (liste des joueurs)
};

/**
 * Obtenir une valeur du cache
 * @param {string} key - Clé de cache
 * @returns {Promise<any|null>} - Valeur en cache ou null
 */
async function get(key) {
  try {
    if (!(await isAvailable())) {
      return null;
    }
    
    const client = await getClient();
    const value = await client.get(key);
    
    if (value) {
      return JSON.parse(value);
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Cache get error for key "${key}":`, error.message);
    return null; // En cas d'erreur, retourner null pour fallback sur DB
  }
}

/**
 * Mettre une valeur en cache
 * @param {string} key - Clé de cache
 * @param {any} value - Valeur à mettre en cache
 * @param {number} ttl - Time to live en secondes (optionnel)
 * @returns {Promise<boolean>} - Succès ou échec
 */
async function set(key, value, ttl = null) {
  try {
    if (!(await isAvailable())) {
      return false;
    }
    
    const client = await getClient();
    const serialized = JSON.stringify(value);
    
    if (ttl) {
      await client.setEx(key, ttl, serialized);
    } else {
      await client.set(key, serialized);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Cache set error for key "${key}":`, error.message);
    return false; // En cas d'erreur, continuer sans cache
  }
}

/**
 * Supprimer une clé du cache
 * @param {string} key - Clé à supprimer
 * @returns {Promise<boolean>} - Succès ou échec
 */
async function del(key) {
  try {
    if (!(await isAvailable())) {
      return false;
    }
    
    const client = await getClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error(`❌ Cache del error for key "${key}":`, error.message);
    return false;
  }
}

/**
 * Supprimer toutes les clés correspondant à un pattern
 * @param {string} pattern - Pattern (ex: "quiz:*")
 * @returns {Promise<number>} - Nombre de clés supprimées
 */
async function delPattern(pattern) {
  try {
    if (!(await isAvailable())) {
      return 0;
    }
    
    const client = await getClient();
    const keys = await client.keys(pattern);
    
    if (keys.length === 0) {
      return 0;
    }
    
    await client.del(keys);
    return keys.length;
  } catch (error) {
    console.error(`❌ Cache delPattern error for pattern "${pattern}":`, error.message);
    return 0;
  }
}

/**
 * Vérifier si une clé existe
 * @param {string} key - Clé à vérifier
 * @returns {Promise<boolean>} - Existe ou non
 */
async function exists(key) {
  try {
    if (!(await isAvailable())) {
      return false;
    }
    
    const client = await getClient();
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    console.error(`❌ Cache exists error for key "${key}":`, error.message);
    return false;
  }
}

/**
 * Obtenir plusieurs clés en une fois
 * @param {string[]} keys - Tableau de clés
 * @returns {Promise<Array<any|null>>} - Tableau de valeurs
 */
async function mget(keys) {
  try {
    if (!(await isAvailable()) || keys.length === 0) {
      return keys.map(() => null);
    }
    
    const client = await getClient();
    const values = await client.mGet(keys);
    
    return values.map(value => {
      if (value) {
        try {
          return JSON.parse(value);
        } catch (e) {
          return null;
        }
      }
      return null;
    });
  } catch (error) {
    console.error(`❌ Cache mget error:`, error.message);
    return keys.map(() => null);
  }
}

/**
 * Mettre plusieurs clés en une fois
 * @param {Object} keyValuePairs - Objet { key: value }
 * @param {number} ttl - TTL commun pour toutes les clés (optionnel)
 * @returns {Promise<boolean>} - Succès ou échec
 */
async function mset(keyValuePairs, ttl = null) {
  try {
    if (!(await isAvailable())) {
      return false;
    }
    
    const client = await getClient();
    const pipeline = client.multi();
    
    for (const [key, value] of Object.entries(keyValuePairs)) {
      const serialized = JSON.stringify(value);
      if (ttl) {
        pipeline.setEx(key, ttl, serialized);
      } else {
        pipeline.set(key, serialized);
      }
    }
    
    await pipeline.exec();
    return true;
  } catch (error) {
    console.error(`❌ Cache mset error:`, error.message);
    return false;
  }
}

/**
 * Incrémenter une valeur numérique
 * @param {string} key - Clé
 * @param {number} increment - Valeur d'incrémentation (défaut: 1)
 * @returns {Promise<number>} - Nouvelle valeur
 */
async function incr(key, increment = 1) {
  try {
    if (!(await isAvailable())) {
      return null;
    }
    
    const client = await getClient();
    return await client.incrBy(key, increment);
  } catch (error) {
    console.error(`❌ Cache incr error for key "${key}":`, error.message);
    return null;
  }
}

/**
 * Définir un TTL sur une clé existante
 * @param {string} key - Clé
 * @param {number} ttl - TTL en secondes
 * @returns {Promise<boolean>} - Succès ou échec
 */
async function expire(key, ttl) {
  try {
    if (!(await isAvailable())) {
      return false;
    }
    
    const client = await getClient();
    await client.expire(key, ttl);
    return true;
  } catch (error) {
    console.error(`❌ Cache expire error for key "${key}":`, error.message);
    return false;
  }
}

module.exports = {
  get,
  set,
  del,
  delPattern,
  exists,
  mget,
  mset,
  incr,
  expire,
  PREFIXES: CACHE_PREFIXES,
  TTL: DEFAULT_TTL
};

