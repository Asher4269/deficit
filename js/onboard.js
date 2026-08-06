/*
====================================================
    ONBOARDING
====================================================
*/

document.addEventListener("DOMContentLoaded", async () => {
  // Verify the user is logged in
  const profile = await requireAuth();

  if (!profile) return;

  // If onboarding has already been completed,
  // send them to the profile page.
  if (profile.display_name) {
    window.location.href = "profile.html";
    return;
  }

  const onboardForm = document.getElementById("onboardForm");
  const submitBtn = onboardForm.querySelector("button[type='submit']");

  onboardForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const displayName = document.getElementById("displayName").value.trim();
    const weight = parseFloat(document.getElementById("weight").value);

    if (!displayName) {
      alert("Please enter your name.");
      return;
    }

    if (isNaN(weight) || weight <= 0) {
      alert("Please enter a valid weight.");
      return;
    }

    // Disable the button so we can't double-submit while waiting
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    const { data, error } = await db
      .from("profiles")
      .update({
        display_name: displayName,
        initial_weight: weight,
      })
      .eq("id", profile.id)
      .select()
      .single();

    submitBtn.disabled = false;
    submitBtn.textContent = "Continue";

    if (error) {
      console.error(error);
      alert(
        "We couldn't save your profile: " +
          error.message +
          "\n\nThis is usually a database permissions (RLS) issue, not something wrong with your input.",
      );
      return;
    }

    if (!data || !data.display_name) {
      // The update "succeeded" but didn't actually change anything.
      // This is the classic silent-RLS-block symptom.
      console.error(
        "Update returned no data — check RLS UPDATE policy on profiles.",
      );
      alert(
        "Your profile wasn't saved. Please contact support or try again later.",
      );
      return;
    }

    // window.location.href = "profile.html";
  });
});
