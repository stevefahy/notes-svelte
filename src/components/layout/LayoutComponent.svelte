<script lang="ts">
  let { children } = $props();
  import { get } from "svelte/store";
  import { location } from "svelte-spa-router";
  import { push } from "@/lib/router";
  import { confirmNavigateAwayStore } from "@/lib/router";
  import MainNavigation from "./MainNavigation.svelte";
  import SnackBar from "../UI/SnackBar.svelte";
  import { mobileSizeStore } from "@/stores/mobileSize";
  import APPLICATION_CONSTANTS from "@/lib/constants";
  import { onMount, onDestroy } from "svelte";

  const AC = APPLICATION_CONSTANTS;
  const NOTE_ROUTE = /^\/notebook\/[^/]+\/[^/]+$/;
  const isLoginPage = $derived($location === "/login");

  const setScreenHeight = () => {
    const jsvh = window?.innerHeight;
    const headerEl = document.getElementById("header_height");
    const headerHeight = headerEl?.getBoundingClientRect().height ?? 0;
    document.documentElement.style.setProperty("--jsvh", `${jsvh}px`);
    document.documentElement.style.setProperty(
      "--jsheader-height",
      `${headerHeight}`,
    );
  };

  $effect(() => {
    const loc = $location;
    if (loc !== "/login") {
      setTimeout(setScreenHeight, 0);
    }
  });

  const dimensionsChange = () => {
    const width = window?.innerWidth ?? 0;
    mobileSizeStore.set(width < AC.MOBILE_LAYOUT_WIDTH ? "small" : "default");
  };

  let resizeHandler: () => void;

  const handleLinkClick = async (e: MouseEvent) => {
    const anchor = (e.target as HTMLElement).closest?.("a[href]");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || (!href.startsWith("/") && !href.startsWith("#/"))) return;
    const path = href.replace(/^#/, "") || "/";
    const currentLoc = get(location);
    if (!currentLoc?.match(NOTE_ROUTE)) return;
    if (path === currentLoc) return;
    const fn = get(confirmNavigateAwayStore);
    if (!fn) return;
    e.preventDefault();
    e.stopPropagation();
    await fn();
    push(path);
  };

  onMount(() => {
    setTimeout(setScreenHeight, 0);
    resizeHandler = () => {
      setScreenHeight();
      dimensionsChange();
    };
    window.addEventListener("resize", resizeHandler);
    window.addEventListener("click", handleLinkClick, { capture: true });
    dimensionsChange();
  });

  onDestroy(() => {
    window.removeEventListener("resize", resizeHandler);
    window.removeEventListener("click", handleLinkClick, { capture: true });
  });
</script>

<div class="app-shell">
  {#if !isLoginPage}
    <MainNavigation />
  {/if}
  <main class:login-page={isLoginPage}>
    {@render children?.()}
  </main>
  <SnackBar />
</div>

<style>
  main.login-page {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }
</style>
