(function () {
  const holdTime = 500;
  const boostedSpeed = 2.0;
  const normalSpeed = 1.0;

  function attachListeners(video) {
    if (!video || video.__hasListener) return;
    video.__hasListener = true;

    let holdTimer = null;
    let isBoosted = false;
    let mouseDownTime = 0;

    const boost = (e) => {
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

    video.addEventListener("click", handleClick, true);
  }

  document.querySelectorAll("video").forEach(attachListeners);

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
    attributes: true,
    attributeFilter: ["src"],
  });
})();
