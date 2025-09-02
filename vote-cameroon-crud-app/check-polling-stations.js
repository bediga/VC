const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://vote-mp3-cameroon.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTUzODMzODMsImlkIjoiMWUwMWM1NTgtNTc0Mi00NmMzLWJkN2MtYjE2N2FmZTU5ZGY4IiwicmlkIjoiM2FiZDE4NTktMGMxYi00ODcwLWE5Y2QtZjkzZTVkZWEzNmQ1In0.YrGkH4SBRAmrPB2uF7iXqSFvLqS22xZlWo4aT5bMEU0HRbhZwE4QvR9aPYNqu2rbUKWWVqZUk4MUJb3N07ZAAQ'
});

async function checkDatabaseContent() {
  try {
    console.log('🔍 AUDIT COMPLET DE LA BASE DE DONNÉES CLOUD');
    console.log('='.repeat(50));
    
    // Lister toutes les tables
    console.log('\n📋 TABLES DISPONIBLES:');
    const tablesResult = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    const tables = tablesResult.rows.map(row => row.name);
    console.log('Tables trouvées:', tables.map(t => `"${t}"`).join(', '));
    
    console.log('\n📊 NOMBRE D\'ENREGISTREMENTS PAR TABLE:');
    console.log('-'.repeat(40));
    
    // Compter les enregistrements dans chaque table
    for (const tableName of tables) {
      try {
        const countResult = await client.execute(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const count = countResult.rows[0].count;
        console.log(`${tableName.padEnd(25)} : ${count.toLocaleString()} enregistrements`);
      } catch (error) {
        console.log(`${tableName.padEnd(25)} : Erreur - ${error.message}`);
      }
    }
    
    // Vérifications spécifiques pour les tables importantes
    console.log('\n🎯 DÉTAILS DES TABLES PRINCIPALES:');
    console.log('-'.repeat(40));
    
    // Bureaux de vote
    if (tables.includes('polling_stations')) {
      const pollingResult = await client.execute('SELECT COUNT(*) as count FROM polling_stations');
      const pollingCount = pollingResult.rows[0].count;
      console.log(`\n📍 BUREAUX DE VOTE: ${pollingCount.toLocaleString()}`);
      
      if (pollingCount > 0) {
        // Répartition par région
        const regionResult = await client.execute(`
          SELECT region, COUNT(*) as count 
          FROM polling_stations 
          WHERE region IS NOT NULL 
          GROUP BY region 
          ORDER BY count DESC 
          LIMIT 10
        `);
        console.log('   Top 10 régions:');
        regionResult.rows.forEach(row => {
          console.log(`   - ${row.region}: ${row.count} bureaux`);
        });
      }
    }
    
    // Candidats
    if (tables.includes('candidates')) {
      const candidatesResult = await client.execute('SELECT COUNT(*) as count FROM candidates');
      console.log(`\n👥 CANDIDATS: ${candidatesResult.rows[0].count.toLocaleString()}`);
    }
    
    // Utilisateurs
    if (tables.includes('users')) {
      const usersResult = await client.execute('SELECT COUNT(*) as count FROM users');
      console.log(`\n🧑‍💼 UTILISATEURS: ${usersResult.rows[0].count.toLocaleString()}`);
    }
    
    // Divisions administratives
    if (tables.includes('regions')) {
      const regionsResult = await client.execute('SELECT COUNT(*) as count FROM regions');
      console.log(`\n🌍 RÉGIONS: ${regionsResult.rows[0].count.toLocaleString()}`);
    }
    
    if (tables.includes('departments')) {
      const deptsResult = await client.execute('SELECT COUNT(*) as count FROM departments');
      console.log(`📍 DÉPARTEMENTS: ${deptsResult.rows[0].count.toLocaleString()}`);
    }
    
    if (tables.includes('communes')) {
      const communesResult = await client.execute('SELECT COUNT(*) as count FROM communes');
      console.log(`🏘️ COMMUNES: ${communesResult.rows[0].count.toLocaleString()}`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Audit terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error.message);
  } finally {
    await client.close();
  }
}

checkDatabaseContent();
