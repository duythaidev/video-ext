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

      // Chỉ reset flag sau khi đã xử lý click
      setTimeout(() => {
        isBoosted = false;
      }, 100);
    };

    // Ngăn chặn play/pause toggle
    const handleClick = (e) => {
      const holdDuration = Date.now() - mouseDownTime;

      // Nếu giữ >= holdTime, ngăn click
      if (holdDuration >= holdTime || isBoosted) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Mouse events
    video.addEventListener("mousedown", boost);
    video.addEventListener("mouseup", reset);
    video.addEventListener("mouseleave", reset);

    // Touch events
    video.addEventListener("touchstart", boost);
    video.addEventListener("touchend", reset);

    // Bắt click ở capture phase
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
