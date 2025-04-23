document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landing-page');
    const contentPage = document.getElementById('content-page');
    const fadeElements = document.querySelectorAll('.fade-up');
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const counterElement = document.getElementById('counter');

    // Initialize auto-typing effect
    let typed;
    
    // Track if user has manually set volume
    let userHasSetVolume = false;

    // Call updateViewCount when the page loads
    updateViewCount();

    // Initialize Vimeo player
    const iframe = document.getElementById('background-video');
    const player = new Vimeo.Player(iframe);

    // Set initial volume to 0 due to autoplay restrictions (required by browsers)
    player.setVolume(0);
    
    // Disable autopause to keep playing when tab is not active
    player.setAutopause(false).catch(error => {
        console.error("Error setting autopause:", error);
    });

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
                    // Start from 178 if no record exists
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
                viewCount = 178;
            } else {
                viewCount = parseInt(viewCount) + 1;
            }
            localStorage.setItem('viewCount', viewCount);
            if (counterElement) {
                counterElement.textContent = viewCount;
            }
        };
    }

    // Check if on mobile device
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // If on mobile, make volume slider bigger for touch devices
    if (isMobileDevice()) {
        volumeSlider.classList.add('mobile-friendly');
    }

    // Volume slider functionality
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            userHasSetVolume = true;
            
            // Set volume using Vimeo API
            player.setVolume(value).then(() => {
                // Update icon based on volume level
                if (value == 0) {
                    soundIcon.classList.remove('fa-volume-up');
                    soundIcon.classList.add('fa-volume-mute');
                } else {
                    soundIcon.classList.remove('fa-volume-mute');
                    soundIcon.classList.add('fa-volume-up');
                }
            }).catch(error => {
                console.error("Error setting volume:", error);
            });
        });
    }

    // Sound toggle button functionality
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            player.getVolume().then(volume => {
                if (volume > 0) {
                    // Store the current volume before muting
                    volumeSlider.dataset.previousVolume = volume;
                    player.setVolume(0);
                    volumeSlider.value = 0;
                    soundIcon.classList.remove('fa-volume-up');
                    soundIcon.classList.add('fa-volume-mute');
                } else {
                    // Restore previous volume or set to 0.5
                    const newVolume = volumeSlider.dataset.previousVolume || 0.5;
                    player.setVolume(newVolume);
                    volumeSlider.value = newVolume;
                    soundIcon.classList.remove('fa-volume-mute');
                    soundIcon.classList.add('fa-volume-up');
                }
            });
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

            // Set volume to 0.5 after user interaction ONLY if user hasn't set it manually
            setTimeout(() => {
                if (!userHasSetVolume) {
                    player.setVolume(0.5).then(() => {
                        soundIcon.classList.remove('fa-volume-mute');
                        soundIcon.classList.add('fa-volume-up');
                        volumeSlider.value = 0.5;
                    });
                }
            }, 1000);

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

    // Function to initialize typed.js
    function initTyped() {
        typed = new Typed('#auto-type', {
            strings: [
                "hi i'm dynamo",
                "your plug ",
                "your upgrading services"
            ],
            typeSpeed: 130,
            backSpeed: 130,
            loop: true,
            showCursor: true,
            cursorChar: '|',
            smartBackspace: true,
            startDelay: 500,
            backDelay: 2000,
            preStringTyped: function(arrayPos, self) {
                // Clear the element content before typing the next string
                self.el.innerHTML = '';
            }
        });
    }

    // Handle first user interaction to enable audio with 50% volume
    document.addEventListener('click', function enableAudio() {
        // Only enable if we're past the landing page
        if (!landingPage.classList.contains('hidden')) return;
        
        // Set volume to 0.5 (50%) ONLY if user hasn't set it manually
        if (!userHasSetVolume) {
            player.setVolume(0.5).then(() => {
                soundIcon.classList.remove('fa-volume-mute');
                soundIcon.classList.add('fa-volume-up');
                volumeSlider.value = 0.5;
            });
        }
    });

    // Modified visibilitychange handler to keep playing when tab is not active
    document.addEventListener('visibilitychange', function() {
        // Only handle if we're past the landing page
        if (landingPage.classList.contains('hidden')) {
            if (document.visibilityState === 'visible') {
                // When tab becomes visible again, check if video is playing
                player.getPaused().then(paused => {
                    if (paused) {
                        // Only play if it's paused for some reason
                        player.play().then(() => {
                            // Only restore volume if user hasn't manually set it
                            if (!userHasSetVolume) {
                                const volumeValue = parseFloat(volumeSlider.value) || 0.5;
                                player.setVolume(volumeValue);
                            } else {
                                // If user has set volume, use their setting
                                const volumeValue = parseFloat(volumeSlider.value);
                                player.setVolume(volumeValue);
                            }
                        }).catch(error => {
                            console.error("Error resuming video:", error);
                        });
                    }
                });
            }
            // Don't pause when tab becomes hidden (we removed the pause code)
        }
    });

    // Disable right-click
    document.addEventListener('contextmenu', event => event.preventDefault());

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
    setInterval(detectDebugger, 2000);

    // Additional protection: Detect Firebug
    if (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) {
        document.body.innerHTML = "nuh uh nigga you cannot";
    }

    // Additional protection: Detect if DevTools is already open when page loads
    setTimeout(checkDevTools, 500);

    // Title auto-typing effect
    function titleTypingEffect() {
        const titles = ["@exerlie"];
        let currentIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        function type() {
            const currentTitle = titles[currentIndex];
            
            if (isDeleting) {
                // Deleting text
                charIndex--;
                document.title = currentTitle.substring(0, charIndex) || "@";
            } else {
                // Typing text
                charIndex++;
                document.title = currentTitle.substring(0, charIndex);
            }
            
            // Typing speed
            let typeSpeed = isDeleting ? 150 : 200;
            
            // If complete word
            if (!isDeleting && charIndex >= currentTitle.length) {
                // Pause at end of word
                typeSpeed = 900;
                isDeleting = true;
            } else if (isDeleting && charIndex <= 0) {
                isDeleting = false;
                charIndex = 0;
                // Pause before typing next word
                typeSpeed = 200;
            }
            
            setTimeout(type, typeSpeed);
        }
        
        // Start the typing effect
        type();
    }
    
    // Call the title typing effect
    titleTypingEffect();
});
