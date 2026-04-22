<script>
  import { page } from '$app/stores';

  const links = [
    { href: '/', label: 'Flowchart' },
    { href: '/sequence', label: 'Sequence' },
    { href: '/class', label: 'Class' },
  ];
</script>

<div class="glass-enhanced rounded-2xl p-4 mb-6">
  <div class="flex items-center gap-6 flex-wrap">
    <span class="text-white font-semibold tracking-tight mr-2">
      Architect's <span class="text-amber-300">Studio</span>
    </span>
    <div class="w-px h-5 bg-white/20"></div>
    <div class="flex items-center gap-2 flex-wrap">
      {#each links as { href, label }}
        {@const active = $page.url.pathname === href}
        <a {href} class="px-4 py-2 rounded-lg font-medium transition-all
          {active
            ? 'bg-amber-500/15 border border-amber-400/30 text-amber-200'
            : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'}">
          {label}
        </a>
      {/each}
    </div>
  </div>
</div>
