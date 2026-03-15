'use server';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { seedUserDefaults } from '@mighty/database';

/**
 * Create a Supabase client for server-side operations
 * This client is configured to work with Next.js App Router and server components
 */
// added to exports
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Sign in to Supabase with email and password
 * @param email - User email
 * @param password - User password
 * @returns Authentication response from Supabase
 */

// added to exports

export async function createSupabaseUser(email: string, password: string, first_name: string, last_name: string) {
  try {
    console.log('createSupabaseUser startxxx', email);

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
        },
      },
    });
    console.log('createSupabaseUser resp response', data, error);

    if (error) {
      console.error('Error creating user ERROR CODE:', error.code);

      return { user: null, error: error.code };
    }
    if (!data?.user?.id) {
      console.error('Error creating user ERROR CODE:', 'Error Signing Up');

      return { user: null, error: 'Error Signing Up' };
    }

    await updateUser(data?.user?.id ?? '', {
      first_name,
      last_name,
      username: email,
    });
    await seedUserDefaults(supabase, data?.user?.id ?? '');
    return { user: data, error: null };
  } catch (error) {
    console.error('Failed to  create user:', error);
    return { user: null, error };
  }
}

/**
 * Step 1 of email-OTP signup: send a 6-digit code to the user's email.
 * Enable "Email OTP" in Supabase Auth settings so the email contains a 6-digit token.
 */
export async function requestSignUpOtp(email: string, first_name: string, last_name: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        data: {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
        },
      },
    });
    if (error) {
      console.error('requestSignUpOtp error:', error);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err) {
    console.error('requestSignUpOtp failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send code' };
  }
}

/**
 * Step 2 of email-OTP signup: verify the 6-digit code, set password and metadata, seed defaults, then return.
 * Call this after the user submits the code; session is set in cookies by Supabase.
 */
export async function verifySignUpCode(
  email: string,
  token: string,
  password: string,
  first_name: string,
  last_name: string
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    });
    if (error) {
      console.error('verifySignUpCode error:', error);
      return { success: false, error: error.message };
    }
    if (!data?.user?.id) {
      return { success: false, error: 'Verification failed' };
    }
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
      },
    });
    if (updateError) {
      console.error('verifySignUpCode updateUser error:', updateError);
      return { success: false, error: updateError.message };
    }
    await updateUser(data.user.id, {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      username: email.trim().toLowerCase(),
    });
    await seedUserDefaults(supabase, data.user.id);
    return { success: true, error: null };
  } catch (err) {
    console.error('verifySignUpCode failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Verification failed' };
  }
}

export async function onAuthStateChange(email: string) {
  try {
    //  console.log('onAuthStateChange start', email);
    const supabase = await createSupabaseServerClient();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('supabaseListen onAuthStateChange', event, session);
      if (event === 'INITIAL_SESSION') {
        console.log('supabaseListen INITIAL_SESSION', session);
        // handle initial session
      } else if (event === 'SIGNED_IN') {
        console.log('supabaseListen SIGNED_IN', session);
        // handle sign in event
      } else if (event === 'SIGNED_OUT') {
        console.log('supabaseListen SIGNED_OUT', session);
        // handle sign out event
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('supabaseListen PASSWORD_RECOVERY', session);
        // handle password recovery event
      } else if (event === 'TOKEN_REFRESHED') {
        // handle token refreshed event
      } else if (event === 'USER_UPDATED') {
        // handle user updated event
      }
    });

    data.subscription.unsubscribe();

    // call unsubscribe to remove the callback
  } catch (error) {
    console.error('Failed to onAuthStateChange:', error);
    return { user: null, error };
  }
}

export async function resetPasswordForEmail(email: string) {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    // console.log('resetPasswordForEmail start', email);
    const url = isDev ? 'http://localhost:3000/auth/reset' : process.env.NEXT_PUBLIC_VERCEL_URL + '/auth/reset';
    //   console.log('isDev', isDev, url);
    //  console.log('NEXT_PUBLIC_VERCEL_URL', process.env.NEXT_PUBLIC_VERCEL_URL);

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: url,
    });

    onAuthStateChange(email);

    // console.log('resetPasswordForEmail resp', data);
    if (error) {
      // console.error('Error resetPasswordForEmail:', error);
      console.error('Error resetPasswordForEmail ERROR CODE:', error.code);
      return { user: null, error };
    }
    return { user: data, error: null };
  } catch (error) {
    console.error('Failed to resetPasswordForEmail:', error);
    return { user: null, error };
  }
}
export async function exchangeCodeForSession(code: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('exchangeCodeForSession error:', error);
      return { session: null, error };
    }

    return { session: data.session, error: null };
  } catch (error) {
    console.error('Failed to exchange code for session:', error);
    return { session: null, error };
  }
}

export async function updateUserPassword(newPassword: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('updateUserPassword error:', error);
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Failed to update user password:', error);
    return { user: null, error };
  }
}

export async function GetUsersPublic(email: string) {
  try {
    console.log('GetUsersPublic start', email);

    const supabase = await createSupabaseServerClient();

    let { data: users, error } = await supabase.from('users').select('*').eq('email', email);

    console.log('GetUsersPublic resp', users);

    if (error) {
      console.error('Error GetUsersPublic:', error);
      console.error('Error GetUsersPublic ERROR CODE:', error.code);

      return { user: null, error };
    }

    return { user: users?.[0], error: null };
  } catch (error) {
    console.error('Failed to get GetUsersPublic:', error);
    return { user: null, error };
  }
}

export async function updateUser(user_id: string, data: any) {
  try {
    console.log('updateUser start', user_id, data);

    const supabase = await createSupabaseServerClient();

    let { data: users, error } = await supabase.from('users').select('*').eq('email', user_id);

    console.log('checkuser users resp', users);

    if (error) {
      console.error('Error getting Supabase session:', error);
      return { session: null, error };
    }

    return { user: users?.[0], error: null };
  } catch (error) {
    console.error('Failed to get Supabase session:', error);
    return { session: null, error };
  }
}

export async function getSupabaseUser(id: string) {
  try {
    const supabase = await createSupabaseServerClient();
    let { data: users, error } = await supabase.from('users').select('*').eq('user_id', id);

    console.log('getSupabaseUser users', users);

    if (error) {
      console.error('Error getting Supabase session:', error);
      return { session: null, error };
    }

    return { user: users?.[0], error: null };
  } catch (error) {
    console.error('Failed to get Supabase session:', error);
    return { session: null, error };
  }
}
// added to exports
export async function signInWithSupabase(email: string, password: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log('user222 auth', user);

    if (error) {
      console.error('Supabase sign-in error:', error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Failed to sign in with Supabase:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Sign out from Supabase
 */
// added to exports
export async function signOutFromSupabase() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch (error) {
    console.error('Failed to sign out from Supabase:', error);
    return { success: false, error };
  }
}

/**
 * Get the current Supabase session
 */
// added to exports
export async function getSupabaseSession() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting Supabase session:', error);
      return { session: null, error };
    }

    return { session, error: null };
  } catch (error) {
    console.error('Failed to get Supabase session:', error);
    return { session: null, error };
  }
}

/**
 * Refresh the Supabase session
 */
// added to exports
export async function refreshSupabaseSession() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('Error refreshing Supabase session:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to refresh Supabase session:', error);
    return { success: false, error };
  }
}
