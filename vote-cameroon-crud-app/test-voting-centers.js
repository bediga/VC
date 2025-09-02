const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://vote-mp3-cameroon.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTUzODMzODMsImlkIjoiMWUwMWM1NTgtNTc0Mi00NmMzLWJkN2MtYjE2N2FmZTU5ZGY4IiwicmlkIjoiM2FiZDE4NTktMGMxYi00ODcwLWE5Y2QtZjkzZTVkZWEzNmQ1In0.YrGkH4SBRAmrPB2uF7iXqSFvLqS22xZlWo4aT5bMEU0HRbhZwE4QvR9aPYNqu2rbUKWWVqZUk4MUJb3N07ZAAQ'
});

async function analyzeCompleteStructure() {
  try {
    console.log('🔍 ANALYSE COMPLÈTE DE LA STRUCTURE DES BUREAUX DE VOTE');
    console.log('='.repeat(60));
    
    // Vérifier la structure de communes
    console.log('\n📋 STRUCTURE communes:');
    const communesSchema = await client.execute("PRAGMA table_info(communes)");
    communesSchema.rows.forEach(column => {
      console.log(`  - ${column.name.padEnd(20)} : ${column.type}`);
    });
    
    // Test de jointure complète: polling_stations_hierarchy -> voting_centers -> communes
    console.log('\n🔗 JOINTURE COMPLÈTE (polling_stations_hierarchy + voting_centers + communes):');
    const completeJoinQuery = `
      SELECT 
        psh.id as station_id,
        psh.name as station_name,
        psh.station_number,
        psh.registered_voters,
        psh.status,
        vc.name as center_name,
        c.name as commune_name,
        c.department_name,
        c.region_name
      FROM polling_stations_hierarchy psh
      LEFT JOIN voting_centers vc ON psh.voting_center_id = vc.id
      LEFT JOIN communes c ON vc.commune_id = c.id
      LIMIT 10
    `;
    
    const joinResult = await client.execute(completeJoinQuery);
    console.log('\nRésultat de la jointure complète (10 premiers):');
    joinResult.rows.forEach((row, i) => {
      console.log(`\n  ${i+1}. ${row.station_name} (Station ${row.station_number})`);
      console.log(`     Centre: ${row.center_name || 'NULL'}`);
      console.log(`     Commune: ${row.commune_name || 'NULL'}`);
      console.log(`     Département: ${row.department_name || 'NULL'}`);
      console.log(`     Région: ${row.region_name || 'NULL'}`);
      console.log(`     Électeurs: ${row.registered_voters}`);
      console.log(`     Statut: ${row.status}`);
    });
    
    // Statistiques de couverture géographique
    console.log('\n📊 STATISTIQUES DE COUVERTURE GÉOGRAPHIQUE:');
    const coverageQuery = `
      SELECT 
        COUNT(*) as total_stations,
        COUNT(c.region_name) as stations_with_region,
        COUNT(c.department_name) as stations_with_department,
        COUNT(c.name) as stations_with_commune
      FROM polling_stations_hierarchy psh
      LEFT JOIN voting_centers vc ON psh.voting_center_id = vc.id
      LEFT JOIN communes c ON vc.commune_id = c.id
    `;
    
    const coverageResult = await client.execute(coverageQuery);
    const coverage = coverageResult.rows[0];
    console.log(`Total bureaux: ${coverage.total_stations.toLocaleString()}`);
    console.log(`Avec région: ${coverage.stations_with_region.toLocaleString()} (${((coverage.stations_with_region/coverage.total_stations)*100).toFixed(1)}%)`);
    console.log(`Avec département: ${coverage.stations_with_department.toLocaleString()} (${((coverage.stations_with_department/coverage.total_stations)*100).toFixed(1)}%)`);
    console.log(`Avec commune: ${coverage.stations_with_commune.toLocaleString()} (${((coverage.stations_with_commune/coverage.total_stations)*100).toFixed(1)}%)`);
    
    // Répartition par région
    console.log('\n🌍 RÉPARTITION PAR RÉGION:');
    const regionQuery = `
      SELECT 
        c.region_name,
        COUNT(*) as bureau_count
      FROM polling_stations_hierarchy psh
      LEFT JOIN voting_centers vc ON psh.voting_center_id = vc.id
      LEFT JOIN communes c ON vc.commune_id = c.id
      WHERE c.region_name IS NOT NULL
      GROUP BY c.region_name
      ORDER BY bureau_count DESC
    `;
    
    const regionResult = await client.execute(regionQuery);
    regionResult.rows.forEach(row => {
      console.log(`  - ${row.region_name}: ${row.bureau_count.toLocaleString()} bureaux`);
    });
    
    console.log('\n✅ Structure analysée avec succès!');
    console.log('\n💡 RECOMMANDATION: Utiliser la jointure à trois tables pour obtenir');
    console.log('   toutes les informations géographiques des 21 093 bureaux de vote.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.close();
  }
}

analyzeCompleteStructure();
