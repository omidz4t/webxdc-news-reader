<script lang="ts">
	interface Props {
		status: string;
		isDragging: boolean;
		onDecompress: (files: FileList | File[]) => Promise<void>;
	}

	let { status, isDragging, onDecompress }: Props = $props();
	let fileInput: HTMLInputElement | null = $state(null);

	async function handleFileChange(event: Event) {
		const files = (event.target as HTMLInputElement).files;
		if (files && files.length > 0) await onDecompress(files);
	}

	function triggerUpload() { fileInput?.click(); }
</script>

<div class="upload-screen">
	<div class="upload-card" class:drag-active={isDragging}>
		<button type="button" class="drop-zone" onclick={triggerUpload} aria-label="Upload file">
			<input type="file" bind:this={fileInput} onchange={handleFileChange} class="sr-only" accept=".gz,.json" multiple />
			<div class="upload-icon">
				<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
					<circle cx="24" cy="24" r="23" stroke="currentColor" stroke-width="2" opacity="0.3"/>
					<path d="M24 32V16M24 16l-6 6M24 16l6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
			<h2 class="upload-title">News Reader</h2>
			<p class="upload-desc">Drop a <code>.gz</code> news file here or click to browse</p>
			{#if status !== 'ready'}
				<p class="upload-status">{status}</p>
			{/if}
		</button>
	</div>
</div>

<style>
	.upload-screen {
		position: relative; z-index: 1;
		min-height: 100vh;
		display: flex; align-items: center; justify-content: center;
		padding: 2rem;
	}

	.upload-card {
		background: var(--header-bg);
		border-radius: 1rem;
		border: 1px solid rgba(112, 132, 153, 0.15);
		overflow: hidden;
		max-width: 420px; width: 100%;
		transition: border-color 0.3s, box-shadow 0.3s;
	}
	.upload-card:hover, .upload-card.drag-active {
		border-color: var(--accent);
		box-shadow: 0 0 40px rgba(94, 170, 236, 0.1);
	}

	.drop-zone {
		display: flex; flex-direction: column; align-items: center;
		padding: 3rem 2rem;
		background: none; border: none; color: inherit; cursor: pointer;
		width: 100%;
	}
	.upload-icon { color: var(--accent); margin-bottom: 1.25rem; }
	.upload-title {
		font-size: 1.5rem; font-weight: 700; margin: 0 0 0.5rem;
	}
	.upload-desc {
		color: var(--text-secondary); font-size: 0.9rem; margin: 0;
	}
	.upload-desc code {
		background: rgba(94, 170, 236, 0.12); color: var(--accent);
		padding: 0.1rem 0.35rem; border-radius: 4px; font-size: 0.85rem;
	}
	.upload-status {
		margin-top: 0.75rem; color: var(--accent); font-size: 0.8rem;
	}
	.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
</style>
