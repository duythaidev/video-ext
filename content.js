(function () {
  const holdTime = 500;
  const boostedSpeed = 2.0;
  const normalSpeed = 1.0;

  let lastActiveVideo = null;

  let altHoldTimer = null;
  let altBoosted = false;

  function toggleFullscreen(video) {
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen?.();
    }
  }

  function getActiveVideo() {
    return (
      lastActiveVideo ||
      [...document.querySelectorAll("video")].find((v) => !v.paused)
    );
  }

  function boostVideo(video) {
    if (!video) return;
    video.playbackRate = boostedSpeed;
  }

  function resetVideo(video) {
    if (!video) return;
    video.playbackRate = normalSpeed;
  }

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
        boostVideo(video);
      }, holdTime);
    };

    const reset = () => {
      clearTimeout(holdTimer);
      resetVideo(video);

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

  // Attach existing videos
  document.querySelectorAll("video").forEach(attachListeners);

  // Observe new videos
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

  // Fullscreen with "f"
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "f") return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    toggleFullscreen(getActiveVideo());
  });

  // Speed x2 with "Alt"
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Alt" || altHoldTimer || altBoosted) return;

    altHoldTimer = setTimeout(() => {
      altBoosted = true;
      boostVideo(getActiveVideo());
    }, holdTime);
  });

  document.addEventListener("keyup", (e) => {
    if (e.key !== "Alt") return;

    clearTimeout(altHoldTimer);
    altHoldTimer = null;

    if (altBoosted) {
      resetVideo(getActiveVideo());
      altBoosted = false;
    }
  });
})();
