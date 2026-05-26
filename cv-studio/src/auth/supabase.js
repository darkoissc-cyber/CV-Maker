import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const DEFAULT_CONFIG = { url: '', anonKey: '' };

let supabase = null;
let currentSession = null;
const authListeners = new Set();

function getConfig() {
  const config = window.__CVSTUDIO_SUPABASE_CONFIG__ || DEFAULT_CONFIG;
  return {
    url: String(config.url || '').trim(),
    anonKey: String(config.anonKey || '').trim(),
  };
}

function hasValidConfig() {
  const { url, anonKey } = getConfig();
  return Boolean(url && anonKey && url !== 'YOUR_SUPABASE_URL' && anonKey !== 'YOUR_SUPABASE_ANON_KEY');
}

function notifyAuthListeners(user) {
  authListeners.forEach((listener) => listener(user));
}

function setButtonState(button, hidden) {
  if (!button) {
    return;
  }

  button.hidden = hidden;
}

export function isSupabaseConfigured() {
  return hasValidConfig();
}

export function getSupabaseClient() {
  if (!hasValidConfig()) {
    return null;
  }

  if (!supabase) {
    const { url, anonKey } = getConfig();
    supabase = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'cvstudio-supabase-session',
        storage: window.localStorage,
      },
    });
  }

  return supabase;
}

export function getCurrentUser() {
  return currentSession?.user || null;
}

export async function bootstrapAuth() {
  const client = getSupabaseClient();

  if (!client) {
    currentSession = null;
    notifyAuthListeners(null);
    return { configured: false, session: null };
  }

  const { data: { session } } = await client.auth.getSession();
  currentSession = session;
  notifyAuthListeners(currentSession?.user || null);

  client.auth.onAuthStateChange((_event, session) => {
    currentSession = session;
    notifyAuthListeners(currentSession?.user || null);
  });

  return { configured: true, session: currentSession };
}

export function subscribeAuth(listener) {
  authListeners.add(listener);

  return () => {
    authListeners.delete(listener);
  };
}

export function getAuthConfigWarning() {
  if (hasValidConfig()) {
    return '';
  }

  return 'Add your Supabase URL and anon key in the config block near the top of index.html to enable authentication.';
}

export async function signUp(email, password) {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error(getAuthConfigWarning() || 'Supabase is not configured.');
  }

  return client.auth.signUp({ email, password });
}

export async function signIn(email, password) {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error(getAuthConfigWarning() || 'Supabase is not configured.');
  }

  return client.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error(getAuthConfigWarning() || 'Supabase is not configured.');
  }

  return client.auth.signOut();
}

