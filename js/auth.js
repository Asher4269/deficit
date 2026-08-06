/*
====================================================
    AUTHENTICATION HELPERS
====================================================

This file contains reusable authentication functions
used throughout the Deficit application.

Pages that use this file:

- index.html
- signup.html
- onboard.html
- profile.html
- dashboard.html
- weight.html
- workouts.html
- calories.html

====================================================
*/

/*
====================================================
    Get Current Session
====================================================
*/

async function getSession() {
  const { data, error } = await db.auth.getSession();

  if (error) {
    console.error(error);
    return null;
  }

  return data.session;
}

/*
====================================================
    Get Current User
====================================================
*/

async function getCurrentUser() {
  const { data, error } = await db.auth.getUser();

  if (error) {
    console.error(error);
    return null;
  }

  return data.user;
}

/*
====================================================
    Get Current Profile
====================================================

Returns the user's profile row.

====================================================
*/

async function getCurrentProfile() {
  const user = await getCurrentUser();

  if (!user) return null;

  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

/*
====================================================
    Redirect Logged-In Users
====================================================

Used on:

- index.html
- signup.html

If the user is already logged in,
send them to the appropriate page.

====================================================
*/

async function redirectIfLoggedIn() {
  const session = await getSession();

  if (!session) return;

  const profile = await getCurrentProfile();

  if (!profile) return;

  if (!profile.display_name) {
    window.location.href = "onboard.html";
  } else {
    window.location.href = "profile.html";
  }
}

/*
====================================================
    Protect Private Pages
====================================================

Used on:

- profile.html
- dashboard.html
- weight.html
- workouts.html
- calories.html

If the user isn't logged in,
send them back to index.html.

If they haven't completed onboarding,
send them to onboard.html.

Returns the user's profile.

====================================================
*/

async function requireAuth() {
  const session = await getSession();

  if (!session) {
    window.location.href = "index.html";
    return null;
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    window.location.href = "index.html";
    return null;
  }

  if (!profile.display_name) {
    window.location.href = "onboard.html";
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
    console.error(error);
    return;
  }

  window.location.href = "index.html";
}
