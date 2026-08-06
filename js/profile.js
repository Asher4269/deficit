/*
====================================================
    PROFILE
====================================================
*/

initializeProfile();

async function initializeProfile() {
  const profile = await requireAuth();

  if (!profile) return;

  renderProfile(profile);

  const nameForm = document.getElementById("name-form");
  nameForm.addEventListener("submit", (event) =>
    saveDisplayName(event, profile),
  );
}

function renderProfile(profile) {
  const heading = document.getElementById("user-email");
  const namePrompt = document.getElementById("name-prompt");

  if (profile.display_name) {
    heading.textContent = profile.display_name;
    namePrompt.style.display = "none";
  } else {
    // Fall back to showing their email until they set a name
    heading.textContent = profile.email;
    namePrompt.style.display = "block";
  }
}

async function saveDisplayName(event, profile) {
  event.preventDefault();

  const input = document.getElementById("name-input");
  const displayName = input.value.trim();

  if (!displayName) {
    alert("Please enter a name.");
    return;
  }

  const submitBtn = event.target.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";

  const { data, error } = await db
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", profile.id)
    .select()
    .single();

  submitBtn.disabled = false;
  submitBtn.textContent = "Save";

  if (error || !data) {
    console.error("saveDisplayName error:", error);
    alert("Couldn't save your name. Please try again.");
    return;
  }

  renderProfile(data);
}
