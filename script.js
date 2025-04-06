document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landing-page');
    const contentPage = document.getElementById('content-page');
    const fadeElements = document.querySelectorAll('.fade-up');
    const video = document.getElementById('background-video');
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    const counterElement = document.getElementById('counter');

    // Initialize auto-typing effect
    let typed;

    // Call updateViewCount when the page loads
    updateViewCount();

    // Function to update view count
    function updateViewCount() {
        // Open IndexedDB database
        const request = indexedDB.open('ViewCounterDB', 1);

        // Create object store if needed
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('viewCount')) {
                db.createObjectStore('viewCount', { keyPath: 'id' });
            }
        };

        // Handle database open success
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['viewCount'], 'readwrite');
            const store = transaction.objectStore('viewCount');

            // Get current count
            const getRequest = store.get(1);

            getRequest.onsuccess = function(event) {
                let count;
                if (event.target.result) {
                    // Increment existing count
                    count = event.target.result.count + 1;
                } else {
                    // Start from 1 if no record exists
                    count = 178;
                }
                
                // Update count in database
                store.put({ id: 1, count: count });
                
                // Update display
                if (counterElement) {
                    counterElement.textContent = count;
                }
            };
        };

        // Handle errors
        request.onerror = function(event) {
            console.error("Database error:", event.target.error);
            // Fallback to localStorage
            let viewCount = localStorage.getItem('viewCount');
            if (!viewCount) {
                viewCount = 1;
            } else {
                viewCount = parseInt(viewCount) + 1;
            }
            
            localStorage.setItem('viewCount', viewCount);
            if (counterElement) {
                counterElement.textContent = viewCount;
            }
        };
    }

    // Sound toggle button functionality (optional, for muting)
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            const iframe = document.getElementById('background-video');
            const player = new Vimeo.Player(iframe);
            
            if (soundIcon.classList.contains('fa-volume-up')) {
                player.setVolume(0);
                soundIcon.classList.remove('fa-volume-up');
                soundIcon.classList.add('fa-volume-mute');
            } else {
                player.setVolume(1);
                soundIcon.classList.remove('fa-volume-mute');
                soundIcon.classList.add('fa-volume-up');
            }
        });
    }

    // Main enter button click handler
    landingPage.addEventListener('click', () => {
    // Start transition
    landingPage.style.opacity = '0';
    
    // After fade out, hide landing page and show content
    setTimeout(() => {
        landingPage.classList.add('hidden');
        contentPage.classList.remove('hidden');
        contentPage.style.opacity = '1';
        
        // Unmute the Vimeo video
        const iframe = document.getElementById('background-video');
        const player = new Vimeo.Player(iframe);
        player.setVolume(1);
        player.setMuted(false);
        
        // Activate fade-up elements with delay
        fadeElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('active');
                // Start typing effect after the h2 element fades in
                if (index === 1) {
                    setTimeout(() => {
                        initTyped();
                    }, 300);
                }
            }, 300 + (index * 200));
        });
    }, 800);
});

    // Function to play video with sound after user interaction
    function playVideoWithSound() {
        // First play the video while muted (this will work in all browsers)
        video.play().then(() => {
            // After successful play, unmute the video
            // This works because we now have user interaction
            video.muted = false;
            // Update the icon to show sound is on
            soundIcon.classList.remove('fa-volume-mute');
            soundIcon.classList.add('fa-volume-up');
        }).catch(error => {
            console.error("Video play failed:", error);
            // If video play fails, try a different approach
            video.muted = true; // Ensure muted
            video.play(); // Try again with muted
            
            // Create a one-time click handler for the whole page
            const enableAudio = () => {
                video.muted = false;
                soundIcon.classList.remove('fa-volume-mute');
                soundIcon.classList.add('fa-volume-up');
                document.removeEventListener('click', enableAudio);
            };
            document.addEventListener('click', enableAudio);
            alert("Click anywhere on the page to enable sound");
        });
    }

    // Function to initialize Typed.js
    function initTyped() {
        typed = new Typed('#auto-type', {
            strings: ["hi i'm dynamo", "your plug 🌿", "your upgrading services"],
            typeSpeed: 130,
            backSpeed: 130,
            loop: true,
            showCursor: false,
            smartBackspace: true,
            startDelay: 500,
            backDelay: 2000,
            preStringTyped: function(arrayPos, self) {
                // Clear the element content before typing the next string
                self.el.innerHTML = '';
            }
        });
    }

    // Add this to ensure video stops when browser is minimized
    document.addEventListener('visibilitychange', function() {
        // Only pause on mobile devices
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            const iframe = document.getElementById('background-video');
            const player = new Vimeo.Player(iframe);
            if (document.hidden) {
                player.pause();
            }
        }
        // Desktop browsers will continue playing
    });

// Disable right-click
document.addEventListener('contextmenu', event => event.preventDefault());

// Disable keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Prevent F12
  if (e.key == 'F12' || e.keyCode == 123) {
    e.preventDefault();
    return false;
  }
  
  // Prevent Ctrl+U (View Source)
  if (e.ctrlKey && e.key == 'u') {
    e.preventDefault();
    return false;
  }
  
  // Prevent Ctrl+Shift+I (Developer Tools)
  if (e.ctrlKey && e.shiftKey && (e.key == 'I' || e.key == 'i')) {
    e.preventDefault();
    return false;
  }
});

// Detect DevTools opening - multiple detection methods
let devToolsOpen = false;
const threshold = 160;

// Method 1: Window size difference detection
function checkDevTools() {
  // First check if this is a mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Skip this detection method on mobile devices
  if (isMobile) return;
  
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  if (widthThreshold || heightThreshold) {
    if (!devToolsOpen) {
      devToolsOpen = true;
      // Take action when DevTools opens
      document.body.innerHTML = "nuh uh nigga you cannot";
    }
  } else {
    devToolsOpen = false;
  }
}


// Method 3: debugger detection
function detectDebugger() {
  const startTime = new Date();
  debugger;
  const endTime = new Date();
  
  if (endTime - startTime > 100 && !devToolsOpen) {
    devToolsOpen = true;
    document.body.innerHTML = "nuh uh nigga you cannot";
  }
}

// Method 4: console.clear detection
const originalClear = console.clear;
console.clear = function() {
  if (!devToolsOpen) {
    devToolsOpen = true;
    document.body.innerHTML = "nuh uh nigga you cannot";
  }
  originalClear.call(console);
};

// Run all detection methods periodically
setInterval(checkDevTools, 1000);
setInterval(checkConsoleOpen, 100);
setInterval(detectDebugger, 2000);

// Additional protection: Detect Firebug
if (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) {
  document.body.innerHTML = "nuh uh nigga you cannot";
}

// Additional protection: Detect if DevTools is already open when page loads
setTimeout(checkDevTools, 500);
setInterval(checkDevTools, 1000);

    document.addEventListener('contextmenu', event => event.preventDefault());

    document.addEventListener('DOMContentLoaded', () => {
        const video = document.getElementById('background-video');
        
        // Force playsinline for iOS
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        
        // Make sure video doesn't take over on iOS
        video.addEventListener('play', function() {
            // This helps prevent fullscreen takeover on some iOS versions
            video.setAttribute('controls', false);
        });
    });

    // Handle video background loading
    if (video) {
        video.addEventListener('loadeddata', () => {
            console.log('Video loaded successfully');
        });
        video.addEventListener('error', (e) => {
            console.error("Error loading video:", e);
            // Fallback to a static background if video fails to load
            document.querySelector('.video-background').style.backgroundColor = '#000';
        });
    }
});
