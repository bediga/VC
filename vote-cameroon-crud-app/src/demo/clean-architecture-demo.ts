// Clean Architecture Demo Script
import { 
  initializeCleanArchitecture, 
  getUserUseCases, 
  getCandidateUseCases,
  getElectionManagementService,
  isLeft,
  isRight,
  type User,
  type Candidate
} from '../clean-architecture';

async function demonstrateCleanArchitecture() {
  try {
    console.log('🏗️  Initializing Clean Architecture...');
    
    // Initialize the clean architecture dependency injection system
    initializeCleanArchitecture();
    console.log('✅ Clean Architecture initialized successfully');

    // Get use cases through dependency injection
    const userUseCases = getUserUseCases();
    const candidateUseCases = getCandidateUseCases();
    const electionService = getElectionManagementService();

    console.log('\n📊 Testing User Use Cases...');
    
    // Example: Get all users using clean architecture
    const usersResult = await userUseCases.getAllUsers();
    
    if (isRight(usersResult)) {
      console.log(`✅ Found ${usersResult.value.length} users`);
      usersResult.value.slice(0, 3).forEach((user: User) => {
        console.log(`   - ${user.firstName} ${user.lastName} (${user.role})`);
      });
    } else {
      console.log(`❌ Error getting users: ${usersResult.value.message}`);
    }

    console.log('\n🗳️  Testing Candidate Use Cases...');
    
    // Example: Get all candidates using clean architecture
    const candidatesResult = await candidateUseCases.getAllCandidates();
    
    if (isRight(candidatesResult)) {
      console.log(`✅ Found ${candidatesResult.value.length} candidates`);
      candidatesResult.value.slice(0, 3).forEach((candidate: Candidate) => {
        console.log(`   - ${candidate.firstName} ${candidate.lastName} (${candidate.party})`);
      });
    } else {
      console.log(`❌ Error getting candidates: ${candidatesResult.value.message}`);
    }

    console.log('\n📈 Testing Election Management Service...');
    
    // Example: Get dashboard statistics using application service
    const dashboardResult = await electionService.getDashboardStats();
    
    if (isRight(dashboardResult)) {
      const stats = dashboardResult.value;
      console.log('✅ Dashboard Statistics:');
      console.log(`   📊 Total Users: ${stats.totalUsers}`);
      console.log(`   🗳️  Total Candidates: ${stats.totalCandidates}`);
      console.log(`   🏢 Total Polling Stations: ${stats.totalPollingStations}`);
      console.log(`   📊 Total Votes: ${stats.totalVotes}`);
      
      console.log('   👥 Users by Role:');
      Object.entries(stats.usersByRole).forEach(([role, count]) => {
        console.log(`      - ${role}: ${count}`);
      });

      if (stats.resultsByCandidate.length > 0) {
        console.log('   🏆 Top Candidates:');
        stats.resultsByCandidate
          .sort((a: any, b: any) => b.totalVotes - a.totalVotes)
          .slice(0, 3)
          .forEach((candidate: any) => {
            console.log(`      - ${candidate.candidateName} (${candidate.party}): ${candidate.totalVotes} votes (${candidate.percentage.toFixed(2)}%)`);
          });
      }
    } else {
      console.log(`❌ Error getting dashboard stats: ${dashboardResult.value.message}`);
    }

    console.log('\n🎯 Clean Architecture Benefits Demonstrated:');
    console.log('   ✅ Business logic separated from infrastructure');
    console.log('   ✅ Dependency injection for loose coupling');
    console.log('   ✅ Functional error handling with Either pattern');
    console.log('   ✅ Type-safe interfaces throughout all layers');
    console.log('   ✅ Repository pattern abstracts data access');
    console.log('   ✅ Use cases encapsulate business rules');
    console.log('   ✅ Application services orchestrate workflows');
    
    return true;
  } catch (error) {
    console.error('❌ Clean Architecture Demo Error:', error);
    return false;
  }
}

// Export for use in Next.js API routes or components
export { demonstrateCleanArchitecture };

// If running directly (for testing)
if (require.main === module) {
  demonstrateCleanArchitecture()
    .then((success) => {
      console.log(success ? '\n🎉 Clean Architecture Demo completed successfully!' : '\n💥 Clean Architecture Demo failed!');
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Demo crashed:', error);
      process.exit(1);
    });
}
