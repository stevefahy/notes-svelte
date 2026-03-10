<script lang="ts">
  let { children } = $props();
  import { location } from "svelte-spa-router";
  import MainNavigation from "./MainNavigation.svelte";
  import NotificationView from "../UI/NotificationView.svelte";
  import SnackBar from "../UI/SnackBar.svelte";
  import { notificationStore } from "@/stores/notification";
  import { mobileSizeStore } from "@/stores/mobileSize";
  import APPLICATION_CONSTANTS from "@/lib/constants";
  import { onMount, onDestroy } from "svelte";
  import type { NotificationInterface } from "@/lib/types";

  const AC = APPLICATION_CONSTANTS;
  const isLoginPage = $derived($location === "/login");

  let notificationStatus = $state<"pending" | "success" | "error" | null>(null);
  let notificationData = $state<NotificationInterface | null>(null);

  $effect(() => {
    const state = $notificationStore;
    const n_status = state.notification.n_status;
    if (n_status) {
      notificationStatus = n_status;
      notificationData = state.notification;
      const id = setTimeout(() => {
        notificationStatus = null;
      }, 5000);
      return () => clearTimeout(id);
    }
  });

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

  onMount(() => {
    setTimeout(setScreenHeight, 0);
    resizeHandler = () => {
      setScreenHeight();
      dimensionsChange();
    };
    window.addEventListener("resize", resizeHandler);
    dimensionsChange();
  });

  onDestroy(() => {
    window.removeEventListener("resize", resizeHandler);
  });
</script>

<div class="app-shell">
  {#if !isLoginPage}
    <MainNavigation />
  {/if}
  <main class:login-page={isLoginPage}>
    {@render children?.()}
  </main>
  {#if notificationStatus}
    <div class="notification-wrapper">
      <NotificationView
        n_status={notificationStatus}
        title={notificationData?.title ?? ""}
        message={notificationData?.message ?? ""}
      />
    </div>
  {/if}
  <SnackBar />
</div>

<style>
  main.login-page {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }
</style>
