<script lang="ts">
  interface Props {
    label?: string;
    ariaLabel?: string;
    onclick?: (e: MouseEvent) => void;
  }
  let { label = "Add Notebook", ariaLabel, onclick }: Props = $props();
</script>

<button class="fab-btn" type="button" aria-label={ariaLabel} onclick={onclick}>
    <svg class="icon" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m5 11h-4v4h-2v-4H7v-2h4V7h2v4h4z"></path>
    </svg>
    
    {label}
    
    <span class="ripple-container"></span>
  </button>
  
  <style>
    .fab-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-width: 48px;
      height: 48px;
      padding: 0 16px;
      border-radius: 24px; /* Makes it "Extended FAB" like MUI */
      border: none;
      cursor: pointer;
      
      /* Using the theme variable we set up previously */
      background-color: var(--v-theme-secondary, #b30000); 
      color: white;
      font-family: sans-serif;
      font-weight: 500;
      text-transform: uppercase;
      box-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2), 
                  0px 6px 10px 0px rgba(0,0,0,0.14);
      transition: background-color 250ms, box-shadow 250ms;
      position: relative;
      overflow: hidden;
    }
  
    .fab-btn:hover {
      filter: brightness(1.1);
      box-shadow: 0px 5px 8px -3px rgba(0,0,0,0.2);
    }
  
    .icon {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
  </style>