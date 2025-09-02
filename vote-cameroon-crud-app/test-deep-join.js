const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://vote-mp3-cameroon.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTUzODMzODMsImlkIjoiMWUwMWM1NTgtNTc0Mi00NmMzLWJkN2MtYjE2N2FmZTU5ZGY4IiwicmlkIjoiM2FiZDE4NTktMGMxYi00ODcwLWE5Y2QtZjkzZTVkZWEzNmQ1In0.YrGkH4SBRAmrPB2uF7iXqSFvLqS22xZlWo4aT5bMEU0HRbhZwE4QvR9aPYNqu2rbUKWWVqZUk4MUJb3N07ZAAQ'
});

async function testDeepJoin() {
  try {
    console.log('🔍 TEST DE LA JOINTURE PROFONDE');
    console.log('='.repeat(50));
    
    // Vérifier d'abord les structures des tables de la hiérarchie
    console.log('\n📋 Vérification des structures:');
    
    const tables = ['arrondissements', 'departments', 'regions'];
    for (const table of tables) {
      console.log(`\n${table}:`);
      const schema = await client.execute(`PRAGMA table_info(${table})`);
      schema.rows.forEach(col => {
        console.log(`  - ${col.name}: ${col.type}`);
      });
    }
    
    // Test de la requête complète
    console.log('\n🔗 TEST DE LA JOINTURE COMPLÈTE:');
    const testQuery = `
      SELECT 
        psh.id,
        psh.name,
        psh.station_number,
        psh.registered_voters,
        psh.status,
        vc.name as center_name,
        c.name as commune,
        a.name as arrondissement,
        d.name as department,
        r.name as region
      FROM polling_stations_hierarchy psh
      LEFT JOIN voting_centers vc ON psh.voting_center_id = vc.id
      LEFT JOIN communes c ON vc.commune_id = c.id
      LEFT JOIN arrondissements a ON c.arrondissement_id = a.id
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN regions r ON d.region_id = r.id
      LIMIT 5
    `;
    
    const result = await client.execute(testQuery);
    console.log('\nRésultats (5 premiers):');
    result.rows.forEach((row, i) => {
      console.log(`\n${i+1}. ${row.name} (Station ${row.station_number})`);
      console.log(`   Centre: ${row.center_name || 'NULL'}`);
      console.log(`   Commune: ${row.commune || 'NULL'}`);
      console.log(`   Arrondissement: ${row.arrondissement || 'NULL'}`);
      console.log(`   Département: ${row.department || 'NULL'}`);
      console.log(`   Région: ${row.region || 'NULL'}`);
      console.log(`   Électeurs: ${row.registered_voters}`);
      console.log(`   Statut: ${row.status}`);
    });
    
    // Statistiques de couverture
    console.log('\n📊 STATISTIQUES DE COUVERTURE:');
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(r.name) as with_region,
        COUNT(d.name) as with_department,
        COUNT(a.name) as with_arrondissement,
        COUNT(c.name) as with_commune
      FROM polling_stations_hierarchy psh
      LEFT JOIN voting_centers vc ON psh.voting_center_id = vc.id
      LEFT JOIN communes c ON vc.commune_id = c.id
      LEFT JOIN arrondissements a ON c.arrondissement_id = a.id
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN regions r ON d.region_id = r.id
    `;
    
    const stats = await client.execute(statsQuery);
    const s = stats.rows[0];
    console.log(`Total bureaux: ${s.total.toLocaleString()}`);
    console.log(`Avec région: ${s.with_region.toLocaleString()} (${((s.with_region/s.total)*100).toFixed(1)}%)`);
    console.log(`Avec département: ${s.with_department.toLocaleString()} (${((s.with_department/s.total)*100).toFixed(1)}%)`);
    console.log(`Avec arrondissement: ${s.with_arrondissement.toLocaleString()} (${((s.with_arrondissement/s.total)*100).toFixed(1)}%)`);
    console.log(`Avec commune: ${s.with_commune.toLocaleString()} (${((s.with_commune/s.total)*100).toFixed(1)}%)`);
    
    console.log('\n✅ Test réussi!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.close();
  }
}

testDeepJoin();