export async function initializeAuthFlow() {
  const builderShell = document.getElementById('cv-builder-shell');
  const authSection = document.getElementById('auth-section');
  const dashboardShell = document.getElementById('dashboard-shell');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginTab = document.getElementById('auth-tab-login');
  const signupTab = document.getElementById('auth-tab-signup');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const signupEmail = document.getElementById('signup-email');
  const signupPassword = document.getElementById('signup-password');
  const authStatus = document.getElementById('auth-status');
  const dashboardUser = document.getElementById('dashboard-user');
  const dashboardEmail = document.getElementById('dashboard-email');
  const dashboardLogout = document.getElementById('dashboard-logout');
  const navLogin = document.getElementById('nav-login');
  const navSignup = document.getElementById('nav-signup');
  const navDashboard = document.getElementById('nav-dashboard');
  const navLogout = document.getElementById('nav-logout');
  const navBuilder = document.getElementById('nav-builder');
  const authBackBuilder = document.getElementById('auth-back-builder');
  const signupBackBuilder = document.getElementById('signup-back-builder');
  const dashboardBackBuilder = document.getElementById('dashboard-back-builder');

  if (!builderShell || !authSection || !dashboardShell || !loginForm || !signupForm) {
    return;
  }

  function getRoute() {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash === 'login' || hash === 'signup' || hash === 'dashboard') {
      return hash;
    }

    return 'builder';
  }

  function setStatus(message, tone = 'info') {
    if (!authStatus) {
      return;
    }

    authStatus.textContent = message;
    authStatus.className = `auth-status is-${tone}`;
  }

  function toggleAuthForms(route) {
    loginForm.hidden = route !== 'login';
    signupForm.hidden = route !== 'signup';

    if (loginTab) {
      loginTab.classList.toggle('is-active', route === 'login');
    }

    if (signupTab) {
      signupTab.classList.toggle('is-active', route === 'signup');
    }
  }

  function syncNavigation(user) {
    const signedIn = Boolean(user);
    setButtonState(navLogin, signedIn);
    setButtonState(navSignup, signedIn);
    setButtonState(navDashboard, !signedIn);
    setButtonState(navLogout, !signedIn);
    setButtonState(authBackBuilder, false);
    setButtonState(dashboardBackBuilder, false);

    if (navBuilder) {
      navBuilder.hidden = false;
    }
  }

  function renderDashboard(user) {
    if (!user) {
      return;
    }

    dashboardUser.textContent = user.user_metadata?.full_name || user.email || 'CV Studio user';
    dashboardEmail.textContent = user.email || 'No email on file';
  }

  function syncViews(route, user) {
    const signedIn = Boolean(user);

    builderShell.hidden = route !== 'builder';
    authSection.hidden = route === 'builder' || route === 'dashboard';
    dashboardShell.hidden = route !== 'dashboard';

    if (route === 'builder') {
      setStatus('', 'info');
    }

    if (route === 'login' || route === 'signup') {
      toggleAuthForms(route);
      if (!hasValidConfig()) {
        setStatus(getAuthConfigWarning(), 'info');
      } else {
        setStatus('', 'info');
      }
    }

    if (route === 'dashboard' && signedIn) {
      renderDashboard(user);
      setStatus('Your session is stored securely by Supabase and refreshed automatically.', 'success');
    }

    if (route === 'dashboard' && !signedIn) {
      window.location.hash = 'login';
    }

    if (signedIn && (route === 'login' || route === 'signup')) {
      window.location.hash = 'dashboard';
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    if (!hasValidConfig()) {
      setStatus(getAuthConfigWarning(), 'info');
      return;
    }

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
      setStatus('Enter both your email address and password.', 'error');
      return;
    }

    setStatus('Signing in…', 'info');

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setStatus(error.message || 'Unable to sign in. Please try again.', 'error');
        return;
      }

      setStatus('You are signed in. Redirecting to your dashboard…', 'success');
      window.location.hash = 'dashboard';
    } catch (error) {
      setStatus(error.message || 'Unable to sign in. Please check your credentials.', 'error');
    }
  }

  async function handleSignupSubmit(event) {
    event.preventDefault();

    if (!hasValidConfig()) {
      setStatus(getAuthConfigWarning(), 'info');
      return;
    }

    const email = signupEmail.value.trim();
    const password = signupPassword.value;

    if (!email || !password) {
      setStatus('Enter both your email address and password.', 'error');
      return;
    }

    if (password.length < 6) {
      setStatus('Use a password with at least 6 characters.', 'error');
      return;
    }

    setStatus('Creating your account…', 'info');

    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        setStatus(error.message || 'Unable to create your account.', 'error');
        return;
      }

      if (data?.user && !data.session) {
        setStatus('Check your email to confirm your account, then sign in.', 'success');
        window.location.hash = 'login';
        return;
      }

      setStatus('Account created successfully. Redirecting to your dashboard…', 'success');
      window.location.hash = 'dashboard';
    } catch (error) {
      setStatus(error.message || 'Unable to create your account.', 'error');
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      setStatus('You are signed out.', 'success');
      window.location.hash = 'login';
    } catch (error) {
      setStatus(error.message || 'Unable to sign out right now.', 'error');
    }
  }

  function handleRouteChange() {
    const route = getRoute();
    const user = getCurrentUser();
    syncNavigation(user);
    syncViews(route, user);
  }

  loginForm.addEventListener('submit', handleLoginSubmit);
  signupForm.addEventListener('submit', handleSignupSubmit);

  if (navLogin) {
    navLogin.addEventListener('click', () => {
      window.location.hash = 'login';
    });
  }

  if (navSignup) {
    navSignup.addEventListener('click', () => {
      window.location.hash = 'signup';
    });
  }

  if (navDashboard) {
    navDashboard.addEventListener('click', () => {
      window.location.hash = 'dashboard';
    });
  }

  if (navLogout) {
    navLogout.addEventListener('click', handleLogout);
  }

  if (navBuilder) {
    navBuilder.addEventListener('click', () => {
      window.location.hash = 'builder';
    });
  }

  if (authBackBuilder) {
    authBackBuilder.addEventListener('click', () => {
      window.location.hash = 'builder';
    });
  }

  if (signupBackBuilder) {
    signupBackBuilder.addEventListener('click', () => {
      window.location.hash = 'builder';
    });
  }

  if (dashboardBackBuilder) {
    dashboardBackBuilder.addEventListener('click', () => {
      window.location.hash = 'builder';
    });
  }

  if (dashboardLogout) {
    dashboardLogout.addEventListener('click', handleLogout);
  }

  if (loginTab) {
    loginTab.addEventListener('click', () => {
      window.location.hash = 'login';
    });
  }

  if (signupTab) {
    signupTab.addEventListener('click', () => {
      window.location.hash = 'signup';
    });
  }

  subscribeAuth((user) => {
    syncNavigation(user);

    if (user && getRoute() !== 'dashboard') {
      if (getRoute() === 'login' || getRoute() === 'signup') {
        window.location.hash = 'dashboard';
      }
      return;
    }

    if (!user && getRoute() === 'dashboard') {
      window.location.hash = 'login';
    }

    syncViews(getRoute(), user);
  });

  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();

  const authState = await bootstrapAuth();

  if (!authState.configured) {
    setStatus(getAuthConfigWarning(), 'info');
  }

  handleRouteChange();
}
