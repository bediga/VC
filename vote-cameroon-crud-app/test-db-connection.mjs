import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://vote-mp3-cameroon.aws-eu-west-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTUzODMzODMsImlkIjoiMWUwMWM1NTgtNTc0Mi00NmMzLWJkN2MtYjE2N2FmZTU5ZGY4IiwicmlkIjoiM2FiZDE4NTktMGMxYi00ODcwLWE5Y2QtZjkzZTVkZWEzNmQ1In0.YrGkH4SBRAmrPB2uF7iXqSFvLqS22xZlWo4aT5bMEU0HRbhZwE4QvR9aPYNqu2rbUKWWVqZUk4MUJb3N07ZAAQ'
});

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test simple query
    const result = await client.execute('SELECT COUNT(*) as count FROM users');
    console.log('✅ Database connected successfully!');
    console.log('👥 Users in database:', result.rows[0]?.count);
    
    // Test candidates
    const candidatesResult = await client.execute('SELECT COUNT(*) as count FROM candidates');
    console.log('🗳️ Candidates in database:', candidatesResult.rows[0]?.count);
    
    // Test polling stations
    const stationsResult = await client.execute('SELECT COUNT(*) as count FROM polling_stations');
    console.log('🏛️ Polling stations in database:', stationsResult.rows[0]?.count);
    
    console.log('\n🎉 All database connections are working!');
    console.log('🌐 Application ready at: http://localhost:3001');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testConnection();
