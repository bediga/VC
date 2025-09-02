// Vérification rapide de la structure des candidats
const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://vote-mp3-cameroon.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTUzODMzODMsImlkIjoiMWUwMWM1NTgtNTc0Mi00NmMzLWJkN2MtYjE2N2FmZTU5ZGY4IiwicmlkIjoiM2FiZDE4NTktMGMxYi00ODcwLWE5Y2QtZjkzZTVkZWEzNmQ1In0.YrGkH4SBRAmrPB2uF7iXqSFvLqS22xZlWo4aT5bMEU0HRbhZwE4QvR9aPYNqu2rbUKWWVqZUk4MUJb3N07ZAAQ'
});

async function checkCandidatesStructure() {
  try {
    console.log('🔍 Structure complète de la table candidates:');
    const schema = await client.execute('PRAGMA table_info(candidates)');
    
    console.log('\n📋 Colonnes existantes:');
    schema.rows.forEach(col => {
      console.log(`  - ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PK' : ''}`);
    });

    // Vérifier si il y a des champs de découpage administratif
    const hasRegion = schema.rows.some(col => col.name === 'region');
    const hasDepartment = schema.rows.some(col => col.name === 'department');
    const hasCommune = schema.rows.some(col => col.name === 'commune');
    const hasArrondissement = schema.rows.some(col => col.name === 'arrondissement');

    console.log('\n🗺️  Découpage administratif:');
    console.log(`  - region: ${hasRegion ? '✅' : '❌'}`);
    console.log(`  - department: ${hasDepartment ? '✅' : '❌'}`);
    console.log(`  - commune: ${hasCommune ? '✅' : '❌'}`);
    console.log(`  - arrondissement: ${hasArrondissement ? '✅' : '❌'}`);

    if (!hasRegion && !hasDepartment) {
      console.log('\n⚠️  RECOMMANDATION: Ajouter des colonnes pour le découpage administratif');
      console.log('   ALTER TABLE candidates ADD COLUMN region TEXT;');
      console.log('   ALTER TABLE candidates ADD COLUMN department TEXT;');
      console.log('   ALTER TABLE candidates ADD COLUMN commune TEXT;');
      console.log('   ALTER TABLE candidates ADD COLUMN arrondissement TEXT;');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkCandidatesStructure().then(() => process.exit(0));
