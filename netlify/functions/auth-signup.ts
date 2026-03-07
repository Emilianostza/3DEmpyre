/**
 * Netlify Function: Supabase Auth Sign-Up
 *
 * Handles user registration via Supabase Auth.
 * This function acts as a bridge between frontend and Supabase,
 * keeping the Supabase URL and keys accessible only server-side.
 *
 * Environment variables required:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 *
 * Usage (from frontend):
 * const response = await fetch('/.netlify/functions/auth-signup', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     email: 'user@example.com',
 *     password: 'secure-password',
 *     fullName: 'John Doe'
 *   })
 * });
 */

type Handler = (event: any) => Promise<{ statusCode: number; body: string }>;

interface SignUpRequest {
  email: string;
  password: string;
  fullName?: string;
}

const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email, password, fullName } = JSON.parse(event.body || '{}') as SignUpRequest;

    // Validate input
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password are required' }),
      };
    }

    // Prefer non-VITE_ prefixed vars (server-side convention), fall back to VITE_ for dev compat
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Auth SignUp] Missing Supabase configuration');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Auth service not configured' }),
      };
    }

    // Call Supabase Auth API
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
      },
      body: JSON.stringify({
        email,
        password,
        user_metadata: {
          full_name: fullName || email.split('@')[0],
        },
      }),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      console.error('[Auth SignUp] Supabase error:', authData.error_description || authData.error);
      return {
        statusCode: authResponse.status,
        body: JSON.stringify({
          error: authData.error_description || authData.error || 'Sign-up failed',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        user: authData.user,
        session: authData.session,
      }),
    };
  } catch (error) {
    console.error('[Auth SignUp] Exception:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};

export { handler };
