export const smoothScrollTo = (y: number, duration: number) => {
  const startY = window.scrollY;
  const distance = y - startY;
  let startTime: number | null = null;

  const step = (currentTime: number) => {
    if (!startTime) {
      startTime = currentTime;
    }
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    window.scrollTo(0, startY + distance * progress);
    if (timeElapsed < duration) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};