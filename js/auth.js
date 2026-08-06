/*
====================================================
    AUTHENTICATION HELPERS
====================================================

Pages that use this file:

- index.html
- signup.html
- profile.html
- dashboard.html
- weight.html
- workouts.html
- calories.html

A profile row is always created complete at signup
(display_name + initial_weight are set immediately),
so there is no "logged in but not onboarded" state to
route around anymore.

====================================================
    Redirect Loop Guard
====================================================

If index.html <-> profile.html (or similar) ever start
bouncing off each other again, this stops it after a
couple of hops instead of spinning forever, and tells
you clearly in the console + on screen.

====================================================
*/

const REDIRECT_GUARD_KEY = "deficit_redirect_count";
const REDIRECT_GUARD_LIMIT = 3;
const REDIRECT_GUARD_WINDOW_MS = 4000;

function guardedRedirect(destination) {
  const now = Date.now();

  let guard;
  try {
    guard = JSON.parse(sessionStorage.getItem(REDIRECT_GUARD_KEY)) || {
      count: 0,
      firstAt: now,
    };
  } catch {
    guard = { count: 0, firstAt: now };
  }

  // Reset the counter if the last redirect was a while ago
  if (now - guard.firstAt > REDIRECT_GUARD_WINDOW_MS) {
    guard = { count: 0, firstAt: now };
  }

  guard.count += 1;

  if (guard.count > REDIRECT_GUARD_LIMIT) {
    console.error(
      `Redirect loop detected (tried to go to "${destination}"). Stopping to avoid an infinite loop.`,
    );
    sessionStorage.removeItem(REDIRECT_GUARD_KEY);
    document.body.innerHTML =
      '<div style="color:white;font-family:sans-serif;padding:40px;max-width:500px;margin:auto;">' +
      "<h2>Something's wrong with your session</h2>" +
      "<p>The app tried to redirect too many times in a row. Please clear your browser's local storage for this site and try logging in again.</p>" +
      '<button onclick="localStorage.clear(); sessionStorage.clear(); window.location.href=\'index.html\';" style="margin-top:16px;padding:12px 20px;background:#39ff14;border:none;border-radius:10px;font-weight:700;cursor:pointer;">Reset & Go to Login</button>' +
      "</div>";
    return;
  }

  sessionStorage.setItem(REDIRECT_GUARD_KEY, JSON.stringify(guard));
  window.location.href = destination;
}

/*
====================================================
    Get Current Session
====================================================
*/

async function getSession() {
  const { data, error } = await db.auth.getSession();

  if (error) {
    console.error("getSession error:", error);
    return null;
  }

  return data.session;
}

/*
====================================================
    Get Current Profile
====================================================

Returns the user's profile row. Assumes a session
already exists — call getSession()/requireAuth() first.

====================================================
*/

async function getCurrentProfile() {
  const {
    data: { user },
    error: userError,
  } = await db.auth.getUser();

  if (userError || !user) {
    console.error("getCurrentProfile: no user", userError);
    return null;
  }

  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getCurrentProfile: query error", error);
    return null;
  }

  if (!data) {
    console.error(
      "getCurrentProfile: session exists but no matching profiles row for this user id. Check that signup wrote the row and that RLS SELECT policy allows it.",
    );
    return null;
  }

  return data;
}

/*
====================================================
    Get Current User
====================================================
*/

async function getCurrentUser() {
  const { data, error } = await db.auth.getUser();

  if (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }

  return data.user;
}

/*
====================================================
    Redirect Logged-In Users
====================================================

Used on: index.html, signup.html

If the user already has a valid session, send them to
profile.html.

====================================================
*/

async function redirectIfLoggedIn() {
  const session = await getSession();

  if (!session) return;

  guardedRedirect("profile.html");
}

/*
====================================================
    Protect Private Pages
====================================================

Used on: profile.html, dashboard.html, weight.html,
workouts.html, calories.html

If there's no session, send back to index.html.
If there's a session but somehow no profile row,
also send back to index.html (this should not happen
under normal use since signup always creates the row).

Returns the user's profile, or null if it redirected.

====================================================
*/

async function requireAuth() {
  const session = await getSession();

  if (!session) {
    guardedRedirect("index.html");
    return null;
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    guardedRedirect("index.html");
    return null;
  }

  return profile;
}

/*
====================================================
    Logout
====================================================
*/

async function logout() {
  const { error } = await db.auth.signOut();

  if (error) {
    console.error("logout error:", error);
    return;
  }

  sessionStorage.removeItem(REDIRECT_GUARD_KEY);
  window.location.href = "index.html";
}
