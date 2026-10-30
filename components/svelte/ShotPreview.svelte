<script>
  import Icon from './Icon.svelte'
  /**
   * @typedef {Object} Props
   * @property {{title:string,direction:string,framing:string}|null} [shot] Active timed shot, before or after rendering.
   * @property {string} [imageUrl] Optional chosen frame.
   * @property {{label:string,text:string}|null} [event] Current playhead event.
   * @property {string} [review] Frame review label.
   */
  /** @type {Props} */
  let {shot=null,imageUrl='',event=null,review=''}=$props()
</script>

{#if shot}
<div class="shot-preview" class:rendered={!!imageUrl} aria-label="Active shot">
  {#if imageUrl}<img class="shot-preview__image" src={imageUrl} alt={shot.title} />{:else}<div class="shot-preview__guide" aria-hidden="true"><span></span><span></span></div>{/if}
  <section class="shot-preview__direction" aria-label="Active shot direction">
    <div class="shot-preview__eyebrow"><Icon name={imageUrl?'image':'film-strip'} /><span>{shot.framing}</span><span>{imageUrl?review||'Frame preview':'Shot plan · no frame yet'}</span></div>
    <h2>{shot.title}</h2>
    {#if !imageUrl}<p title={shot.direction}>{shot.direction}</p>{/if}
  </section>
  {#if event}<section class="shot-preview__event" aria-label="Current story event"><span>{event.label}</span><p>{event.text}</p></section>{/if}
</div>
{:else}<p>Select a shot to preview its direction.</p>{/if}
<style>
  .shot-preview {position:relative;inline-size:100%;block-size:100%;min-block-size:320px;isolation:isolate;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;gap:clamp(18px,4vw,60px);padding:clamp(20px,4vw,54px);box-sizing:border-box;text-align:left}
  .shot-preview__guide {position:absolute;inset:22px;z-index:-1;border:1px solid var(--border-hairline);pointer-events:none}.shot-preview__guide span {position:absolute;inset:0 33.333%;border-inline:1px solid color-mix(in srgb,var(--border-hairline) 45%,transparent)}.shot-preview__guide span+span {inset:33.333% 0;border-inline:0;border-block:1px solid color-mix(in srgb,var(--border-hairline) 45%,transparent)}
  .shot-preview__direction {min-width:0;max-height:100%;overflow:auto;display:flex;flex-direction:column;gap:12px}.shot-preview__eyebrow {display:flex;align-items:center;flex-wrap:wrap;gap:7px;font-size:10px;color:var(--text-secondary)}.shot-preview__eyebrow span:last-child {flex-basis:100%}
  h2 {margin:0;font-size:clamp(18px,2.1vw,30px);font-weight:500;line-height:1.2;text-wrap:balance}p {margin:0;white-space:pre-wrap;font-size:clamp(12px,1.1vw,16px);line-height:1.7;color:var(--text-secondary)}.shot-preview__direction p {display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:9;overflow:hidden}
  .shot-preview__event {min-width:0;max-height:100%;overflow:auto;display:flex;flex-direction:column;gap:12px}.shot-preview__event>span {color:var(--text-secondary);font-size:11px;letter-spacing:.06em;text-transform:uppercase}.shot-preview__event p {color:var(--text-primary);font-size:clamp(16px,1.7vw,25px);line-height:1.5}
  .rendered {display:block;padding:0}.shot-preview__image {position:absolute;width:100%;height:100%;object-fit:contain}.rendered .shot-preview__direction {position:absolute;inset:14px auto auto 16px;max-width:65%;padding:8px 12px;border:1px solid var(--border-hairline);border-radius:var(--radius-sm);background:color-mix(in srgb,var(--surface-base) 64%,transparent);backdrop-filter:blur(16px)}.rendered h2 {font-size:13px}.rendered .shot-preview__eyebrow span:last-child {flex-basis:auto}.rendered .shot-preview__event {position:absolute;inset:auto 64px 18px 18px;max-height:30%;padding:10px 14px;border:1px solid var(--border-hairline);border-radius:var(--radius-sm);background:color-mix(in srgb,var(--surface-base) 64%,transparent);backdrop-filter:blur(16px)}.rendered .shot-preview__event p {font-size:14px;line-height:1.5}
  @media(max-width:620px){.shot-preview:not(.rendered){grid-template-columns:1fr;gap:20px;padding:26px}.shot-preview__direction p{-webkit-line-clamp:4}}
  @container viewport (max-width:620px){.shot-preview:not(.rendered){grid-template-columns:1fr;gap:20px;padding:26px}.shot-preview__direction p{-webkit-line-clamp:4}}
</style>
