// Script d'initialisation SANS AUCUNE DEPENDANCE (Pur Node.js + pg)
// On utilise 'require' pour être sûr que ça passe partout sur Windows
import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Chargement manuel du .env pour éviter la dépendance 'dotenv'
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split(/\r?\n/).forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) return;
      
      const index = trimmedLine.indexOf('=');
      if (index > 0) {
        const key = trimmedLine.substring(0, index).trim();
        const value = trimmedLine.substring(index + 1).trim();
        // Suppression des éventuels guillemets entourant la valeur
        const cleanValue = value.replace(/^["'](.*)["']$/, '$1');
        process.env[key] = cleanValue;
        console.log(`[ENV] Chargé : ${key}`);
      }
    });
  }
}

loadEnv();

async function main() {
  const fullConnectionString = process.env.DATABASE_URL;
  
  if (!fullConnectionString) {
    console.error("❌ DATABASE_URL manquante dans le .env");
    process.exit(1);
  }

  // Extraire les infos de connexion pour se connecter à la DB par défaut 'postgres'
  // Format: postgres://user:pass@host:port/dbname
  const urlParts = fullConnectionString.match(/postgres:\/\/([^:]+):([^@]+)@([^/]+)\/(.+)/);
  if (!urlParts) {
    console.error("❌ Format DATABASE_URL invalide");
    process.exit(1);
  }

  const [_, user, password, host, dbName] = urlParts;
  const defaultConnectionString = `postgres://${user}:${password}@${host}/postgres`;

  console.log(`⏳ Connexion à PostgreSQL (base par défaut) pour créer '${dbName}'...`);
  const defaultClient = new pg.Client({ connectionString: defaultConnectionString });

  try {
    await defaultClient.connect();
    
    // 1. Création de la base de données si elle n'existe pas
    // Note: CREATE DATABASE ne peut pas être exécuté dans une transaction
    try {
      await defaultClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Base de données '${dbName}' créée.`);
    } catch (err) {
      if (err.code === '42P04') {
        console.log(`ℹ️ La base de données '${dbName}' existe déjà.`);
      } else {
        throw err;
      }
    }
    await defaultClient.end();

    // 2. Connexion à la nouvelle base pour créer les tables
    console.log(`⏳ Connexion à '${dbName}' pour créer les tables...`);
    const client = new pg.Client({ connectionString: fullConnectionString });
    await client.connect();

    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS bot_configs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        api_id INTEGER NOT NULL,
        api_hash TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        session_string TEXT,
        source_bot_username TEXT,
        target_channel_id TEXT,
        is_active BOOLEAN DEFAULT false,
        last_error TEXT
      );

      CREATE TABLE IF NOT EXISTS transfer_logs (
        id SERIAL PRIMARY KEY,
        bot_config_id INTEGER NOT NULL REFERENCES bot_configs(id),
        file_name TEXT NOT NULL,
        file_size INTEGER,
        status TEXT NOT NULL,
        error_message TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO users (id, username, password) 
      VALUES (1, 'default_user', 'no_password_required')
      ON CONFLICT (id) DO NOTHING;
    `;

    await client.query(sql);
    console.log("✅ Tables créées et utilisateur par défaut configuré !");
    await client.end();
  } catch (err) {
    console.error("❌ Erreur SQL :");
    console.error(`   Code: ${err.code}`);
    console.error(`   Message: ${err.message}`);
    console.log("\n💡 ASTUCE : Assurez-vous que l'utilisateur PostgreSQL a les droits 'CREATEDB'.");
    process.exit(1);
  }
}

main();
