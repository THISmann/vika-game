#!/usr/bin/env node

/**
 * Test spécifique pour la comparaison des réponses
 * Vérifie différents cas de comparaison de réponses
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testComparison(answer, correct, description) {
  log(`\n📋 Test: ${description}`, 'cyan');
  log(`   Réponse: "${answer}" (type: ${typeof answer}, length: ${answer.length})`, 'yellow');
  log(`   Correcte: "${correct}" (type: ${typeof correct}, length: ${correct.length})`, 'yellow');
  
  // Test 1: Comparaison stricte
  const strict = answer === correct;
  log(`   === (strict): ${strict}`, strict ? 'green' : 'red');
  
  // Test 2: Comparaison avec trim
  const trimmed = String(answer).trim() === String(correct).trim();
  log(`   trim(): ${trimmed}`, trimmed ? 'green' : 'red');
  
  // Test 3: Comparaison avec lowercase
  const lowercased = String(answer).toLowerCase().trim() === String(correct).toLowerCase().trim();
  log(`   toLowerCase().trim(): ${lowercased}`, lowercased ? 'green' : 'red');
  
  // Test 4: Comparaison avec normalisation Unicode
  const normalized = String(answer).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() === 
                     String(correct).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  log(`   normalize(): ${normalized}`, normalized ? 'green' : 'red');
  
  // Afficher les codes de caractères
  log(`   Codes réponse: ${answer.split('').map(c => c.charCodeAt(0)).join(', ')}`, 'yellow');
  log(`   Codes correcte: ${correct.split('').map(c => c.charCodeAt(0)).join(', ')}`, 'yellow');
  
  return {
    strict,
    trimmed,
    lowercased,
    normalized
  };
}

log('🧪 TEST DE COMPARAISON DES RÉPONSES', 'cyan');
log('='.repeat(70), 'cyan');

// Test 1: Réponses identiques
testComparison('Paris', 'Paris', 'Réponses identiques');

// Test 2: Espaces avant/après
testComparison(' Paris ', 'Paris', 'Espaces avant/après');

// Test 3: Différences de casse
testComparison('paris', 'Paris', 'Différences de casse');

// Test 4: Espaces multiples
testComparison('  Paris  ', 'Paris', 'Espaces multiples');

// Test 5: Caractères invisibles
testComparison('Paris\u200B', 'Paris', 'Caractères invisibles (zero-width space)');

// Test 6: Réponses différentes
testComparison('Londres', 'Paris', 'Réponses différentes');

// Test 7: Réponses numériques
testComparison('4', '4', 'Réponses numériques identiques');
testComparison(' 4 ', '4', 'Réponses numériques avec espaces');

// Test 8: Réponses avec accents
testComparison('Café', 'Café', 'Réponses avec accents identiques');
testComparison('Cafe', 'Café', 'Réponses avec/sans accents');

log('\n' + '='.repeat(70), 'cyan');
log('📊 CONCLUSION', 'cyan');
log('='.repeat(70), 'cyan');
log('Pour une comparaison robuste, utiliser:', 'yellow');
log('  String(answer).trim() === String(correct).trim()', 'green');
log('Ou pour ignorer la casse:', 'yellow');
log('  String(answer).toLowerCase().trim() === String(correct).toLowerCase().trim()', 'green');



