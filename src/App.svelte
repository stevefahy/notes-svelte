<script lang="ts">
  import Router from "svelte-spa-router";
  import LayoutComponent from "./components/layout/LayoutComponent.svelte";
  import { routes } from "./lib/router";
</script>

<LayoutComponent>
  <Router {routes} />
</LayoutComponent>
