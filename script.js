document.addEventListener('DOMContentLoaded', () => {

const landingPage = document.getElementById('landing-page');
const contentPage = document.getElementById('content-page');
const fadeElements = document.querySelectorAll('.fade-up');
const soundToggle = document.getElementById('sound-toggle');
const soundIcon = document.getElementById('sound-icon');
const volumeSlider = document.getElementById('volume-slider');
const counterElement = document.getElementById('hit-count');

let typed;
let player;
let userHasSetVolume = false;

// Initialize Vimeo player with error handling
function initializePlayer() {
    try {
        const iframe = document.getElementById('background-video');
        if (!iframe) {
            console.error('Video iframe not found');
            return null;
        }
        
        player = new Vimeo.Player(iframe);

        player.setVolume(0).catch(error => {
            console.error("Error setting volume:", error);
        });

        player.element.setAttribute('playsinline', '');
        player.element.setAttribute('webkit-playsinline', '');

        player.setAutopause(false).catch(error => {
            console.error("Error setting autopause:", error);
        });

        player.pause().catch(error => {
            console.error("Error pausing video:", error);
        });
        
        return player;
    } catch (error) {
        console.error("Error initializing player:", error);
        return null;
    }
}

// Function to update view count with error handling
function updateViewCount() {
    try {
        const counterElement = document.getElementById('hit-count');
        
        if (!counterElement) {
            console.error("Counter element not found");
            return;
        }

        counterElement.innerHTML = '';
        
        const viewCounterImg = document.createElement('img');
        viewCounterImg.src = "https://views-counter.vercel.app/badge?pageId=exerlie%2Exyz&leftColor=000000&rightColor=000000&type=total&label=%F0%9F%91%81&style=none";
        viewCounterImg.alt = "views";
        counterElement.appendChild(viewCounterImg);
    } catch (error) {
        console.error("Error updating view count:", error);
    }
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

updateViewCount();
player = initializePlayer();

if (isMobileDevice()) {
    volumeSlider.classList.add('mobile-friendly');
    document.addEventListener('touchstart', function () {
        if (player && landingPage.classList.contains('hidden')) {
            player.play().catch(error => {
                console.error("Error playing video on mobile:", error);
            });
        }
    }, { once: true });
}

if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        if (!player) return;
        
        const value = e.target.value;
        userHasSetVolume = true;

        player.setVolume(value).then(() => {
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

if (soundToggle) {
    soundToggle.addEventListener('click', () => {
        if (!player) return;
        
        player.getVolume().then(volume => {
            if (volume > 0) {
                volumeSlider.dataset.previousVolume = volume;
                player.setVolume(0);
                volumeSlider.value = 0;
                soundIcon.classList.remove('fa-volume-up');
                soundIcon.classList.add('fa-volume-mute');
            } else {
                const newVolume = volumeSlider.dataset.previousVolume || 0.5;
                player.setVolume(newVolume);
                volumeSlider.value = newVolume;
                soundIcon.classList.remove('fa-volume-mute');
                soundIcon.classList.add('fa-volume-up');
            }
        }).catch(error => {
            console.error("Error toggling sound:", error);
        });
    });
}

// Main enter button click handler
landingPage.addEventListener('click', () => {
    console.log('Landing page clicked!');
    
    landingPage.style.opacity = '0';

    setTimeout(() => {
        landingPage.classList.add('hidden');
        contentPage.classList.remove('hidden');
        contentPage.style.opacity = '1';

        document.querySelector('.video-background').classList.add('active');
        
        if (player) {
            // Listen for when video starts playing and remove background
            player.on('play', function() {
                console.log('Video started playing - removing background image');
                document.querySelector('.video-background').classList.add('video-playing');
            });
            
            player.play().then(() => {
                if (!userHasSetVolume) {
                    setTimeout(() => {
                        player.setVolume(0.5).then(() => {
                            soundIcon.classList.remove('fa-volume-mute');
                            soundIcon.classList.add('fa-volume-up');
                            volumeSlider.value = 0.5;
                        }).catch(error => {
                            console.error("Error setting volume:", error);
                        });
                    }, 1000);
                }
            }).catch(error => {
                console.error("Error playing video after landing page:", error);
            });
        }

        fadeElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('active');
                if (index === 1) {
                    setTimeout(() => {
                        initTyped();
                    }, 300);
                }
            }, 300 + (index * 200));
        });
    }, 800);
});

function initTyped() {
    typed = new Typed('#auto-type', {
        strings: [
            "green plug 🔌<img src='green.gif' style='height:1em;vertical-align:middle;'>",
            "hi i'm exerlie <img src='peepo.gif' style='height:1em;vertical-align:middle;'>",
            "your upgrading services"
        ],
        typeSpeed: 135,
        backSpeed: 135,
        loop: true,
        showCursor: true,
        cursorChar: '|',
        smartBackspace: true,
        startDelay: 500,
        backDelay: 2500,
        preStringTyped: function (arrayPos, self) {
            self.el.innerHTML = '';
        }
    });
}

document.addEventListener('click', function enableAudio() {
    if (!landingPage.classList.contains('hidden')) return;
    if (!player) return;

    if (!userHasSetVolume) {
        player.setVolume(0.5).then(() => {
            soundIcon.classList.remove('fa-volume-mute');
            soundIcon.classList.add('fa-volume-up');
            volumeSlider.value = 0.5;
        }).catch(error => {
            console.error("Error setting audio volume:", error);
        });
    }
});

document.addEventListener('visibilitychange', function () {
    if (!player) return;
    
    if (landingPage.classList.contains('hidden')) {
        if (document.visibilityState === 'visible') {
            player.play().then(() => {
                const volumeValue = parseFloat(volumeSlider.value);
                player.setVolume(volumeValue);
            }).catch(error => {
                console.error("Error resuming video:", error);
            });
        }
    }
});

document.addEventListener('contextmenu', event => event.preventDefault());

let devToolsOpen = false;
const threshold = 160;

function checkDevTools() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) return;

    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
            devToolsOpen = true;
            document.body.innerHTML = "nuh uh nigga you cannot";
        }
    } else {
        devToolsOpen = false;
    }
}

