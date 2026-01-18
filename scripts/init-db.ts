import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";
import { sql } from "drizzle-orm";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ Erreur : La variable d'environnement DATABASE_URL n'est pas définie.");
    console.log("Veuillez créer un fichier .env avec : DATABASE_URL=postgres://user:password@localhost:5432/dbname");
    process.exit(1);
  }

  console.log("⏳ Connexion à la base de données...");

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    console.log("📦 Création des tables (si elles n'existent pas)...");
    
    // Création manuelle des tables pour éviter la dépendance à drizzle-kit sur Windows
    await pool.query(`
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
    `);

    // Insérer l'utilisateur par défaut si nécessaire
    await pool.query(`
      INSERT INTO users (id, username, password) 
      VALUES (1, 'default_user', 'no_password_required')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("✅ Base de données prête !");
    await pool.end();
  } catch (error) {
    console.error("❌ Échec de l'initialisation :", error);
    process.exit(1);
  }
}

main();
