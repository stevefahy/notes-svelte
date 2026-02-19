<script lang="ts">
  let { children } = $props();
  import MainNavigation from "./MainNavigation.svelte";
  import NotificationView from "../UI/NotificationView.svelte";
  import SnackBar from "../UI/SnackBar.svelte";
  import { notificationStore } from "@/stores/notification";
  import { mobileSizeStore } from "@/stores/mobileSize";
  import APPLICATION_CONSTANTS from "@/lib/constants";
  import { onMount, onDestroy } from "svelte";
  import type { NotificationInterface } from "@/lib/types";

  const AC = APPLICATION_CONSTANTS;

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

<MainNavigation />
<main>
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
