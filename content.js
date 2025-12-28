(function () {
  const holdTime = 500;
  const boostedSpeed = 2.0;
  const normalSpeed = 1.0;

  let lastActiveVideo = null;
  let hotkey = "Alt"; 

  let keyHoldTimer = null;
  let keyBoosted = false;

  chrome.storage.sync.get({ hotkey: "Alt" }, (data) => {
    hotkey = data.hotkey;
    console.log("[Boost] Loaded hotkey:", hotkey);
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.hotkey) {
      hotkey = changes.hotkey.newValue;
      console.log("[Boost] Hotkey updated:", hotkey);
    }
  });

  function getActiveVideo() {
    return (
      lastActiveVideo ||
      [...document.querySelectorAll("video")].find((v) => !v.paused)
    );
  }

  function boostVideo(v) {
    if (v) v.playbackRate = boostedSpeed;
  }

  function resetVideo(v) {
    if (v) v.playbackRate = normalSpeed;
  }

  // FULLSCREEN
  function toggleFullscreen(video) {
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen?.();
    }
  }

  // CLICK & HOLD SPEED
  function attachListeners(video) {
    if (!video || video.__hasListener) return;
    video.__hasListener = true;

    let holdTimer = null;
    let isBoosted = false;
    let mouseDownTime = 0;

    const boost = () => {
      lastActiveVideo = video;
      mouseDownTime = Date.now();

      holdTimer = setTimeout(() => {
        isBoosted = true;
        video.playbackRate = boostedSpeed;
      }, holdTime);
    };

    const reset = () => {
      clearTimeout(holdTimer);
      video.playbackRate = normalSpeed;

      setTimeout(() => {
        isBoosted = false;
      }, 100);
    };

    const handleClick = (e) => {
      const holdDuration = Date.now() - mouseDownTime;

      if (holdDuration >= holdTime || isBoosted) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    video.addEventListener("mousedown", boost);
    video.addEventListener("mouseup", reset);
    video.addEventListener("mouseleave", reset);

    video.addEventListener("touchstart", boost);
    video.addEventListener("touchend", reset);

    video.addEventListener("mouseenter", () => {
      lastActiveVideo = video;
    });

    video.addEventListener("click", handleClick, true);
  }

  // attach existing videos
  document.querySelectorAll("video").forEach(attachListeners);

  // observe new videos
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === "VIDEO") {
          attachListeners(node);
        }
        if (node.querySelectorAll) {
          node.querySelectorAll("video").forEach(attachListeners);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // FULLSCREEN KEY = "f"
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "f") return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    toggleFullscreen(getActiveVideo());
  });

  // BOOST BY HOTKEY
  document.addEventListener("keydown", (e) => {
    if (e.key !== hotkey || keyHoldTimer || keyBoosted) return;

    keyHoldTimer = setTimeout(() => {
      keyBoosted = true;
      boostVideo(getActiveVideo());
    }, holdTime);
  });

  document.addEventListener("keyup", (e) => {
    if (e.key !== hotkey) return;

    clearTimeout(keyHoldTimer);
    keyHoldTimer = null;

    if (keyBoosted) {
      resetVideo(getActiveVideo());
      keyBoosted = false;
    }
  });
})();
