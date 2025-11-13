import { supabase } from './supabase';

export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  role: 'student' | 'teacher',
  school: string
) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          role,
          school,
          language_preference: 'en',
        });

      if (profileError) throw profileError;
    }

    return { success: true, user: authData.user };
  } catch (error) {
    return { success: false, error };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error };
  }
}

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export function getCurrentSession() {
  return supabase.auth.onAuthStateChange((event, session) => {
    return session;
  });
}
