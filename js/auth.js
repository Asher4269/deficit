/*
====================================================
    AUTHENTICATION HELPERS
====================================================

This file contains reusable authentication functions
used throughout the Deficit application.

Pages that use this file:

- index.html
- signup.html
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
    Redirect Logged-In Users
====================================================

Used on:

index.html

signup.html

If the user is already logged in,
send them directly to profile.html.

====================================================
*/

async function redirectIfLoggedIn() {
  const session = await getSession();

  if (session) {
    window.location.href = "profile.html";
  }
}

/*
====================================================
    Protect Private Pages
====================================================

Used on:

profile.html

weight.html

dashboard.html

workouts.html

calories.html

If the user isn't logged in,
send them back to index.html.

====================================================
*/

async function requireAuth() {
  const session = await getSession();

  if (!session) {
    window.location.href = "index.html";
  }
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
