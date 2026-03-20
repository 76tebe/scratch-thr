<script lang="ts">
  import { onMount } from "svelte";
  import confetti from "canvas-confetti";

  const duration = 5 * 1000;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  onMount(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const initTimer = setTimeout(() => {
      const animationEnd = Date.now() + duration;

      interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval!);
          interval = null;
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }, 0);

    return () => {
      clearTimeout(initTimer)
      if (interval !== null) {
        clearInterval(interval)
        interval = null
      }
    }
  });
</script>
