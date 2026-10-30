<script>
  import {appearancePalette} from '../lib/appearance-palette.js'
  /** @type {{feature:string,value:string,choices:Record<string,string>}} */
  let {feature,value,choices}=$props()
  const parts=$derived(appearancePalette({...choices,[feature]:value}))
  const bodyPath=$derived(/inverted triangle/i.test(value)?'M14 20H58L44 51H28Z':/triangle|pear/i.test(value)?'M27 20H45L43 34L54 51H18L29 34Z':/hourglass/i.test(value)?'M19 20H53L42 35L53 51H19L30 35Z':/oval|apple/i.test(value)?'M26 20H46C60 30 57 45 47 51H25C15 45 12 30 26 20Z':/trapezoid/i.test(value)?'M18 20H54L47 51H25Z':'M23 20H49L49 51H23Z')
</script>
<!-- These are appearance diagrams, not interface symbols or finished portraits. -->
<svg viewBox="0 0 72 66" aria-hidden="true" focusable="false">
  {#if feature==='body'}
    <circle cx="36" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="1.5" />
    <path d={bodyPath} fill="currentColor" fill-opacity=".2" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M28 52v11m16-11v11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  {:else}
  <path d="M23 63v-9h26v9" fill={parts.color} stroke="currentColor" stroke-width="1.5" />
  {#if feature==='hair'&&/long|shoulder|bob|locs|braids/.test(value)&&!/pulled|bun|cornrows/.test(value)}<path d="M13 25Q10 1 36 3Q63 1 60 28l2 32-15-7H25l-15 7Z" fill={parts.hairColor} />{/if}
  {#if feature==='hair'&&/pulled|bun|ponytail|topknot/.test(value)}<path d="M51 18q20 0 12 19l-5 25-10-8 8-26" fill={parts.hairColor} />{/if}
  <path d="M17 23Q17 6 36 6t19 17v14Q53 56 36 58Q19 56 17 37Z" fill={parts.color} stroke="currentColor" stroke-width="1.5" />
  <path d="M25 32h5m12 0h5M36 34l-2 8h5m-10 6h14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  {#if feature==='hair'&&value&&!/^shaved head$|^none$/.test(value)}
    {#if /mohawk/.test(value)}<path d={/tall/.test(value)?'M29 26V7L32 1H40L43 7V26L36 19Z':'M29 25V14L33 8H39L43 14V25L36 20Z'} fill={parts.hairColor} stroke="currentColor" stroke-width=".7" />
    {:else if /liberty spikes/.test(value)}<path d="M15 28L10 8L25 16L27 0L36 13L45 0L48 16L62 8L57 28L47 20H25Z" fill={parts.hairColor} />
    {:else if /faux hawk/.test(value)}<path d="M17 25V16L28 13L36 3L44 13L55 16V25L43 19H29Z" fill={parts.hairColor} />
    {:else if /high-top fade/.test(value)}<path d="M17 25V5Q36 0 55 5V25L48 19H24Z" fill={parts.hairColor} />
    {:else if /rounded|mane|afro/.test(value)}
      {#each [0,1,2,3,4,5,6] as n (n)}<circle cx={17+n*6.3} cy={16-Math.sin(n/6*Math.PI)*10} r="7" fill={parts.hairColor} stroke="currentColor" stroke-width=".7" />{/each}
    {:else if /fringe/.test(value)}<path d="M14 29V13Q34-2 58 12v16l-10-11-5 12-10-10-8 9-4-10Z" fill={parts.hairColor} />
    {:else if /receding/.test(value)}<path d="M16 35V17Q18 9 28 9l-7 13v12m35 1V17Q54 9 44 9l7 13v12" fill={parts.hairColor} />
    {:else if /asymmetric/.test(value)}<path d="M17 25V14Q36-4 56 10L49 39L42 23L36 15L23 26Z" fill={parts.hairColor} />
    {:else}<path d="M16 28V16Q18 2 36 3t20 13v12l-9-12H25Z" fill={parts.hairColor} />{/if}
    {#if /twist|locs|braid|cornrows|spines|antenna/.test(value)}<path d="M24 8l-6 13M32 6l-7 14M41 6l-7 14M49 9l-6 12M56 25l4 28" fill="none" stroke="currentColor" stroke-width="2" />{/if}
  {/if}
  {#if feature==='facialHair'&&value&&!/clean-shaven/.test(value)}
    {#if /mustache/.test(value)}<path d="M25 43q5-5 11-2 6-3 11 2l-3 4-8-3-8 3Z" fill={parts.hairColor} />
    {:else if /stubble/.test(value)}{#each [0,1,2,3,4,5,6,7] as n (n)}<circle cx={24+n*3.5} cy={48+Math.sin(n/7*Math.PI)*5} r="1" fill={parts.hairColor} />{/each}
    {:else if /goatee|whiskers/.test(value)}<path d="M30 48h12l-2 12h-8Z" fill={parts.hairColor} />
    {:else}<path d={/long/.test(value)?'M18 37l10 10h16l10-10-4 20-14 9-14-9Z':'M18 37l10 10h16l10-10-4 15-14 9-14-9Z'} fill={parts.hairColor} />{/if}
  {/if}
  {/if}
</svg>
<style>svg{display:block;width:56px;height:48px;color:var(--text-secondary);}</style>
