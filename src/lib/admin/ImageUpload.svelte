<script lang="ts">
  let { currentImages = [], onChange = (_files: File[]) => {}, max = 5 }: {
    currentImages?: string[];
    onChange?: (files: File[]) => void;
    max?: number;
  } = $props();

  let dragOver = $state(false);
  let previewUrls = $state<string[]>([]);
  let inputEl: HTMLInputElement | undefined = $state();

  function handleFiles(rawFiles: FileList | null) {
    if (!rawFiles) return;
    const incoming = Array.from(rawFiles).slice(0, max - currentImages.length);
    previewUrls = incoming.map((f) => URL.createObjectURL(f));
    onChange(incoming);
  }

  function dropHandler(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    handleFiles(e.dataTransfer?.files ?? null);
  }

  function removePreview(index: number) {
    const updated = [...previewUrls];
    updated.splice(index, 1);
    previewUrls = updated;
    onChange([]);
  }
</script>

<div class="flex flex-col gap-3">
  {#if currentImages.length > 0 || previewUrls.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each currentImages as url}
        <div class="relative w-20 h-20 rounded-lg overflow-hidden bg-[#2d2d2f] border border-[#424245]">
          <img src={url} alt="" class="w-full h-full object-cover" />
        </div>
      {/each}
      {#each previewUrls as url, i}
        <div class="relative w-20 h-20 rounded-lg overflow-hidden bg-[#2d2d2f] border border-[#424245]">
          <img src={url} alt="" class="w-full h-full object-cover" />
          <button
            class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-black/90"
            onclick={() => removePreview(i)}
          >
            x
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="relative border-2 border-dashed border-[#424245] rounded-xl px-4 py-6 text-center hover:border-[#86868b] transition-colors cursor-pointer {dragOver ? 'border-[#2997ff] bg-[#2997ff]/5' : ''}"
    onclick={() => inputEl?.click()}
    ondragover={(e) => { e.preventDefault(); dragOver = true; }}
    ondragleave={() => { dragOver = false; }}
    ondrop={dropHandler}
    role="button"
    tabindex="0"
  >
    <p class="text-sm text-[#86868b]">Drop images here or click to browse</p>
    <p class="text-xs text-[#86868b]/60 mt-1">{currentImages.length}/{max} images</p>
  </div>

  <input
    type="file"
    accept="image/*"
    multiple
    class="hidden"
    bind:this={inputEl}
    onchange={(e) => handleFiles((e.target as HTMLInputElement).files)}
  />
</div>
