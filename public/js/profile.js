// public/js/profile.js
document.addEventListener("DOMContentLoaded", () => {
  const usersList = document.getElementById("users-list");

  // Load all users
  const loadUsers = async () => {
    try {
      const response = await fetch("/profile/users");
      const users = await response.json();

      // Clear existing users
      usersList.innerHTML = "";

      // Add each user to the list
      users.forEach((user) => {
        const userItem = document.createElement("div");
        userItem.className =
          "flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer";
        userItem.setAttribute("data-user-id", user.id);

        userItem.innerHTML = `
          <div class="profile-pic bg-blue-500">
            ${user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p class="font-medium">${user.username}</p>
          </div>
        `;

        userItem.addEventListener("click", () => loadUserProfile(user.id));

        usersList.appendChild(userItem);
      });
    } catch (err) {
      console.error("Error loading users:", err);
      usersList.innerHTML = '<p class="text-red-500">Failed to load users</p>';
    }
  };

  // public/js/profile.js (update the loadUserProfile function)

  // Load user profile
  const loadUserProfile = async (userId) => {
    try {
      const response = await fetch(`/profile/users/${userId}`);
      const data = await response.json();

      // Check if this is the current user's profile
      const isCurrentUser = data.user.id === data.currentUserId;

      // Create a modal to display the user profile
      const modal = document.createElement("div");
      modal.className =
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

      // Create profile content
      let tracksHTML = "";

      if (data.tracks.length === 0) {
        tracksHTML =
          '<p class="text-gray-500 text-center p-4">No tracks available</p>';
      } else {
        tracksHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${data.tracks
              .map((track) => {
                // Get theme color
                const themeColor = track.theme || "blue";

                // Format times preview
                let timesPreview = "";
                if (track.times && track.times.length > 0) {
                  timesPreview = track.times
                    .slice(0, 3)
                    .map((time) => {
                      const timeInSeconds = time.time_ms / 1000;
                      return `<span class="inline-block bg-${themeColor}-100 text-${themeColor}-800 rounded px-2 py-1 text-xs font-mono mr-1 mb-1">${formatTime(timeInSeconds)}</span>`;
                    })
                    .join("");

                  if (track.times.length > 3) {
                    timesPreview += `<span class="inline-block bg-gray-100 text-gray-800 rounded px-2 py-1 text-xs font-mono">+${track.times.length - 3} more</span>`;
                  }
                } else {
                  timesPreview =
                    '<span class="text-gray-500 text-xs">No times recorded</span>';
                }

                // Add delete button if it's the current user's track
                const deleteButton = isCurrentUser
                  ? `<button class="delete-track-btn absolute right-2 top-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none hover:bg-red-100 rounded-full w-6 h-6 flex items-center justify-center" data-track-id="${track.id}">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>`
                  : "";

                return `
                <div class="track-card bg-white border border-${themeColor}-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md group relative">
                  ${deleteButton}
                  <div class="bg-${themeColor}-100 px-4 py-2 border-b border-${themeColor}-200">
                    <h4 class="font-medium text-${themeColor}-800">${track.name}</h4>
                  </div>
                  <div class="p-4">
                    <div class="mb-2">
                      <span class="text-xs text-gray-500">Recent times:</span>
                    </div>
                    <div class="flex flex-wrap">
                      ${timesPreview}
                    </div>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        `;
      }

      modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center space-x-4">
              <div class="profile-pic bg-blue-500 w-12 h-12 text-xl">
                ${data.user.username.charAt(0).toUpperCase()}
              </div>
              <h2 class="text-2xl font-bold">${data.user.username}'s Profile</h2>
            </div>
            <button id="close-profile-modal" class="text-gray-500 hover:text-gray-700 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h3 class="text-lg font-semibold mb-4">Tracks</h3>
          ${tracksHTML}
        </div>
      `;

      // Add modal to the body
      document.body.appendChild(modal);

      // Add close event
      document
        .getElementById("close-profile-modal")
        .addEventListener("click", () => {
          document.body.removeChild(modal);
        });

      // Also close when clicking outside the modal content
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });

      // Add event listeners for delete track buttons
      if (isCurrentUser) {
        const deleteButtons = modal.querySelectorAll(".delete-track-btn");
        deleteButtons.forEach((button) => {
          button.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const trackId = button.getAttribute("data-track-id");

            if (
              confirm(
                "Are you sure you want to delete this track? All times in this track will be lost.",
              )
            ) {
              try {
                const response = await fetch(`/timer/tracks/${trackId}`, {
                  method: "DELETE",
                });

                if (response.ok) {
                  // Remove the track card from the UI
                  const trackCard = button.closest(".track-card");
                  trackCard.remove();

                  // Reload tracks in the main timer view
                  if (typeof loadTracks === "function") {
                    loadTracks();
                  }
                } else {
                  alert("Failed to delete track");
                }
              } catch (err) {
                console.error("Error deleting track:", err);
                alert("Error deleting track");
              }
            }
          });
        });
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    }
  };

  // Helper function to format time
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 1000);

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
  };

  // Load users when the page loads
  loadUsers();
});
