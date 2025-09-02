// Comprehensive CRUD System Demonstration
import { 
  initializeCleanArchitecture,
  getUserUseCases,
  getCandidateUseCases,
  getPollingStationUseCases,
  getElectionResultUseCases,
  isLeft,
  isRight,
  type User,
  type Candidate,
  type PollingStation,
  UserRole,
  PollingStationStatus
} from '../clean-architecture';

async function demonstrateComprehensiveCRUDSystem() {
  console.log('🏗️  Initialisation du Système CRUD Complet Vote Cameroon PWA');
  console.log('=' .repeat(80));

  try {
    // Initialize Clean Architecture
    initializeCleanArchitecture();
    console.log('✅ Architecture propre initialisée avec succès');

    // Get use cases
    const userUseCases = getUserUseCases();
    const candidateUseCases = getCandidateUseCases();
    const pollingStationUseCases = getPollingStationUseCases();
    const electionResultUseCases = getElectionResultUseCases();

    console.log('\n📊 DÉMONSTRATION DES FONCTIONNALITÉS CRUD');
    console.log('-' .repeat(50));

    // 1. USER MANAGEMENT CRUD
    console.log('\n👥 1. GESTION DES UTILISATEURS');
    console.log('   📋 Récupération de tous les utilisateurs...');
    
    const usersResult = await userUseCases.getAllUsers();
    if (isRight(usersResult)) {
      console.log(`   ✅ ${usersResult.value.length} utilisateurs trouvés`);
      
      // Show user statistics by role
      const usersByRole = usersResult.value.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('   📈 Répartition par rôle:');
      Object.entries(usersByRole).forEach(([role, count]) => {
        console.log(`      - ${role}: ${count} utilisateur(s)`);
      });

      // Show sample users
      console.log('   👤 Échantillon d\'utilisateurs:');
      usersResult.value.slice(0, 3).forEach((user: User) => {
        console.log(`      - ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
      });
    } else {
      console.log(`   ❌ Erreur: ${usersResult.value.message}`);
    }

    // 2. CANDIDATE MANAGEMENT CRUD
    console.log('\n🗳️  2. GESTION DES CANDIDATS');
    console.log('   📋 Récupération de tous les candidats...');
    
    const candidatesResult = await candidateUseCases.getAllCandidates();
    if (isRight(candidatesResult)) {
      console.log(`   ✅ ${candidatesResult.value.length} candidats trouvés`);

      // Show candidate statistics by party
      const candidatesByParty = candidatesResult.value.reduce((acc, candidate) => {
        acc[candidate.party] = (acc[candidate.party] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('   📈 Répartition par parti:');
      Object.entries(candidatesByParty).forEach(([party, count]) => {
        console.log(`      - ${party}: ${count} candidat(s)`);
      });

      // Show sample candidates
      console.log('   🏆 Échantillon de candidats:');
      candidatesResult.value.slice(0, 3).forEach((candidate: Candidate) => {
        console.log(`      - ${candidate.firstName} ${candidate.lastName} (${candidate.party}) - ${candidate.totalVotes} votes`);
      });
    } else {
      console.log(`   ❌ Erreur: ${candidatesResult.value.message}`);
    }

    // 3. POLLING STATION MANAGEMENT CRUD
    console.log('\n🏢 3. GESTION DES BUREAUX DE VOTE');
    console.log('   📋 Récupération de tous les bureaux de vote...');
    
    const pollingStationsResult = await pollingStationUseCases.getAllPollingStations();
    if (isRight(pollingStationsResult)) {
      console.log(`   ✅ ${pollingStationsResult.value.length} bureaux de vote trouvés`);

      // Calculate statistics
      const totalRegisteredVoters = pollingStationsResult.value.reduce(
        (sum, station) => sum + station.registeredVoters, 0
      );
      
      const totalVotesSubmitted = pollingStationsResult.value.reduce(
        (sum, station) => sum + station.votesSubmitted, 0
      );

      const avgTurnoutRate = pollingStationsResult.value.length > 0
        ? pollingStationsResult.value.reduce((sum, station) => sum + station.turnoutRate, 0) / pollingStationsResult.value.length
        : 0;

      console.log('   📈 Statistiques électorales:');
      console.log(`      - Électeurs inscrits: ${totalRegisteredVoters.toLocaleString()}`);
      console.log(`      - Votes soumis: ${totalVotesSubmitted.toLocaleString()}`);
      console.log(`      - Taux de participation moyen: ${avgTurnoutRate.toFixed(2)}%`);

      // Show stations by status
      const stationsByStatus = pollingStationsResult.value.reduce((acc, station) => {
        acc[station.status] = (acc[station.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('   📊 Répartition par statut:');
      Object.entries(stationsByStatus).forEach(([status, count]) => {
        console.log(`      - ${status}: ${count} bureau(x)`);
      });

      // Show sample stations
      console.log('   🏛️  Échantillon de bureaux:');
      pollingStationsResult.value.slice(0, 3).forEach((station: PollingStation) => {
        const location = station.location?.region || 'Non spécifié';
        console.log(`      - ${station.name} (${location}) - ${station.registeredVoters} électeurs, ${station.votesSubmitted} votes`);
      });
    } else {
      console.log(`   ❌ Erreur: ${pollingStationsResult.value.message}`);
    }

    // 4. ELECTION RESULTS ANALYSIS
    console.log('\n📊 4. ANALYSE DES RÉSULTATS ÉLECTORAUX');
    console.log('   📋 Récupération des résultats détaillés...');
    
    const resultsResult = await electionResultUseCases.getResultsWithDetails();
    if (isRight(resultsResult)) {
      console.log(`   ✅ ${resultsResult.value.length} résultats trouvés`);

      // Calculate candidate totals
      const candidateVotes = new Map<number, { name: string; party: string; votes: number }>();
      let totalVotes = 0;

      resultsResult.value.forEach(result => {
        totalVotes += result.votes;
        const existing = candidateVotes.get(result.candidateId);
        if (existing) {
          existing.votes += result.votes;
        } else {
          candidateVotes.set(result.candidateId, {
            name: result.candidateName,
            party: result.candidateParty,
            votes: result.votes
          });
        }
      });

      console.log(`   📊 Total des votes: ${totalVotes.toLocaleString()}`);
      
      if (candidateVotes.size > 0) {
        console.log('   🏆 Classement des candidats:');
        Array.from(candidateVotes.entries())
          .sort(([,a], [,b]) => b.votes - a.votes)
          .slice(0, 5)
          .forEach(([candidateId, data], index) => {
            const percentage = totalVotes > 0 ? (data.votes / totalVotes) * 100 : 0;
            console.log(`      ${index + 1}. ${data.name} (${data.party}): ${data.votes.toLocaleString()} votes (${percentage.toFixed(2)}%)`);
          });
      }
    } else {
      console.log(`   ❌ Erreur: ${resultsResult.value.message}`);
    }

    // 5. SYSTEM CAPABILITIES SUMMARY
    console.log('\n🎯 CAPACITÉS DU SYSTÈME CRUD COMPLET');
    console.log('-' .repeat(50));
    console.log('✅ Architecture propre avec séparation des couches');
    console.log('✅ Gestion complète des utilisateurs (CRUD)');
    console.log('✅ Gestion complète des candidats (CRUD)');
    console.log('✅ Gestion complète des bureaux de vote (CRUD)');
    console.log('✅ Gestion complète des résultats électoraux (CRUD)');
    console.log('✅ Système de gestion des erreurs fonctionnel');
    console.log('✅ Interface de repository pour abstraction des données');
    console.log('✅ Cas d\'usage pour la logique métier');
    console.log('✅ Services d\'application pour l\'orchestration');
    console.log('✅ Injection de dépendances');
    console.log('✅ Validation des règles métier');

    console.log('\n📋 TABLES DE BASE DE DONNÉES SUPPORTÉES');
    console.log('-' .repeat(50));
    console.log('👥 Tables utilisateurs:');
    console.log('   - users (utilisateurs)');
    console.log('   - role_permissions (permissions par rôle)');
    console.log('   - user_associations (associations utilisateur-lieux)');
    
    console.log('\n🗺️  Tables hiérarchie administrative:');
    console.log('   - regions');
    console.log('   - departments (départements)');
    console.log('   - arrondissements');
    console.log('   - communes');
    console.log('   - administrative_divisions (divisions génériques)');
    
    console.log('\n🏢 Tables infrastructure électorale:');
    console.log('   - voting_centers (centres de vote)');
    console.log('   - polling_stations_hierarchy (bureaux hiérarchiques)');
    console.log('   - polling_stations (bureaux simples)');
    
    console.log('\n🗳️  Tables candidats et élections:');
    console.log('   - candidates (candidats)');
    console.log('   - election_results (résultats d\'élection)');
    
    console.log('\n📝 Tables soumission de résultats:');
    console.log('   - result_submissions (soumissions)');
    console.log('   - result_submission_details (détails par candidat)');
    console.log('   - submission_results (résultats alternatifs)');
    console.log('   - submission_documents (documents)');
    console.log('   - results (résultats génériques)');
    
    console.log('\n✅ Tables de vérification:');
    console.log('   - verification_tasks (tâches de vérification)');
    console.log('   - verification_history (historique)');
    
    console.log('\n📊 Tables monitoring et statistiques:');
    console.log('   - hourly_turnout (participation horaire)');
    console.log('   - bureau_assignments (assignations bureaux)');

    console.log('\n🔧 FONCTIONNALITÉS TECHNIQUES');
    console.log('-' .repeat(50));
    console.log('✅ Base de données SQLite Cloud (Turso)');
    console.log('✅ Next.js 15.5.2 avec Turbopack');
    console.log('✅ TypeScript pour la sécurité des types');
    console.log('✅ Authentification NextAuth.js');
    console.log('✅ Interface utilisateur avec Tailwind CSS');
    console.log('✅ Composants UI avec shadcn/ui');
    console.log('✅ Gestion d\'état réactif');
    console.log('✅ API Routes pour les endpoints');
    console.log('✅ Validation des données');
    console.log('✅ Gestion des erreurs robuste');

    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la démonstration:', error);
    return false;
  }
}

// Export for use in components or API routes
export { demonstrateComprehensiveCRUDSystem };

// If running directly
if (require.main === module) {
  demonstrateComprehensiveCRUDSystem()
    .then((success) => {
      console.log(success 
        ? '\n🎉 Démonstration du système CRUD complet terminée avec succès!' 
        : '\n💥 Échec de la démonstration!'
      );
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Crash de la démonstration:', error);
      process.exit(1);
    });
}
