import { createContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =====================================================
  // FETCH USER PROFILE
  // =====================================================
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    try {
      const { data, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error(
          "Profile fetch error:",
          profileError.message
        );

        setProfile(null);
        return null;
      }

      if (!data) {
        console.warn(
          "No profile row found for user:",
          userId
        );

        setProfile(null);
        return null;
      }

      setProfile(data);
      return data;
    } catch (err) {
      console.error("Unexpected profile error:", err);

      setProfile(null);
      return null;
    }
  }, []);

  // =====================================================
  // INITIAL SESSION
  // =====================================================
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (sessionError) {
          console.error(
            "Session error:",
            sessionError.message
          );

          setError(sessionError.message);
          setLoading(false);
          return;
        }

        const currentUser = session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);

        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    init();

    // =====================================================
    // AUTH STATE LISTENER
    // =====================================================
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;

        const currentUser = session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  // =====================================================
  // SIGN UP
  // =====================================================
  const signUp = useCallback(
    async ({ email, password, name, role = "recruiter" }) => {
      setError(null);

      const {
        data,
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        throw signUpError;
      }

      if (data?.user) {
        const { error: profileError } = await supabase
          .from("users")
          .upsert(
            {
              id: data.user.id,
              email,
              name,
              role,
            },
            {
              onConflict: "id",
            }
          );

        if (profileError) {
          console.error(
            "Profile creation error:",
            profileError.message
          );
        }
      }

      return data;
    },
    []
  );

  // =====================================================
  // CANDIDATE SIGN UP (candidate portal only — never gets recruiter access)
  // =====================================================
  const signUpCandidate = useCallback(
    async ({ email, password, name }) => signUp({ email, password, name, role: "candidate" }),
    [signUp]
  );

  // =====================================================
  // SIGN IN
  // =====================================================
  const signIn = useCallback(
    async ({ email, password }) => {
      setError(null);

      const {
        data,
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        throw signInError;
      }

      return data;
    },
    []
  );

  // =====================================================
  // GOOGLE SIGN IN
  // =====================================================
  const signInWithGoogle = useCallback(async () => {
    setError(null);

    const {
      error: oauthError,
    } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      throw oauthError;
    }
  }, []);

  // =====================================================
  // SIGN OUT
  // =====================================================
  const signOut = useCallback(async () => {
    const { error: signOutError } =
      await supabase.auth.signOut();

    if (signOutError) {
      console.error(
        "Sign out error:",
        signOutError.message
      );
    }

    setUser(null);
    setProfile(null);
  }, []);

  // =====================================================
  // REFRESH PROFILE
  // =====================================================
  const refreshProfile = useCallback(() => {
    if (user?.id) {
      return fetchProfile(user.id);
    }

    return null;
  }, [user?.id, fetchProfile]);

  // =====================================================
  // CONTEXT VALUE
  // =====================================================
  const value = {
    user,
    profile,
    role: profile?.role ?? null,
    loading,
    error,
    isAuthenticated: !!user,

    signUp,
    signUpCandidate,
    signIn,
    signInWithGoogle,
    signOut,

    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}