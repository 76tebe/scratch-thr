<script lang="ts">
  import { onMount } from 'svelte'
  import { createWebHaptics } from 'web-haptics/svelte'

  interface Props {
    width?: number
    height?: number
    minScratchPercentage?: number
    onComplete?: () => void
    onScratch?: () => void
    children?: import('svelte').Snippet
  }

  let {
    width = 300,
    height = 300,
    minScratchPercentage = 55,
    onComplete,
    onScratch,
    children,
  }: Props = $props()

  let canvasEl: HTMLCanvasElement
  let isScratching = false
  let isComplete = false
  let ctx: CanvasRenderingContext2D | null = null

  let sweepX = $state(110)
  let sweepFrame: number
  let sweepPauseTimer: ReturnType<typeof setTimeout> | null = null
  let isSweeping = false

  function runSweep() {
    if (isSweeping) {
      sweepX -= 2.8
      if (sweepX < -120) {
        isSweeping = false
        sweepX = 110
        sweepPauseTimer = setTimeout(() => {
          isSweeping = true
          runSweep()
        }, 2400)
        return
      }
      sweepFrame = requestAnimationFrame(runSweep)
    }
  }

  const haptic = createWebHaptics()
  let lastHapticMs = 0
  let lastCheckMs = 0

  function getPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = canvasEl.getBoundingClientRect()
    const scaleX = canvasEl.width / rect.width
    const scaleY = canvasEl.height / rect.height
    if (e instanceof TouchEvent && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    const me = e as MouseEvent
    return {
      x: (me.clientX - rect.left) * scaleX,
      y: (me.clientY - rect.top) * scaleY,
    }
  }

  function eraseAt(x: number, y: number) {
    if (!ctx || isComplete) return
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 28, 0, Math.PI * 2)
    ctx.fill()

    // Throttled haptic + callback
    const now = Date.now()
    if (now - lastHapticMs > 80) {
      lastHapticMs = now
      haptic.trigger('selection')
      onScratch?.()
    }

    if (now - lastCheckMs > 150) {
      lastCheckMs = now
      checkCompletion()
    }
  }

  function checkCompletion() {
    if (!ctx || isComplete) return
    const { data } = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height)
    let transparent = 0
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) transparent++
    }
    if ((transparent / (data.length / 4)) * 100 >= minScratchPercentage) {
      isComplete = true
      cancelAnimationFrame(sweepFrame)
      if (sweepPauseTimer) clearTimeout(sweepPauseTimer)

      requestAnimationFrame(() => {
        ctx!.clearRect(0, 0, canvasEl.width, canvasEl.height)
        onComplete?.()
      })
    }
  }

  function drawOverlay() {
    if (!ctx) return
    ctx.globalCompositeOperation = 'source-over'

    const w = canvasEl.width
    const h = canvasEl.height

    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0.00, '#BFC1C7')
    grad.addColorStop(0.5, '#F5F6F7')
    grad.addColorStop(1.00, '#BFC1C7')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Subtle cross-hatch texture
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 0.5
    for (let x = 0; x < w; x += 8) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = 0; y < h; y += 8) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }

    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(0,0,0,0.24)'
    ctx.fillText('Gosok disini', w / 2, h / 2)
  }

  onMount(() => {
    ctx = canvasEl.getContext('2d', { willReadFrequently: true })!
    drawOverlay()
    sweepPauseTimer = setTimeout(() => {
      isSweeping = true
      runSweep()
    }, 800)
    return () => {
      cancelAnimationFrame(sweepFrame)
      if (sweepPauseTimer) clearTimeout(sweepPauseTimer)
      haptic.destroy()
    }
  })

  function onMouseDown(e: MouseEvent)  { isScratching = true;  const p = getPos(e); eraseAt(p.x, p.y) }
  function onMouseMove(e: MouseEvent)  { if (!isScratching) return; const p = getPos(e); eraseAt(p.x, p.y) }
  function onMouseUp()                 { isScratching = false }
  function onTouchStart(e: TouchEvent) { e.preventDefault(); isScratching = true;  const p = getPos(e); eraseAt(p.x, p.y) }
  function onTouchMove(e: TouchEvent)  { e.preventDefault(); if (!isScratching) return; const p = getPos(e); eraseAt(p.x, p.y) }
  function onTouchEnd()                { isScratching = false }
</script>

<div
  class="relative select-none"
  style="width:{width}px; height:{height}px; cursor: crosshair;"
>
  <div class="absolute inset-0 flex items-center justify-center rounded-xl overflow-hidden">
    {@render children?.()}
  </div>
  <div
    class="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
    style="opacity: {isComplete ? 0 : 1}; transition: opacity 0.4s ease; z-index: 2;"
  >
    <div
      class="absolute inset-0"
      style="
        background: linear-gradient(
          -45deg,
          transparent            calc({sweepX}% +  0%),
          rgba(255,255,255,0.45) calc({sweepX}% + 10%),
          rgba(255,255,255,0.85) calc({sweepX}% + 15%),
          rgba(255,255,255,0.45) calc({sweepX}% + 20%),
          transparent            calc({sweepX}% + 30%)
        );
        mix-blend-mode: screen;
      "
    ></div>
  </div>

  <canvas
    bind:this={canvasEl}
    {width}
    {height}
    class="absolute inset-0 rounded-xl touch-none"
    style="opacity: {isComplete ? 0 : 1}; transition: opacity 0.4s ease; z-index: 1;"
    onmousedown={onMouseDown}
    onmousemove={onMouseMove}
    onmouseup={onMouseUp}
    onmouseleave={onMouseUp}
    ontouchstart={onTouchStart}
    ontouchmove={onTouchMove}
    ontouchend={onTouchEnd}
  ></canvas>
</div>