<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index";
  import ScratchToReveal from "./lib/components/ScratchToReveal.svelte";
  import Confetti from "./lib/components/Confetti.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { LightRays } from "$lib/components/magic/light-rays";
  import { createWebHaptics } from "web-haptics/svelte";
  import { HugeiconsIcon } from "@hugeicons/svelte";
  import { Settings03Icon } from "@hugeicons/core-free-icons";
  import { Cancel01Icon } from "@hugeicons/core-free-icons";
  import { ReloadIcon } from "@hugeicons/core-free-icons";
  import opor from "./assets/opor-8-bit.png";
  import ketupat from "./assets/ketupat-8-bit.png";
  import givingMoney from "./assets/giving-money-8-bit.png";
  import backgroundOrnamentGreen from "./assets/gradient-ornament-green.svg";
  import backgroundOrnamentGold from "./assets/gradient-ornament-gold.svg";

  const haptic = createWebHaptics();

  // Settings state
  let amounts = $state<number[]>([5000, 10000, 20000, 50000]);
  let greetingInput = $state("THR untuk kamu!");
  let amountInput = $state("");
  let amountError = $state("");
  let drawerOpen = $state(false);

  // Card state
  let reward = $state(pickReward());
  let revealed = $state(false);
  let showConfetti = $state(false);
  let isShaking = $state(false);
  let cardKey = $state(0);

  function pickReward(): number {
    if (amounts.length === 0) return 0;
    return amounts[Math.floor(Math.random() * amounts.length)];
  }

  function formatIDR(val: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  }

  // Settings actions
  function addAmount() {
    const val = parseInt(amountInput.replace(/\D/g, ""));
    if (!val || val <= 0) {
      amountError = "Masukkan nominal yang valid.";
      haptic.trigger("error");
      return;
    }
    if (amounts.includes(val)) {
      amountError = "Oops, nominal itu udah ada.";
      haptic.trigger("error");
      return;
    }
    amounts = [...amounts, val].sort((a, b) => a - b);
    amountInput = "";
    amountError = "";
    haptic.trigger("success");
  }

  function removeAmount(a: number) {
    amounts = amounts.filter((x) => x !== a);
    haptic.trigger("light");
  }

  function handleAmountKey(e: KeyboardEvent) {
    if (e.key === "Enter") addAmount();
  }

  function openSettings() {
    haptic.trigger("light");
    drawerOpen = true;
  }

  function saveAndClose() {
    haptic.trigger("success");
    drawerOpen = false;
    setTimeout(resetCard, 300);
  }

  function resetCard() {
    revealed = false;
    showConfetti = false;
    isShaking = false;
    reward = pickReward();
    cardKey += 1;
  }

  function onScratchComplete() {
    revealed = true;
    showConfetti = true;

    isShaking = true;
    haptic.trigger("heavy");
    const burstTimes = [120, 240, 360, 480, 600, 720, 840, 960];
    burstTimes.forEach((ms) => setTimeout(() => haptic.trigger("heavy"), ms));
    setTimeout(() => {
      isShaking = false;
    }, 1050);
    setTimeout(() => (showConfetti = false), 4200);
  }
</script>

<div
  class="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
