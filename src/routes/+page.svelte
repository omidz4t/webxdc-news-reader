<script lang="ts">
	import UploadScreen from '$lib/UploadScreen.svelte';
	import ChannelView from '$lib/ChannelView.svelte';
	import LinkPopup from '$lib/LinkPopup.svelte';
	import type { Message } from '$lib/types';

	let status = $state('ready');
	let messages: Message[] = $state([]);
	let fileName = $state('');
	let loadedFileNames: string[] = $state([]);
	let isDragging = $state(false);
	let channelName = $state('');

	async function decompressFiles(files: FileList | File[]) {
		status = 'decompressing';
		let allMsgs: Message[] = [...messages];
		const currentFileNames = [...loadedFileNames];

		for (const file of Array.from(files)) {
			if (!currentFileNames.includes(file.name)) currentFileNames.push(file.name);
			try {
				let jsonStr: string;
				if (file.name.endsWith('.gz')) {
					const ds = new DecompressionStream('gzip');
					const decompressedStream = file.stream().pipeThrough(ds);
					const blob = await new Response(decompressedStream).blob();
					jsonStr = await blob.text();
				} else {
					jsonStr = await file.text();
				}
				const parsed = JSON.parse(jsonStr);

				// Support both new {channels, messages} and old bare array format
				let fileMsgs: Message[];
				if (Array.isArray(parsed)) {
					// Legacy format: bare array of messages
					fileMsgs = parsed;
				} else if (parsed && parsed.messages) {
					// New format: { channels: {...}, messages: [...] }
					fileMsgs = parsed.messages;
					// Inject channel_photo from the channels dict into each message
					const channelDict = parsed.channels || {};
					for (const m of fileMsgs) {
						if (!m.channel_photo && channelDict[m.chat]?.photo) {
							m.channel_photo = channelDict[m.chat].photo;
						}
					}
				} else {
					continue;
				}
				allMsgs = [...allMsgs, ...fileMsgs];
			} catch (err) {
				console.error(`Failed to load ${file.name}:`, err);
			}
		}

		if (allMsgs.length > 0) {
			// Deduplicate by id (fallback to hash if missing)
			const uniqueMap = new Map<string, Message>();
			for (const m of allMsgs) {
				const id = m.id || `${m.sender}_${m.timestamp}_${(m.text || '').slice(0, 20)}`;
				uniqueMap.set(id, m);
			}
			
			const deduped = Array.from(uniqueMap.values());
			// Sort by timestamp
			deduped.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
			messages = deduped;
			loadedFileNames = currentFileNames;
			channelName = deduped[0]?.chat || 'Merged News';
			fileName = loadedFileNames.length > 1 ? `${loadedFileNames.length} files` : loadedFileNames[0];
			status = 'loaded';
		} else {
			status = 'No messages found in files';
		}
	}

	function handleDragOver(e: DragEvent) { e.preventDefault(); isDragging = true; }
	function handleDragLeave() { isDragging = false; }
	async function handleDrop(e: DragEvent) {
		e.preventDefault(); isDragging = false;
		if (e.dataTransfer?.files) await decompressFiles(e.dataTransfer.files);
	}

	function resetView() {
		messages = []; fileName = ''; channelName = ''; status = 'ready'; loadedFileNames = [];
	}

	// ── Link popup ──────────────────────────────────────────────
	let linkPopupUrl = $state('');

	function closeLinkPopup() {
		linkPopupUrl = '';
	}

	// Intercept link clicks globally
	function handleLinkClick(e: MouseEvent) {
		const target = (e.target as HTMLElement).closest('.tg-link') as HTMLAnchorElement | null;
		if (target) {
			e.preventDefault();
			e.stopPropagation();
			const url = target.getAttribute('href') || target.getAttribute('data-href') || '';
			if (url) linkPopupUrl = url;
		}
	}
</script>

<svelte:head>
	<title>News Reader</title>
</svelte:head>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="tg-page"
	class:dragging={isDragging}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={handleLinkClick}
>
	<!-- Wallpaper pattern -->
	<div class="tg-wallpaper"></div>

	{#if messages.length === 0}
		<UploadScreen {status} {isDragging} onDecompress={decompressFiles} />
	{:else}
		<ChannelView {messages} {channelName} {fileName} onReset={resetView} />
	{/if}
</div>

{#if linkPopupUrl}
	<LinkPopup url={linkPopupUrl} onClose={closeLinkPopup} />
{/if}

<style>
	.tg-page {
		min-height: 100vh;
		background: var(--page-bg);
		position: relative;
		color: var(--text-primary);
	}

	/* Wallpaper */
	.tg-wallpaper {
		position: fixed; inset: 0;
		background:
			radial-gradient(circle at 20% 80%, rgba(30, 60, 90, 0.15) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(30, 60, 90, 0.1) 0%, transparent 50%),
			repeating-linear-gradient(
				45deg,
				transparent,
				transparent 20px,
				rgba(30, 50, 70, 0.03) 20px,
				rgba(30, 50, 70, 0.03) 21px
			);
		pointer-events: none;
		z-index: 0;
	}

	.tg-page.dragging .tg-wallpaper {
		background-color: rgba(94, 170, 236, 0.05);
	}
</style>
