// Test du découpage administratif pour les candidats
const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://vote-mp3-cameroon.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTUzODMzODMsImlkIjoiMWUwMWM1NTgtNTc0Mi00NmMzLWJkN2MtYjE2N2FmZTU5ZGY4IiwicmlkIjoiM2FiZDE4NTktMGMxYi00ODcwLWE5Y2QtZjkzZTVkZWEzNmQ1In0.YrGkH4SBRAmrPB2uF7iXqSFvLqS22xZlWo4aT5bMEU0HRbhZwE4QvR9aPYNqu2rbUKWWVqZUk4MUJb3N07ZAAQ'
});

async function testAdministrativeDivisions() {
  try {
    console.log('🧪 Test du découpage administratif...');
    
    // 1. Vérifier la structure de la table candidates
    console.log('\n📋 Structure de la table candidates:');
    const schema = await client.execute('PRAGMA table_info(candidates)');
    const adminColumns = schema.rows.filter(col => 
      ['region', 'department', 'commune', 'arrondissement'].includes(col.name)
    );
    
    adminColumns.forEach(col => {
      console.log(`✅ ${col.name} (${col.type})`);
    });
    
    // 2. Test de la requête SELECT avec les nouveaux champs
    console.log('\n🔍 Test SELECT avec découpage administratif:');
    const candidatesResult = await client.execute(`
      SELECT 
        id, name, party, region, department, commune, arrondissement
      FROM candidates 
      ORDER BY id 
      LIMIT 3
    `);
    
    console.log(`📊 ${candidatesResult.rows.length} candidats trouvés:`);
    candidatesResult.rows.forEach(candidate => {
      console.log(`- ${candidate.name} (${candidate.party})`);
      if (candidate.region) console.log(`  Région: ${candidate.region}`);
      if (candidate.department) console.log(`  Département: ${candidate.department}`);
      if (candidate.commune) console.log(`  Commune: ${candidate.commune}`);
      if (candidate.arrondissement) console.log(`  Arrondissement: ${candidate.arrondissement}`);
    });
    
    // 3. Test des divisions administratives existantes
    console.log('\n🗺️  Divisions administratives disponibles:');
    
    // Régions depuis les tables existantes
    const regionsResult = await client.execute(`
      SELECT DISTINCT region as name FROM (
        SELECT region FROM users WHERE region IS NOT NULL AND region != ''
        UNION
        SELECT region FROM polling_stations WHERE region IS NOT NULL AND region != ''
      ) ORDER BY name
    `);
    
    console.log(`📍 Régions (${regionsResult.rows.length}):`, 
      regionsResult.rows.map(r => r.name).join(', '));
    
    // Départements
    const departmentsResult = await client.execute(`
      SELECT DISTINCT department as name FROM (
        SELECT department FROM users WHERE department IS NOT NULL AND department != ''
        UNION
        SELECT department FROM polling_stations WHERE department IS NOT NULL AND department != ''
      ) ORDER BY name
    `);
    
    console.log(`🏛️  Départements (${departmentsResult.rows.length}):`, 
      departmentsResult.rows.map(d => d.name).join(', '));
    
    // Communes
    const communesResult = await client.execute(`
      SELECT DISTINCT commune as name FROM (
        SELECT commune FROM users WHERE commune IS NOT NULL AND commune != ''
        UNION
        SELECT commune FROM polling_stations WHERE commune IS NOT NULL AND commune != ''
      ) ORDER BY name
    `);
    
    console.log(`🏘️  Communes (${communesResult.rows.length}):`, 
      communesResult.rows.map(c => c.name).join(', '));
    
    console.log('\n✅ Test du découpage administratif terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testAdministrativeDivisions().then(() => process.exit(0));
