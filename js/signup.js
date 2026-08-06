/*
====================================================
    SIGN UP
    (includes onboarding — name + starting weight are
    collected here, so a profile is always created
    complete. There is no "half-onboarded" state.)
====================================================
*/

redirectIfLoggedIn();

const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", signUp);

async function signUp(event) {
  event.preventDefault();

  const displayName = document.getElementById("displayName").value.trim();
  const weight = parseFloat(document.getElementById("weight").value);
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (!displayName) {
    alert("Please enter your name.");
    return;
  }

  if (isNaN(weight) || weight <= 0) {
    alert("Please enter a valid weight.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  const submitBtn = signupForm.querySelector(".login-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  try {
    // 1. Create the auth user
    const { data: signUpData, error: signUpError } = await db.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;

    const user = signUpData.user;
    const session = signUpData.session;

    if (!user) {
      alert("Something went wrong creating your account. Please try again.");
      return;
    }

    if (!session) {
      // Email confirmation is required — there is no active session
      // yet, so we can't write the profile row (it would fail RLS,
      // since auth.uid() would be null). Ask them to confirm first.
      alert(
        "Account created! Check your email to confirm your account, then log in.",
      );
      window.location.href = "index.html";
      return;
    }

    // 2. Write the complete profile row ourselves. upsert() means
    // this works whether or not a DB trigger already inserted a
    // bare row for this user — we don't depend on trigger timing.
    const { data: profileData, error: profileError } = await db
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email,
          display_name: displayName,
          initial_weight: weight,
        },
        { onConflict: "id" },
      )
      .select()
      .single();

    if (profileError) throw profileError;

    if (!profileData || !profileData.display_name) {
      // The write didn't actually stick — surface this instead of
      // redirecting into a page that will bounce you right back.
      console.error("Profile upsert returned no usable row:", profileData);
      alert(
        "Your account was created, but we couldn't save your profile details. Please contact support.",
      );
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
