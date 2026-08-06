/*
====================================================
    SIGN UP
====================================================

Just creates the auth user. The database trigger
(on_auth_user_created -> handle_new_user) creates the
matching public.profiles row automatically, with
display_name left NULL. The user sets their name later,
from profile.html, once they're actually logged in —
this avoids racing against email confirmation.

====================================================
*/

redirectIfLoggedIn();

const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", signUp);

async function signUp(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  const submitBtn = signupForm.querySelector(".login-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  try {
    const { data, error } = await db.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (!data.session) {
      // Email confirmation is required — no active session yet.
      alert(
        "Account created! Check your email to confirm your account, then log in.",
      );
      window.location.href = "index.html";
      return;
    }

    window.location.href = "profile.html";
  } catch (error) {
    console.error("signup error:", error);
    alert(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
}
