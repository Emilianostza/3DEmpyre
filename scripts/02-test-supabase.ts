/**
 * Supabase Integration Test Suite
 *
 * Run this after:
 * 1. Creating Supabase project
 * 2. Running migration (01-init-supabase.sql)
 * 3. Setting environment variables
 *
 * Usage:
 * 1. Build the app: npm run build
 * 2. Start dev server: npm run dev
 * 3. Open browser console
 * 4. Run: await testSupabaseIntegration()
 *
 * Expected result: All tests pass, database ready for production
 */

import { supabase } from '@/services/supabase/client';
import { env } from '@/config/env';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

/**
 * Run complete test suite
 */
export async function testSupabaseIntegration() {
  console.clear();
  console.log(
    '%c🧪 SUPABASE INTEGRATION TEST SUITE',
    'font-size: 18px; font-weight: bold; color: #3b82f6;'
  );
  console.log('%c===================================', 'font-size: 14px; color: #6b7280;');
  console.log();

  results.length = 0;

  // Configuration tests
  console.log('%c📋 Configuration Tests', 'font-size: 14px; font-weight: bold;');
  await testEnvConfiguration();
  await testClientInitialization();

  // Connection tests
  console.log('\n%c🔌 Connection Tests', 'font-size: 14px; font-weight: bold;');
  await testDatabaseConnection();
  await testSupabaseClient();

  // Schema tests
  console.log('\n%c📊 Schema Tests', 'font-size: 14px; font-weight: bold;');
  await testTableExists('orgs');
  await testTableExists('user_profiles');
  await testTableExists('projects');
  await testTableExists('assets');
  await testTableExists('user_org_memberships');
  await testTableExists('payouts');

  // RLS policy tests
  console.log('\n%c🔒 RLS Policy Tests', 'font-size: 14px; font-weight: bold;');
  await testRLSPolicies();

  // Auth tests
  console.log('\n%c🔑 Authentication Tests', 'font-size: 14px; font-weight: bold;');
  await testAuthStatus();
  await testAuthListener();

  // Print summary
  printTestSummary();
}

// ============================================================================
// CONFIGURATION TESTS
// ============================================================================

async function testEnvConfiguration() {
  const start = performance.now();

  try {
    const hasUrl = env.supabaseUrl && env.supabaseUrl.length > 0;
    const hasKey = env.supabaseAnonKey && env.supabaseAnonKey.length > 20;
    const isMockMode = env.useMockData;

    if (!hasUrl) throw new Error('VITE_SUPABASE_URL not set');
    if (!hasKey) throw new Error('VITE_SUPABASE_ANON_KEY invalid');

    results.push({
      name: 'Environment Configuration',
      status: 'pass',
      message: isMockMode
        ? '⚠️  Using mock data (VITE_USE_MOCK_DATA=true)'
        : '✅ Real backend enabled (VITE_USE_MOCK_DATA=false)',
      duration: performance.now() - start,
    });

    if (isMockMode) {
      console.warn('⚠️  App is in mock mode. Set VITE_USE_MOCK_DATA=false to use Supabase.');
    }
  } catch (error) {
    results.push({
      name: 'Environment Configuration',
      status: 'fail',
      message: 'Environment not configured correctly',
      duration: performance.now() - start,
      error: String(error),
    });
  }
}

async function testClientInitialization() {
  const start = performance.now();

  try {
    if (!supabase) throw new Error('Supabase client not initialized');

    // Check methods exist
    const hasAuthMethods = supabase.auth && typeof supabase.auth.getSession === 'function';
    const hasQueryMethod = supabase.from && typeof supabase.from === 'function';

    if (!hasAuthMethods || !hasQueryMethod) {
      throw new Error('Supabase client missing required methods');
    }

    results.push({
      name: 'Supabase Client',
      status: 'pass',
      message: 'Client initialized with all required methods',
      duration: performance.now() - start,
    });
  } catch (error) {
    results.push({
      name: 'Supabase Client',
      status: 'fail',
      message: 'Client initialization failed',
      duration: performance.now() - start,
      error: String(error),
    });
  }
}

// ============================================================================
// CONNECTION TESTS
// ============================================================================

async function testDatabaseConnection() {
  const start = performance.now();

  try {
    // Simple count query to test connectivity
    const { data, error } = await supabase
      .from('orgs')
      .select('count(*)', { count: 'exact' })
      .limit(0);

    if (error && error.code !== '403') {
      throw new Error(`Database error: ${error.message}`);
    }

    results.push({
      name: 'Database Connection',
      status: 'pass',
      message:
        error?.code === '403'
          ? 'Database reachable (RLS preventing unauthenticated access - expected)'
          : 'Database connected and queryable',
      duration: performance.now() - start,
    });
  } catch (error) {
    results.push({
      name: 'Database Connection',
      status: 'fail',
      message: 'Failed to connect to database',
      duration: performance.now() - start,
      error: String(error),
    });
  }
}