function detectConsoleOpen() {
    const element = new Image();
    Object.defineProperty(element, 'id', {
        get: function() {
            if (!devToolsOpen) {
                devToolsOpen = true;
                document.body.innerHTML = "nuh uh nigga you cannot";
            }
        }
    });
    console.log(element);
}

function detectDebugger() {
    const startTime = new Date();
    debugger;
    const endTime = new Date();
    if (endTime - startTime > 100 && !devToolsOpen) {
        devToolsOpen = true;
        document.body.innerHTML = "nuh uh nigga you cannot";
    }
}

const originalClear = console.clear;
console.clear = function () {
    if (!devToolsOpen) {
        devToolsOpen = true;
        document.body.innerHTML = "nuh uh nigga you cannot";
    }
    originalClear.call(console);
};

document.onkeydown = function (e) {
    if (e.keyCode == 123) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
};

setInterval(checkDevTools, 1000);
setInterval(detectDebugger, 2000);
setInterval(detectConsoleOpen, 1000);

if (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) {
    document.body.innerHTML = "nuh uh nigga you cannot";
}

setTimeout(checkDevTools, 500);
setTimeout(detectConsoleOpen, 700);

function titleTypingEffect() {
    const titles = ["@exerlie"];
    let currentIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentTitle = titles[currentIndex];

        if (isDeleting) {
            charIndex--;
            document.title = currentTitle.substring(0, charIndex) || "@";
        } else {
            charIndex++;
            document.title = currentTitle.substring(0, charIndex);
        }

        let typeSpeed = isDeleting ? 150 : 200;

        if (!isDeleting && charIndex >= currentTitle.length) {
            typeSpeed = 900;
            isDeleting = true;
        } else if (isDeleting && charIndex <= 0) {
            isDeleting = false;
            charIndex = 0;
            typeSpeed = 200;
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

titleTypingEffect();

});




