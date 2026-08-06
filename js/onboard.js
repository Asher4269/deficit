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
  // send them to the dashboard.
  if (profile.display_name) {
    window.location.href = "profile.html";
    return;
  }

  const onboardForm = document.getElementById("onboardForm");

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

    const { error } = await db
      .from("profiles")
      .update({
        display_name: displayName,
        initial_weight: weight,
      })
      .eq("id", profile.id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    window.location.href = "profile.html";
  });
});
