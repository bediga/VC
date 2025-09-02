const { createClient } = require('@libsql/client');

// Configuration directe
const client = createClient({
  url: 'libsql://vote-mp3-cameroon.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTUzODMzODMsImlkIjoiMWUwMWM1NTgtNTc0Mi00NmMzLWJkN2MtYjE2N2FmZTU5ZGY4IiwicmlkIjoiM2FiZDE4NTktMGMxYi00ODcwLWE5Y2QtZjkzZTVkZWEzNmQ1In0.YrGkH4SBRAmrPB2uF7iXqSFvLqS22xZlWo4aT5bMEU0HRbhZwE4QvR9aPYNqu2rbUKWWVqZUk4MUJb3N07ZAAQ'
});

async function checkSchema() {
  const tables = ['users', 'candidates', 'polling_stations', 'regions', 'elections'];
  
  for (const table of tables) {
    try {
      console.log(`\n🔍 Vérification de la structure de la table ${table}...`);
      const columns = await client.execute(`PRAGMA table_info(${table})`);
      
      if (columns.rows.length === 0) {
        console.log(`❌ Table ${table} n'existe pas`);
        continue;
      }
      
      console.log('Colonnes:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PK' : ''}`);
      });
      
      // Afficher un exemple si la table a des données
      try {
        const sample = await client.execute(`SELECT * FROM ${table} LIMIT 1`);
        if (sample.rows.length > 0) {
          console.log('📊 Exemple:');
          console.log(sample.rows[0]);
        } else {
          console.log('📊 Table vide');
        }
      } catch (err) {
        console.log(`⚠️  Erreur lecture exemple: ${err.message}`);
      }
    } catch (error) {
      console.log(`❌ Erreur pour ${table}: ${error.message}`);
    }
  }
}

checkSchema().then(() => process.exit(0));
