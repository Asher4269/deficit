/*
====================================================
    LOGIN
====================================================
*/

redirectIfLoggedIn();

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", login);

async function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();

  const password = document.getElementById("password").value;

  const rememberMe = document.getElementById("remember-me").checked;

  try {
    // Sign the user in
    const { error } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    /*
        We will later use rememberMe
        if we decide to customize session behavior.
        For now, Supabase persists sessions automatically.
    */

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await db.auth.getUser();

    if (userError) throw userError;

    // Retrieve their profile
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    // Decide where to send them
    if (!profile.display_name) {
      window.location.href = "onboard.html";
    } else {
      window.location.href = "profile.html";
    }
  } catch (error) {
    console.error(error);

    alert(error.message);
  }
}