>
  <Button
    variant="ghost"
    size="icon"
    onclick={openSettings}
    aria-label="Open settings"
    class="absolute top-3 right-3 z-10"
  >
    <HugeiconsIcon
      icon={Settings03Icon}
      size={20}
      strokeWidth={1.5}
      class="size-5"
    />
  </Button>

  {#if showConfetti}
    <Confetti />
  {/if}

  <div
    class="w-fit sm:max-w-2xl flex max-sm:flex-col gap-10 sm:gap-16 p-6 sm:p-10 sm:items-center justify-between rounded-4xl bg-white border-3 border-white relative overflow-hidden {isShaking
      ? 'animate-shake'
      : ''}"
      style="corner-shape: superellipse(-1)"
  >
    <img
      src={backgroundOrnamentGreen}
      alt="Background ornament"
      class="absolute -top-39 sm:-top-[255px] sm:-left-[187px] left-1/2 max-sm:-translate-x-1/2"
    />
    <img
      src={backgroundOrnamentGold}
      alt="Background ornament"
      class="absolute -bottom-39 sm:-bottom-64 sm:-right-[187px] left-1/2 max-sm:-translate-x-1/2"
    />
    <div class="flex flex-col max-sm:items-center max-sm:text-center">
      <img
        src={givingMoney}
        alt="Giving money pixel art"
        class="size-36 animate-float"
      />
      <div class="flex flex-col gap-2">
        <h1 class="text-4xl font-display font-bold bg-linear-to-br">
          {greetingInput}
        </h1>
        <p class="text-sm text-muted-foreground">Selamat hari raya Idul Fitri 1447 H</p>
      </div>
    </div>

    <!-- Scratch Card -->
    <div class="relative">
      {#if revealed}
        <div
          class="absolute inset-0 rounded-2xl animate-pulse-ring pointer-events-none"
          style="border: 2px solid rgba(251,191,36,0.6); z-index: -1;"
        ></div>
      {/if}

      {#key cardKey}
        <ScratchToReveal
          width={300}
          height={300}
          minScratchPercentage={55}
          onComplete={onScratchComplete}
        >
          <!-- Revealed reward content -->
          <div
            class="w-full h-full flex flex-col gap-3 items-center justify-center rounded-xl relative"
            style="background: linear-gradient(135deg, #F1FDE8 0%, #EDFDED 50%, #EAFDE8 100%);"
          >
            <div class="flex text-center">
              <div
                class="absolute inset-4 rounded-lg pointer-events-none"
                style="border: 1.5px solid rgba(251,191,36,0.3);"
              ></div>
              <div class="text-2xl">💰
                <span class="text-4xl -mx-2">💰</span>
                💰
              </div>
            </div>
            <p
              class="font-bold leading-tight text-center px-4 shimmer-text"
              style="font-family: var(--font-display); font-size: 2.4rem;"
            >
              {formatIDR(reward)}
            </p>
          </div>
        </ScratchToReveal>
      {/key}
    </div>
  </div>
  <!-- Post-reveal -->
  {#if revealed}
    <div
      class="flex flex-col items-center gap-2 mt-6 text-center animate-pop-in"
    >
      <p class="text-lg font-semibold">Yuuuhuuuuuu!</p>
      <p class="text-sm text-muted-foreground">
        Semoga berkah dan menambah kebahagiaan di Hari Raya ✨
      </p>
      <Button variant="outline" onclick={resetCard} class="mt-6 w-fit">
        <HugeiconsIcon icon={ReloadIcon} size={40} strokeWidth={1.5} />
        Buat Baru
      </Button>
    </div>
  {/if}

  <p class="flex gap-1 absolute bottom-4 text-primary/40 text-xs">
    made while eating opor <img src={opor} alt="Opor pixel art" class="size-4" /> ayam ©
    2026
  </p>
  <LightRays color="rgba(173, 232, 176, 0.8)" class="-z-1" />
  <LightRays color="rgba(232, 226, 173, 0.8)" class="-z-1 rotate-180"/>
</div>

<Drawer.Root bind:open={drawerOpen} shouldScaleBackground>
  <Drawer.Portal>
    <Drawer.Content>
      <div class="mx-auto w-full max-w-sm">
        <Drawer.Header>
          <Drawer.Title>Settings</Drawer.Title>
          <Drawer.Description
            >Customize your Eid scratch card</Drawer.Description
          >
        </Drawer.Header>
        <div class="flex flex-col gap-6 p-4">
          <div class="flex flex-col gap-2">
            <Label>Ucapan</Label>
            <Input bind:value={greetingInput} placeholder="Eid Mubarak!" />
          </div>

          <!-- Reward pool -->
          <div class="flex flex-col gap-2">
            <Label>Pool THR (IDR)</Label>

            <div class="flex gap-2">
              <Input
                bind:value={amountInput}
                onkeydown={handleAmountKey}
                placeholder="e.g. 25000"
                type="text"
                inputmode="numeric"
              />
              <Button onclick={addAmount} variant="outline" size="lg"
                >+ Tambah</Button
              >
            </div>

            {#if amountError}
              <p class="text-red-700 text-xs flex items-center gap-1">
                {amountError}
              </p>
            {/if}

            <!-- Amount chips -->
            <div class="flex flex-wrap gap-2 pt-1">
              {#each amounts as a (a)}
                <button
                  onclick={() => removeAmount(a)}
                  class="transition-colors cursor-pointer"
                  aria-label="Remove {formatIDR(a)}"
                >
                  <div
                    class="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold bg-secondary"
                  >
                    {formatIDR(a)}
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={16}
                      strokeWidth={1.5}
                    />
                  </div>
                </button>
              {/each}
              {#if amounts.length === 0}
                <p class="text-red-700 text-xs italic">Belum ada nominal.</p>
              {/if}
            </div>
          </div>
          <Button size="lg" onclick={saveAndClose}>Simpan</Button>
        </div>
      </div>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>
