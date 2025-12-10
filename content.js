(function () {
  const holdTime = 500;
  const boostedSpeed = 2.0;
  const normalSpeed = 1.0;

  function attachListeners(video) {
    if (!video || video.__hasListener) return;
    video.__hasListener = true;

    let holdTimer = null;

    const boost = () => {
      holdTimer = setTimeout(() => {
        video.playbackRate = boostedSpeed;
      }, holdTime);
    };

    const reset = () => {
      clearTimeout(holdTimer);
      video.playbackRate = normalSpeed;
    };

    video.addEventListener("mousedown", boost);
    video.addEventListener("mouseup", reset);
    video.addEventListener("mouseleave", reset);

    video.addEventListener("touchstart", boost);
    video.addEventListener("touchend", reset);
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
