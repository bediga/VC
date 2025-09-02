const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://vote-mp3-cameroon.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTUzODMzODMsImlkIjoiMWUwMWM1NTgtNTc0Mi00NmMzLWJkN2MtYjE2N2FmZTU5ZGY4IiwicmlkIjoiM2FiZDE4NTktMGMxYi00ODcwLWE5Y2QtZjkzZTVkZWEzNmQ1In0.YrGkH4SBRAmrPB2uF7iXqSFvLqS22xZlWo4aT5bMEU0HRbhZwE4QvR9aPYNqu2rbUKWWVqZUk4MUJb3N07ZAAQ'
});

async function analyzePollingTables() {
  try {
    console.log('🔍 ANALYSE COMPLÈTE DES TABLES DE BUREAUX DE VOTE');
    console.log('='.repeat(60));
    
    const tables = ['polling_stations_hierarchy', 'polling_stations', 'polling_results'];
    
    for (const tableName of tables) {
      console.log(`\n📋 TABLE: ${tableName.toUpperCase()}`);
      console.log('-'.repeat(40));
      
      // Compter les enregistrements
      const countResult = await client.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`📊 Nombre d'enregistrements: ${countResult.rows[0].count.toLocaleString()}`);
      
      // Structure de la table
      console.log('\n🏗️ Structure:');
      const schemaResult = await client.execute(`PRAGMA table_info(${tableName})`);
      schemaResult.rows.forEach(column => {
        console.log(`  - ${column.name.padEnd(20)} : ${column.type}`);
      });
      
      // Échantillon de données
      console.log('\n📝 Échantillon (3 premiers enregistrements):');
      const sampleResult = await client.execute(`SELECT * FROM ${tableName} LIMIT 3`);
      sampleResult.rows.forEach((row, i) => {
        console.log(`\n  Enregistrement ${i+1}:`);
        Object.entries(row).forEach(([key, value]) => {
          const displayValue = value !== null ? value.toString().substring(0, 50) : 'NULL';
          console.log(`    ${key.padEnd(20)} : ${displayValue}`);
        });
      });
      
      console.log('\n' + '='.repeat(60));
    }
    
    // Analyses spécifiques pour comprendre les relations
    console.log('\n� ANALYSES COMPARATIVES:');
    console.log('-'.repeat(40));
    
    // Vérifier s'il y a des colonnes communes pour faire des jointures
    console.log('\n🔍 Colonnes communes potentielles:');
    
    // polling_stations_hierarchy vs polling_stations
    try {
      const hierarchyColumns = await client.execute("PRAGMA table_info(polling_stations_hierarchy)");
      const stationsColumns = await client.execute("PRAGMA table_info(polling_stations)");
      
      const hierarchyColNames = hierarchyColumns.rows.map(r => r.name);
      const stationsColNames = stationsColumns.rows.map(r => r.name);
      const commonCols = hierarchyColNames.filter(col => stationsColNames.includes(col));
      
      console.log('Entre polling_stations_hierarchy et polling_stations:');
      console.log('  Colonnes communes:', commonCols.join(', '));
      
    } catch (e) {
      console.log('Erreur lors de l\'analyse des colonnes:', e.message);
    }
    
    // Répartition géographique dans polling_stations_hierarchy
    console.log('\n🌍 Répartition géographique (polling_stations_hierarchy):');
    try {
      // Chercher les colonnes qui contiennent des informations géographiques
      const geoQuery = await client.execute(`
        SELECT 
          CASE 
            WHEN region_name IS NOT NULL THEN region_name
            WHEN region IS NOT NULL THEN region
            ELSE 'Non défini'
          END as region,
          COUNT(*) as count 
        FROM polling_stations_hierarchy 
        GROUP BY region
        ORDER BY count DESC 
        LIMIT 10
      `);
      
      geoQuery.rows.forEach(row => {
        console.log(`  - ${row.region}: ${row.count} bureaux`);
      });
    } catch (e) {
      console.log('  Tentative avec d\'autres noms de colonnes...');
      try {
        const altQuery = await client.execute(`
          SELECT * FROM polling_stations_hierarchy LIMIT 1
        `);
        console.log('  Colonnes disponibles:', Object.keys(altQuery.rows[0] || {}));
      } catch (e2) {
        console.log('  Erreur:', e2.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.close();
  }
}

analyzePollingTables();
