(function () {
  // Tìm video đầu tiên
  const video = document.querySelectorAll("video");
  if (!video) return;

  const holdTime = 500;
  let holdTimer = null;
  const boostedSpeed = 2.0; // Tốc độ khi tăng
  const normalSpeed = 1.0; // Tốc độ bình thường

  video.addEventListener("mousedown", () => {
    holdTimer = setTimeout(() => {
      video.playbackRate = boostedSpeed;
    }, holdTime);
  });

  video.addEventListener("mouseup", () => {
    clearTimeout(holdTimer);
    video.playbackRate = normalSpeed;
  });

  video.addEventListener("mouseleave", () => {
    clearTimeout(holdTimer);
    video.playbackRate = normalSpeed;
  });

  video.addEventListener("touchstart", () => {
    holdTimer = setTimeout(() => {
      video.playbackRate = boostedSpeed;
    }, holdTime);
  });

  video.addEventListener("touchend", () => {
    clearTimeout(holdTimer);
    video.playbackRate = normalSpeed;
  });
})();
