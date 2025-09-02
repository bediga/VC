// Vérification des divisions administratives existantes
const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://vote-mp3-cameroon.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTUzODMzODMsImlkIjoiMWUwMWM1NTgtNTc0Mi00NmMzLWJkN2MtYjE2N2FmZTU5ZGY4IiwicmlkIjoiM2FiZDE4NTktMGMxYi00ODcwLWE5Y2QtZjkzZTVkZWEzNmQ1In0.YrGkH4SBRAmrPB2uF7iXqSFvLqS22xZlWo4aT5bMEU0HRbhZwE4QvR9aPYNqu2rbUKWWVqZUk4MUJb3N07ZAAQ'
});

async function checkAdministrativeTables() {
  try {
    console.log('🗺️  Vérification des tables de divisions administratives...\n');
    
    // Lister toutes les tables
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    
    console.log('📋 Tables existantes:');
    tables.rows.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    
    // Vérifier spécifiquement les tables de divisions administratives
    const adminTables = ['regions', 'departments', 'communes', 'arrondissements'];
    
    console.log('\n🔍 Vérification des tables de divisions administratives:');
    
    for (const tableName of adminTables) {
      try {
        const result = await client.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = result.rows[0].count;
        console.log(`✅ ${tableName}: ${count} enregistrements`);
        
        // Afficher quelques exemples
        if (count > 0) {
          const sample = await client.execute(`SELECT * FROM ${tableName} LIMIT 3`);
          console.log(`   Exemples:`, sample.rows);
        }
      } catch (error) {
        if (error.message.includes('no such table')) {
          console.log(`❌ ${tableName}: Table n'existe pas`);
        } else {
          console.log(`⚠️  ${tableName}: Erreur - ${error.message}`);
        }
      }
    }
    
    // Vérifier aussi les colonnes de régions dans d'autres tables
    console.log('\n🔍 Vérification des colonnes région/département dans d\'autres tables:');
    
    const checkTables = ['users', 'polling_stations'];
    for (const table of checkTables) {
      try {
        const schema = await client.execute(`PRAGMA table_info(${table})`);
        const adminColumns = schema.rows.filter(col => 
          ['region', 'department', 'commune', 'arrondissement'].includes(col.name)
        );
        
        if (adminColumns.length > 0) {
          console.log(`✅ ${table}:`, adminColumns.map(col => col.name));
          
          // Compter les valeurs distinctes
          for (const col of adminColumns) {
            const distinct = await client.execute(`SELECT COUNT(DISTINCT ${col.name}) as count FROM ${table} WHERE ${col.name} IS NOT NULL AND ${col.name} != ''`);
            console.log(`   - ${col.name}: ${distinct.rows[0].count} valeurs distinctes`);
          }
        } else {
          console.log(`❌ ${table}: Pas de colonnes administratives`);
        }
      } catch (error) {
        console.log(`⚠️  ${table}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkAdministrativeTables().then(() => process.exit(0));
