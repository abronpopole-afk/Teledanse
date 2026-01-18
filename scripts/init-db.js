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
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
}

loadEnv();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("❌ DATABASE_URL manquante dans le .env");
    process.exit(1);
  }

  console.log("⏳ Connexion directe à PostgreSQL...");
  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    console.log("✅ Connecté ! Création des tables...");

    // SQL Pur
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
    console.log("✅ Base de données initialisée avec succès !");
  } catch (err) {
    console.error("❌ Erreur SQL :", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
