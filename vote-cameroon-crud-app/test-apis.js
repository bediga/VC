// Test simple pour vérifier les APIs sans authentification
const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://vote-mp3-cameroon.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTUzODMzODMsImlkIjoiMWUwMWM1NTgtNTc0Mi00NmMzLWJkN2MtYjE2N2FmZTU5ZGY4IiwicmlkIjoiM2FiZDE4NTktMGMxYi00ODcwLWE5Y2QtZjkzZTVkZWEzNmQ1In0.YrGkH4SBRAmrPB2uF7iXqSFvLqS22xZlWo4aT5bMEU0HRbhZwE4QvR9aPYNqu2rbUKWWVqZUk4MUJb3N07ZAAQ'
});

async function testCandidatesAPI() {
  try {
    console.log('🧪 Test de la requête candidates corrigée...');
    
    // Test de la requête qui posait problème
    const result = await client.execute(`
      SELECT 
        id, name, party, number, color, description, photo_url, 
        votes, percentage, status, created_at, updated_at
      FROM candidates 
      ORDER BY created_at DESC
    `);
    
    console.log('✅ Requête candidates réussie !');
    console.log(`📊 Nombre de candidats trouvés: ${result.rows.length}`);
    
    if (result.rows.length > 0) {
      console.log('📋 Premier candidat:');
      console.log(result.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Erreur dans la requête candidates:', error.message);
  }
}

async function testCandidateById() {
  try {
    console.log('\n🧪 Test de la requête candidate par ID...');
    
    // Test de la requête par ID corrigée  
    const result = await client.execute({
      sql: `
        SELECT 
          id, name, party, number, color, description, photo_url,
          votes, percentage, status, created_at, updated_at
        FROM candidates 
        WHERE id = ?
      `,
      args: [1] // Test avec l'ID 1
    });
    
    console.log('✅ Requête candidate par ID réussie !');
    
    if (result.rows.length > 0) {
      console.log('📋 Candidat trouvé:');
      console.log(result.rows[0]);
    } else {
      console.log('ℹ️  Aucun candidat trouvé avec l\'ID 1');
    }
    
  } catch (error) {
    console.error('❌ Erreur dans la requête candidate par ID:', error.message);
  }
}

async function testDashboardStats() {
  try {
    console.log('\n🧪 Test des statistiques dashboard...');
    
    // Test candidates count corrigé
    const candidatesResult = await client.execute("SELECT COUNT(*) as count FROM candidates WHERE status = 'active'");
    console.log(`✅ Candidats actifs: ${candidatesResult.rows[0].count}`);
    
    // Test users count 
    const usersResult = await client.execute("SELECT COUNT(*) as count FROM users WHERE is_active = 1");
    console.log(`✅ Utilisateurs actifs: ${usersResult.rows[0].count}`);
    
    // Test polling stations
    const stationsResult = await client.execute("SELECT COUNT(*) as count FROM polling_stations");
    console.log(`✅ Bureaux de vote: ${stationsResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Erreur dans les statistiques:', error.message);
  }
}

async function runAllTests() {
  await testCandidatesAPI();
  await testCandidateById();
  await testDashboardStats();
  console.log('\n🎉 Tests terminés !');
}

runAllTests().then(() => process.exit(0));
