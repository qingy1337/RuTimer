// public/js/timer.js
document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const timerDisplay = document.getElementById("timer-display");
  const timerStatus = document.getElementById("timer-status");
  const timerSection = document.getElementById("timer-section");
  const scrambleDisplay = document.getElementById("scramble-display");
  const scrambleBtn = document.getElementById("scramble-btn");
  const doneScrambleBtn = document.getElementById("done-scrambling-btn");
  const trackSelector = document.getElementById("track-selector");
  const timesList = document.getElementById("times-list");

  // Timer state
  let timerRunning = false;
  let timerReady = false;
  let startTime = 0;
  let timerInterval = null;
  let currentTrackId = null;
  let currentScramble = "";

  // Load user tracks
  const loadTracks = async () => {
    try {
      const response = await fetch("/timer/tracks");
      const tracks = await response.json();

      // Clear existing options
      trackSelector.innerHTML = "";

      if (tracks.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No tracks available";
        option.disabled = true;
        option.selected = true;
        trackSelector.appendChild(option);
      } else {
        tracks.forEach((track) => {
          const option = document.createElement("option");
          option.value = track.id;
          option.textContent = track.name;
          trackSelector.appendChild(option);
        });

        // Select first track by default
        trackSelector.value = tracks[0].id;
        currentTrackId = tracks[0].id;
        loadTimes(currentTrackId);
      }
    } catch (err) {
      console.error("Error loading tracks:", err);
    }
  };

  // Load times for a track
  const loadTimes = async (trackId) => {
    try {
      const response = await fetch(`/timer/tracks/${trackId}/times`);
      const times = await response.json();

      // Update times list
      if (times.length === 0) {
        timesList.innerHTML =
          '<p class="text-gray-500 text-center p-4">No times recorded yet.</p>';
      } else {
        timesList.innerHTML = "";
        times.forEach((time) => {
          const timeCard = document.createElement("div");
          timeCard.className =
            "bg-gray-50 p-3 rounded-md border border-gray-200 relative group";

          const timeInSeconds = time.time_ms / 1000;
          const formattedTime = formatTime(timeInSeconds);
          const date = new Date(time.timestamp).toLocaleString();

          // Create the delete button
          const deleteButton = document.createElement("button");
          deleteButton.className =
            "absolute right-2 top-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none hover:bg-red-100 rounded-full w-6 h-6 flex items-center justify-center";
          deleteButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          `;
          deleteButton.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();

            try {
              const response = await fetch(`/timer/times/${time.id}`, {
                method: "DELETE",
              });

              if (response.ok) {
                // Remove the time card from the UI
                timeCard.remove();

                // Reload times to update the list and graph
                loadTimes(currentTrackId);
              }
            } catch (err) {
              console.error("Error deleting time:", err);
            }
          });

          timeCard.innerHTML = `
            <div class="flex justify-between items-center">
              <div class="font-mono font-medium text-lg">${formattedTime}</div>
              <div class="text-xs text-gray-500">${date}</div>
            </div>
            ${time.scramble ? `<div class="text-xs font-mono mt-2 text-gray-600">${time.scramble}</div>` : ""}
          `;

          timeCard.appendChild(deleteButton);
          timesList.appendChild(timeCard);
        });

        // Also update graph if it's visible
        if (
          !document.getElementById("graph-section").classList.contains("hidden")
        ) {
          updateGraph(times);
        }
      }
    } catch (err) {
      console.error("Error loading times:", err);
    }
  };

  // Format time in MM:SS.mmm
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 1000);

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
  };

  // Timer functions
  const startTimer = () => {
    timerRunning = true;
    timerReady = false;
    startTime = Date.now();
    timerStatus.classList.remove("bg-green-500");
    timerStatus.classList.add("bg-red-500");

    // Start updating the display
    timerInterval = setInterval(() => {
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime) / 1000;
      timerDisplay.textContent = formatTime(elapsedTime);
    }, 10);
  };

  const stopTimer = async () => {
    if (!timerRunning) return;

    clearInterval(timerInterval);
    timerRunning = false;

    const endTime = Date.now();
    const elapsedTime = endTime - startTime;
    timerDisplay.textContent = formatTime(elapsedTime / 1000);

    timerStatus.classList.remove("bg-red-500");
    timerStatus.classList.add("bg-gray-300");

    // Save the time
    if (currentTrackId) {
      try {
        await fetch(`/timer/tracks/${currentTrackId}/times`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            time_ms: elapsedTime,
            scramble: currentScramble,
          }),
        });

        // Reload times
        loadTimes(currentTrackId);
      } catch (err) {
        console.error("Error saving time:", err);
      }
    }
  };

  // Show scramble
  const showScramble = () => {
    // Fade out timer
    timerSection.classList.add("fade-transition");
    timerDisplay.style.opacity = "0";
    timerStatus.style.opacity = "0";
    scrambleBtn.style.opacity = "0";

    setTimeout(() => {
      // Generate scramble
      currentScramble = generateScramble();
      scrambleDisplay.textContent = currentScramble;

      // Show scramble elements
      scrambleDisplay.classList.remove("hidden");
      doneScrambleBtn.classList.remove("hidden");

      // Hide timer elements
      timerDisplay.classList.add("hidden");
      timerStatus.classList.add("hidden");
      scrambleBtn.classList.add("hidden");

      // Fade in scramble
      setTimeout(() => {
        scrambleDisplay.style.opacity = "1";
        doneScrambleBtn.style.opacity = "1";
      }, 50);
    }, 300);
  };

  // Hide scramble
  const hideScramble = () => {
    // Fade out scramble
    scrambleDisplay.style.opacity = "0";
    doneScrambleBtn.style.opacity = "0";

    setTimeout(() => {
      // Hide scramble elements
      scrambleDisplay.classList.add("hidden");
      doneScrambleBtn.classList.add("hidden");

      // Show timer elements
      timerDisplay.classList.remove("hidden");
      timerStatus.classList.remove("hidden");
      scrambleBtn.classList.remove("hidden");

      // Fade in timer
      setTimeout(() => {
        timerDisplay.style.opacity = "1";
        timerStatus.style.opacity = "1";
        scrambleBtn.style.opacity = "1";
      }, 50);
    }, 300);
  };

  // public/js/timer.js (update the keydown and keyup event listeners)

  // Event listeners
  document.addEventListener("keydown", (e) => {
    // Skip if any input field is focused
    if (
      document.activeElement.tagName === "INPUT" ||
      document.activeElement.tagName === "TEXTAREA" ||
      document.activeElement.isContentEditable
    ) {
      return;
    }

    // Space bar pressed
    if (e.code === "Space") {
      e.preventDefault(); // Prevent page scrolling

      // If scramble is showing, hide it and return to timer
      if (!scrambleDisplay.classList.contains("hidden")) {
        hideScramble();
        return;
      }

      // If timer is running, stop it
      if (timerRunning) {
        stopTimer();
        return;
      }

      // If timer is not ready, make it ready
      if (!timerReady) {
        timerReady = true;
        timerStatus.classList.remove("bg-gray-300");
        timerStatus.classList.add("bg-green-500");
      }
    }
  });

  document.addEventListener("keyup", (e) => {
    // Skip if any input field is focused
    if (
      document.activeElement.tagName === "INPUT" ||
      document.activeElement.tagName === "TEXTAREA" ||
      document.activeElement.isContentEditable
    ) {
      return;
    }

    // Space bar released
    if (e.code === "Space") {
      // If timer is ready, start it
      if (timerReady && !timerRunning) {
        startTimer();
      }
    }
  });

  scrambleBtn.addEventListener("click", showScramble);
  doneScrambleBtn.addEventListener("click", hideScramble);

  trackSelector.addEventListener("change", () => {
    currentTrackId = trackSelector.value;
    loadTimes(currentTrackId);
  });

  // Add track button
  document.getElementById("add-track-btn").addEventListener("click", () => {
    document.getElementById("add-track-modal").classList.remove("hidden");
  });

  // Cancel add track
  document.getElementById("cancel-add-track").addEventListener("click", () => {
    document.getElementById("add-track-modal").classList.add("hidden");
  });

  // Track theme selection
  const colorButtons = document.querySelectorAll("[data-color]");
  colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove selection from all buttons
      colorButtons.forEach((btn) =>
        btn.classList.remove(
          "border-blue-500",
          "border-red-500",
          "border-green-500",
          "border-yellow-500",
          "border-purple-500",
          "border-orange-500",
        ),
      );

      // Add selection to clicked button
      const color = button.getAttribute("data-color");
      button.classList.add(`border-${color}-500`);

      // Update hidden input
      document.getElementById("track-theme").value = color;
    });
  });

  // Add track form submission
  document
    .getElementById("add-track-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("track-name").value;
      const theme = document.getElementById("track-theme").value;

      try {
        await fetch("/timer/tracks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, theme }),
        });

        // Close modal and reset form
        document.getElementById("add-track-modal").classList.add("hidden");
        document.getElementById("track-name").value = "";

        // Reload tracks
        loadTracks();
      } catch (err) {
        console.error("Error adding track:", err);
      }
    });

  // Toggle graph
  document.getElementById("toggle-graph-btn").addEventListener("click", () => {
    const graphSection = document.getElementById("graph-section");
    const button = document.getElementById("toggle-graph-btn");

    if (graphSection.classList.contains("hidden")) {
      // Show graph
      graphSection.classList.remove("hidden");
      button.textContent = "Hide Graph";

      // Load times for the current track to update the graph
      if (currentTrackId) {
        loadTimes(currentTrackId);
      }
    } else {
      // Hide graph
      graphSection.classList.add("hidden");
      button.textContent = "Show Graph";
    }
  });

  // Initialize
  loadTracks();
});
