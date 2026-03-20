// Wait for the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", function () {
  // Get references to HTML elements we'll need to interact with
  const audioPlayer = document.getElementById("audio-player")
  const playBtn = document.getElementById("play-btn")
  const playIcon = document.getElementById("play-icon")
  const prevBtn = document.getElementById("prev-btn")
  const nextBtn = document.getElementById("next-btn")
  const songProgress = document.getElementById("song-progress")
  const currentTimeDisplay = document.getElementById("current-time")
  const totalTimeDisplay = document.getElementById("total-time")
  const volumeLevel = document.getElementById("volume-level")
  const volumeIcon = document.getElementById("volume-icon")
  const currentSongImage = document.getElementById("current-song-image")
  const currentSongTitle = document.getElementById("current-song-title")
  const currentSongArtist = document.getElementById("current-song-artist")
  const songCards = document.querySelectorAll(".song-card")

  // Keep track of the currently playing song
  let currentSongIndex = -1
  let isPlaying = false

  // Array to store all song data
  const songs = []

  // Collect all song data from the HTML
  songCards.forEach((card, index) => {
    // Extract song data from data attributes
    songs.push({
      element: card,
      src: card.getAttribute("data-song"),
      title: card.getAttribute("data-title"),
      artist: card.getAttribute("data-artist"),
      cover: card.getAttribute("data-cover"),
    })

    // Add click event listener to each song card
    card.addEventListener("click", function () {
      playSong(index)
    })
  })

  // Function to play a specific song
  function playSong(index) {
    // If we're already playing this song, just toggle play/pause
    if (index === currentSongIndex) {
      togglePlayPause()
      return
    }

    // Remove active class from previous song
    if (currentSongIndex !== -1) {
      songs[currentSongIndex].element.classList.remove("active")
    }

    // Update current song index
    currentSongIndex = index

    // Add active class to current song
    songs[currentSongIndex].element.classList.add("active")

    // Update player UI with song info
    currentSongTitle.textContent = songs[currentSongIndex].title
    currentSongArtist.textContent = songs[currentSongIndex].artist
    currentSongImage.src = songs[currentSongIndex].cover

    // Set the audio source and play it
    audioPlayer.src = songs[currentSongIndex].src
    audioPlayer.load()
    audioPlayer
      .play()
      .then(() => {
        // Play was successful
        isPlaying = true
        updatePlayButton()
      })
      .catch((error) => {
        // Play failed - likely due to no audio file
        console.error("Error playing audio:", error)
        // alert("This is a demo - no actual audio file is loaded.");
      })
  }

  // Function to toggle between play and pause
  function togglePlayPause() {
    if (currentSongIndex === -1) {
      // If no song is selected, play the first one
      if (songs.length > 0) {
        playSong(0)
      }
      return
    }

    if (isPlaying) {
      audioPlayer.pause()
    } else {
      audioPlayer.play().catch((error) => {
        console.error("Error playing audio:", error)
      })
    }

    isPlaying = !isPlaying
    updatePlayButton()
  }

  // Update the play/pause button icon
  function updatePlayButton() {
    if (isPlaying) {
      playIcon.classList.remove("fa-play")
      playIcon.classList.add("fa-pause")
    } else {
      playIcon.classList.remove("fa-pause")
      playIcon.classList.add("fa-play")
    }
  }

  // Play the previous song in the list
  function playPreviousSong() {}

  // Play the next song in the list
  function playNextSong() {
    if (currentSongIndex < songs.length - 1) {
      playSong(currentSongIndex + 1)
    } else if (songs.length > 0) {
      // If we're at the end, loop to the beginning
      playSong(0)
    }
  }

  // Update the progress bar as the song plays
  function updateProgress() {
    if (audioPlayer.duration) {
      // Calculate percentage of song played
      const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100
      songProgress.style.width = percentage + "%"

      // Update time displays
      currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime)
      totalTimeDisplay.textContent = formatTime(audioPlayer.duration)
    } else {
      // If no duration available, reset displays
      songProgress.style.width = "0%"
      currentTimeDisplay.textContent = "0:00"
      totalTimeDisplay.textContent = "0:00"
    }
  }

  // Format time in seconds to MM:SS format
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  // Set up click event listeners for controls
  playBtn.addEventListener("click", togglePlayPause)
  prevBtn.addEventListener("click", playPreviousSong)
  nextBtn.addEventListener("click", playNextSong)

  // Set up audio player event listeners
  audioPlayer.addEventListener("timeupdate", updateProgress)
  audioPlayer.addEventListener("ended", playNextSong)

  // Click on progress bar to seek
  document
    .querySelector(".progress-bar")
    .addEventListener("click", function (e) {
      if (audioPlayer.duration) {
        const progressBar = this
        const clickPosition =
          (e.pageX - progressBar.getBoundingClientRect().left) /
          progressBar.offsetWidth
        const seekTime = clickPosition * audioPlayer.duration

        audioPlayer.currentTime = seekTime
        updateProgress()
      }
    })

  // Click on volume bar to change volume
  document.querySelector(".volume-bar").addEventListener("click", function (e) {
    const volumeBar = this
    const clickPosition =
      (e.pageX - volumeBar.getBoundingClientRect().left) / volumeBar.offsetWidth

    // Set volume (0 to 1)
    audioPlayer.volume = clickPosition
    volumeLevel.style.width = clickPosition * 100 + "%"

    // Update volume icon based on level
    updateVolumeIcon(clickPosition)
  })

  // Update volume icon based on volume level
  function updateVolumeIcon(level) {
    volumeIcon.className = "" // Clear existing classes

    if (level === 0) {
      volumeIcon.className = "fas fa-volume-mute"
    } else if (level < 0.5) {
      volumeIcon.className = "fas fa-volume-down"
    } else {
      volumeIcon.className = "fas fa-volume-up"
    }
  }

  // Toggle mute when clicking volume icon
  volumeIcon.addEventListener("click", function () {
    if (audioPlayer.volume > 0) {
      // Store current volume before muting
      audioPlayer.dataset.previousVolume = audioPlayer.volume
      audioPlayer.volume = 0
      volumeLevel.style.width = "0%"
      updateVolumeIcon(0)
    } else {
      // Restore previous volume
      const previousVolume = audioPlayer.dataset.previousVolume || 0.5
      audioPlayer.volume = previousVolume
      volumeLevel.style.width = previousVolume * 100 + "%"
      updateVolumeIcon(previousVolume)
    }
  })

  // Initialize volume display
  volumeLevel.style.width = audioPlayer.volume * 100 + "%"
  updateVolumeIcon(audioPlayer.volume)
})