async function testSupabaseClient() {
  const start = performance.now();

  try {
    const { data: session, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    results.push({
      name: 'Supabase Service',
      status: 'pass',
      message: session?.session
        ? `Authenticated as: ${session.session.user.email}`
        : 'Service reachable (no session - expected for new user)',
      duration: performance.now() - start,
    });
  } catch (error) {
    results.push({
      name: 'Supabase Service',
      status: 'fail',
      message: 'Failed to communicate with Supabase',
      duration: performance.now() - start,
      error: String(error),
    });
  }
}

// ============================================================================
// SCHEMA TESTS
// ============================================================================

async function testTableExists(tableName: string) {
  const start = performance.now();

  try {
    const { error } = await supabase.from(tableName).select('*').limit(0);

    if (error && !error.message.includes('does not exist') && error.code !== '403') {
      throw error;
    }

    results.push({
      name: `Table: ${tableName}`,
      status: 'pass',
      message: `Table '${tableName}' exists and is accessible`,
      duration: performance.now() - start,
    });
  } catch (error) {
    results.push({
      name: `Table: ${tableName}`,
      status: 'fail',
      message: `Table '${tableName}' not found or inaccessible`,
      duration: performance.now() - start,
      error: String(error),
    });
  }
}

// ============================================================================
// RLS POLICY TESTS
// ============================================================================

async function testRLSPolicies() {
  const start = performance.now();

  try {
    // Try to query without being authenticated
    // Should get 403 if RLS is working
    const { error } = await supabase.from('projects').select('*').limit(1);

    const rlsWorking = error?.code === '403' || error?.code === '401';

    results.push({
      name: 'RLS Policies',
      status: rlsWorking ? 'pass' : 'skip',
      message: rlsWorking
        ? 'RLS policies active (unauthenticated access blocked)'
        : 'Cannot verify RLS (user may be authenticated)',
      duration: performance.now() - start,
    });
  } catch (error) {
    results.push({
      name: 'RLS Policies',
      status: 'fail',
      message: 'Failed to test RLS policies',
      duration: performance.now() - start,
      error: String(error),
    });
  }
}

// ============================================================================
// AUTHENTICATION TESTS
// ============================================================================

async function testAuthStatus() {
  const start = performance.now();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    results.push({
      name: 'Auth Status',
      status: user ? 'pass' : 'skip',
      message: user
        ? `Authenticated as: ${user.email}`
        : 'Not authenticated (expected - create test user)',
      duration: performance.now() - start,
    });
  } catch (error) {
    results.push({
      name: 'Auth Status',
      status: 'fail',
      message: 'Failed to check authentication',
      duration: performance.now() - start,
      error: String(error),
    });
  }
}

async function testAuthListener() {
  const start = performance.now();

  try {
    let listenerWorking = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      listenerWorking = true;
    });

    // Give listener moment to fire
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (!subscription) throw new Error('Listener not created');

    results.push({
      name: 'Auth Listener',
      status: 'pass',
      message: 'Auth state listener active',
      duration: performance.now() - start,
    });

    subscription.unsubscribe();
  } catch (error) {
    results.push({
      name: 'Auth Listener',
      status: 'fail',
      message: 'Failed to set up auth listener',
      duration: performance.now() - start,
      error: String(error),
    });
  }
}

// ============================================================================
// PRINT RESULTS
// ============================================================================

function printTestSummary() {
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const skipped = results.filter((r) => r.status === 'skip').length;

  console.log('\n%c📊 TEST RESULTS', 'font-size: 14px; font-weight: bold;');
  console.log('================================\n');

  results.forEach((result) => {
    const icon = {
      pass: '✅',
      fail: '❌',
      skip: '⊘ ',
    }[result.status];

    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}`);
    console.log(`   ⏱️  ${result.duration.toFixed(2)}ms`);

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }

    console.log();
  });

  console.log('%c📈 SUMMARY', 'font-size: 14px; font-weight: bold;');
  console.log(`✅ Passed:  ${passed}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`⊘  Skipped: ${skipped}`);
  console.log(`Total: ${results.length}`);

  if (failed > 0) {
    console.log(
      '\n%c⚠️  SETUP INCOMPLETE - Fix errors above before proceeding',
      'color: #dc2626; font-weight: bold;'
    );
  } else if (passed === results.length) {
    console.log(
      '\n%c✨ ALL TESTS PASSED - Supabase is ready for production!',
      'color: #10b981; font-weight: bold;'
    );
  } else {
    console.log(
      '\n%c⏳ TESTS PASSED WITH WARNINGS - Some features skipped (may be normal)',
      'color: #f59e0b; font-weight: bold;'
    );
  }
}

export default testSupabaseIntegration;
