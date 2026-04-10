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
		sortOrder: 'asc' | 'desc';
		onToggleSort: () => void;
		onJumpToTime: (datetime: string) => void;
		minTimestamp?: string;
		maxTimestamp?: string;
	}

	let { 
		channelName, msgCount, fileName, channels, onReset, 
		selectedChannel, viewMode, selectedCount,
		onSelectChannel, onToggleView, onCancelSelection, onCopySelected,
		searchQuery, isSearching, onToggleSearch, onUpdateSearch,
		sortOrder, onToggleSort, onJumpToTime,
		minTimestamp = '', maxTimestamp = ''
	}: Props = $props();

	let searchInput = $state<HTMLInputElement>();
	let showTimePicker = $state(false);
	let timePickerValue = $state('');

	$effect(() => {
		if (isSearching) searchInput?.focus();
	});

	function handleTimeSubmit() {
		if (timePickerValue) {
			onJumpToTime(timePickerValue);
			showTimePicker = false;
			timePickerValue = '';
		}
	}

	function closeTimePicker() {
		showTimePicker = false;
		timePickerValue = '';
	}

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
		<div class="header-top-row">
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

			<button class="tg-header-btn close-btn" onclick={onReset} title="Load another file" aria-label="Close">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
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

			<!-- Sort order toggle -->
			<button 
				class="tg-header-btn"
				class:active={sortOrder === 'desc'}
				onclick={onToggleSort}
				title={sortOrder === 'asc' ? 'Newest first' : 'Oldest first'}
				aria-label={sortOrder === 'asc' ? 'Sort newest first' : 'Sort oldest first'}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
					style="transform: {sortOrder === 'desc' ? 'scaleY(-1)' : 'none'}; transition: transform 0.3s ease"
				>
					<line x1="12" y1="5" x2="12" y2="19"></line>
					<polyline points="19 12 12 19 5 12"></polyline>
				</svg>
			</button>

			<!-- Jump to time -->
			<button 
				class="tg-header-btn"
				class:active={showTimePicker}
				onclick={() => showTimePicker = !showTimePicker}
				title="Jump to time"
				aria-label="Jump to time"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"></circle>
					<polyline points="12 6 12 12 16 14"></polyline>
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

			<button class="tg-header-btn actions-close-btn" onclick={onReset} title="Load another file" aria-label="Close">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
	{/if}
</header>

{#if showTimePicker}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="time-picker-overlay" onclick={closeTimePicker}></div>
	<div class="time-picker-popup">
		<div class="time-picker-header">Jump to Time</div>
		<input 
			type="datetime-local" 
			class="time-picker-input"
			bind:value={timePickerValue}
			min={minTimestamp}
			max={maxTimestamp}
			onkeydown={(e) => e.key === 'Enter' && handleTimeSubmit()}
		/>
		<div class="time-picker-actions">
			<button class="time-picker-btn cancel" onclick={closeTimePicker}>Cancel</button>
			<button class="time-picker-btn go" onclick={handleTimeSubmit} disabled={!timePickerValue}>Go</button>
		</div>
	</div>
{/if}

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
		flex-wrap: wrap;
	}

	.header-top-row {
		display: flex; align-items: center; gap: 0.75rem;
		flex: 1 1 100%;
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
	
	/* Close button in top row: only on mobile */
	.close-btn { display: none; }
	/* Close button in actions row: shown on desktop */
	.actions-close-btn { display: flex; }

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

	/* Time picker popup */
	.time-picker-overlay {
		position: fixed; inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 200;
		animation: fadeIn 0.15s ease-out;
	}
	.time-picker-popup {
		position: fixed;
		top: 50%; left: 50%;
		transform: translate(-50%, -50%);
		z-index: 201;
		background: #1c2a36;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 1.5rem;
		min-width: 280px;
		width: 90%;
		max-width: 340px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		animation: modalIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.time-picker-header {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--accent);
		margin-bottom: 0.75rem;
	}
	.time-picker-input {
		width: 100%;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 10px;
		padding: 0.6rem 0.75rem;
		color: white;
		font-size: 0.9rem;
		outline: none;
		transition: all 0.2s;
		box-sizing: border-box;
		color-scheme: dark;
	}
	.time-picker-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px rgba(94, 170, 236, 0.2);
	}
	.time-picker-actions {
		display: flex; gap: 0.5rem;
		margin-top: 0.75rem;
		justify-content: flex-end;
	}
	.time-picker-btn {
		padding: 0.45rem 1rem;
		border-radius: 8px;
		border: none;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}
	.time-picker-btn.cancel {
		background: rgba(255, 255, 255, 0.06);
		color: var(--text-secondary);
	}
	.time-picker-btn.cancel:hover {
		background: rgba(255, 255, 255, 0.1);
		color: white;
	}
	.time-picker-btn.go {
		background: var(--accent);
		color: white;
	}
	.time-picker-btn.go:hover {
		filter: brightness(1.1);
	}
	.time-picker-btn.go:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-5px); }
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes slideDown {
		from { opacity: 0; transform: translateY(-10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes modalIn {
		from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
		to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
	}

	/* ── Mobile two-row layout ── */
	@media (max-width: 520px) {
		.tg-channel-header {
			gap: 0.5rem;
			padding: 0.6rem 0.75rem;
		}

		.header-top-row {
			flex: 1 1 100%;
			gap: 0.6rem;
		}

		.close-btn {
			display: flex;
		}

		.actions-close-btn {
			display: none;
		}

		.header-actions {
			flex: 1 1 100%;
			justify-content: center;
			gap: 0.75rem;
			padding-top: 0.25rem;
			border-top: 1px solid rgba(255, 255, 255, 0.06);
		}

		.tg-header-btn {
			width: 34px; height: 34px;
			border-radius: 8px;
		}
	}

	/* Desktop: single row — hide close in top row, show in actions */
	@media (min-width: 521px) {
		.header-top-row {
			flex: 1 1 auto;
		}
	}
</style>

