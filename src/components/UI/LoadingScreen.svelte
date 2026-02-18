<div class="loading_outer">
  <div class="loading_inner">
    <div class="spinner"></div>
  </div>
</div>

<style>
  .loading_outer {
    z-index: 5;
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .loading_inner {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
    flex-direction: row;
    position: relative;
    align-items: center;
    background-color: #ffffff;
  }

  /* Svelte: spinner replaces v-progress-circular */
  .loading_inner .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #4d0000;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
