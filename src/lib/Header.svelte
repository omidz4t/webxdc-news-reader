<script lang="ts">
	import Avatar from './Avatar.svelte';

	interface Props {
		channelName: string;
		msgCount: number;
		fileName: string;
		channels: { name: string, count: number, photo?: string | null }[];
		onReset: () => void;
		selectedChannel: string | null;
		viewMode: 'feed' | 'grid';
		selectedCount: number;
		onSelectChannel: (name: string | null) => void;
		onToggleView: () => void;
		onCancelSelection: () => void;
		onCopySelected: () => void;
		searchQuery: string;
		isSearching: boolean;
		onToggleSearch: () => void;
		onUpdateSearch: (query: string) => void;
	}

	let { 
		channelName, msgCount, fileName, channels, onReset, 
		selectedChannel, viewMode, selectedCount,
		onSelectChannel, onToggleView, onCancelSelection, onCopySelected,
		searchQuery, isSearching, onToggleSearch, onUpdateSearch
	}: Props = $props();

	let searchInput = $state<HTMLInputElement>();
	$effect(() => {
		if (isSearching) searchInput?.focus();
	});

	// Current display name
	let displayLabel = $derived(selectedChannel || 'Batched News');
	let displayCount = $derived(
		selectedChannel 
			? channels.find(c => c.name === selectedChannel)?.count || 0 
			: msgCount
	);

	let appVersion = $state(__APP_VERSION__ || '');
	$effect(() => {
		try {
			// @ts-ignore
			const info = window.webxdc.getAppInfo();
			if (info?.version) appVersion = info.version;
		} catch (e) { /* ignore */ }
	});
</script>

<header class="tg-channel-header" class:selection-mode={selectedCount > 0} class:search-mode={isSearching}>
	{#if selectedCount > 0}
		<div class="selection-bar">
			<button class="selection-btn cancel" onclick={onCancelSelection}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
				<span>Cancel</span>
			</button>
			<div class="selection-info">{selectedCount} messages selected</div>
			<button class="selection-btn copy" onclick={onCopySelected}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
				</svg>
				<span>Copy</span>
			</button>
		</div>
	{:else if isSearching}
		<div class="search-bar">
			<svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="11" cy="11" r="8"></circle>
				<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
			</svg>
			<input 
				bind:this={searchInput}
				type="text" 
				placeholder="Search messages..." 
				value={searchQuery}
				oninput={(e) => onUpdateSearch(e.currentTarget.value)}
				onkeydown={(e) => e.key === 'Escape' && onToggleSearch()}
			/>
			<button class="search-close" onclick={onToggleSearch} title="Close search">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
	{:else}
		<Avatar name={displayLabel} photo={selectedChannel ? channels.find(c => c.name === selectedChannel)?.photo : null} size="42px" fontSize="0.85rem" />
		<div class="tg-channel-info">
			<div class="tg-channel-name">{displayLabel}</div>
			<div class="tg-channel-meta">
				{displayCount} messages · {fileName}
				{#if appVersion}
					· <span class="header-version">v{appVersion}</span>
				{/if}
			</div>
		</div>
		
		<div class="header-actions">
			<button 
				class="tg-header-btn"
				onclick={onToggleSearch}
				title="Search messages"
				aria-label="Search"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="11" cy="11" r="8"></circle>
					<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
				</svg>
			</button>

			<button 
				class="tg-header-btn" 
				class:active={viewMode === 'grid'} 
				onclick={onToggleView} 
				aria-label={viewMode === 'grid' ? "Show Feed" : "Show Channels"}
				title={viewMode === 'grid' ? "Show Feed" : "Show Channels"}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					{#if viewMode === 'feed'}
						<rect x="3" y="3" width="7" height="7"></rect>
						<rect x="14" y="3" width="7" height="7"></rect>
						<rect x="14" y="14" width="7" height="7"></rect>
						<rect x="3" y="14" width="7" height="7"></rect>
					{:else}
						<polyline points="15 10 20 15 15 20"></polyline>
						<path d="M4 4v7a4 4 0 0 0 4 4h12"></path>
					{/if}
				</svg>
			</button>
			
			<button class="tg-header-btn" onclick={onReset} title="Load another file" aria-label="Close">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
	{/if}
</header>

<style>
	.tg-channel-header {
		position: sticky; top: 0; z-index: 100;
		display: flex; align-items: center; gap: 0.75rem;
		background: var(--header-bg);
		padding: 0.75rem 1rem;
		border-bottom: 1px solid rgba(112, 132, 153, 0.15);
		border-radius: 0 0 16px 16px;
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 20px rgba(0,0,0,0.15);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		min-height: 48px;
	}

	.tg-channel-info { flex: 1; min-width: 0; }
	.tg-channel-name {
		font-size: 1rem; font-weight: 600;
		white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
		color: var(--accent);
	}
	.tg-channel-meta {
		font-size: 0.75rem; color: var(--text-secondary);
	}
	
	.header-actions {
		display: flex; gap: 0.5rem;
	}

	.tg-channel-header.selection-mode {
		background: #1c2a36;
		border-radius: 0 0 12px 12px;
	}

	.selection-bar, .search-bar {
		display: flex; align-items: center; width: 100%; gap: 1rem;
		padding: 0 0.25rem;
		animation: fadeIn 0.2s ease-out;
	}

	.search-bar { gap: 0.5rem; }
	.search-icon { color: var(--accent); opacity: 0.8; margin-left: 0.25rem; }
	.search-bar input {
		flex: 1; min-width: 0;
		background: rgba(255,255,255,0.05);
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: 10px;
		padding: 0.5rem 0.75rem;
		color: white;
		font-size: 0.95rem;
		outline: none;
		transition: all 0.2s;
	}
	.search-bar input:focus {
		background: rgba(255,255,255,0.08);
		border-color: var(--accent);
		box-shadow: 0 0 0 2px rgba(94, 170, 236, 0.2);
	}
	.search-close {
		background: none; border: none; color: var(--text-secondary);
		cursor: pointer; padding: 4px; border-radius: 6px;
		display: flex; align-items: center; justify-content: center;
		transition: all 0.2s;
	}
	.search-close:hover { background: rgba(255,255,255,0.1); color: white; }

	.selection-btn {
		background: none; border: none; color: white;
		cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
		padding: 0.5rem 0.75rem; border-radius: 8px;
		font-size: 0.9rem; font-weight: 600;
		transition: all 0.2s;
	}
	.selection-btn:hover { background: rgba(255,255,255,0.08); }
	.selection-btn.cancel { color: var(--text-secondary); }
	.selection-btn.copy { color: var(--accent); }

	.selection-info {
		flex: 1; text-align: center;
		font-size: 0.95rem; font-weight: 500; color: white;
	}

	.tg-header-btn {
		width: 38px; height: 38px; border-radius: 10px;
		background: rgba(255,255,255,0.04); border: none; color: var(--text-secondary);
		cursor: pointer; display: flex; align-items: center; justify-content: center;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.tg-header-btn:hover { background: rgba(255,255,255,0.08); color: white; transform: scale(1.05); }
	.tg-header-btn:active { transform: scale(0.95); }
	.tg-header-btn.active { background: var(--accent); color: white; }

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-5px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>

