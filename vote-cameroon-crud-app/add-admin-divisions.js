// Script pour ajouter le découpage administratif à la table candidates
const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://vote-mp3-cameroon.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTUzODMzODMsImlkIjoiMWUwMWM1NTgtNTc0Mi00NmMzLWJkN2MtYjE2N2FmZTU5ZGY4IiwicmlkIjoiM2FiZDE4NTktMGMxYi00ODcwLWE5Y2QtZjkzZTVkZWEzNmQ1In0.YrGkH4SBRAmrPB2uF7iXqSFvLqS22xZlWo4aT5bMEU0HRbhZwE4QvR9aPYNqu2rbUKWWVqZUk4MUJb3N07ZAAQ'
});

async function addAdministrativeDivisions() {
  try {
    console.log('🔧 Ajout du découpage administratif à la table candidates...');
    
    // Ajouter les colonnes pour le découpage administratif
    const columns = ['region', 'department', 'commune', 'arrondissement'];
    
    for (const column of columns) {
      try {
        await client.execute(`ALTER TABLE candidates ADD COLUMN ${column} TEXT`);
        console.log(`✅ Colonne '${column}' ajoutée avec succès`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`ℹ️  Colonne '${column}' existe déjà`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n🔍 Vérification de la nouvelle structure...');
    const schema = await client.execute('PRAGMA table_info(candidates)');
    
    console.log('\n📋 Structure mise à jour:');
    schema.rows.forEach(col => {
      const isNew = columns.includes(col.name);
      const marker = isNew ? '🆕' : '  ';
      console.log(`${marker} - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PK' : ''}`);
    });
    
    console.log('\n✅ Découpage administratif ajouté avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

addAdministrativeDivisions().then(() => process.exit(0));
