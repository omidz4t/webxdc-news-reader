<script lang="ts">
	import Header from "./Header.svelte";
	import Message from "./Message.svelte";
	import Lightbox from "./Lightbox.svelte";
	import Avatar from "./Avatar.svelte";
	import type { Message as MessageType } from "./types";
	import { groupByDate, getChannelsInfo } from "./utils";

	interface Props {
		messages: MessageType[];
		channelName: string;
		fileName: string;
		onReset: () => void;
	}

	let { messages, channelName, fileName, onReset }: Props = $props();
	let selectedChannel: string | null = $state(null);
	let selectedIds: Set<string> = $state(new Set());
	let viewMode: "feed" | "grid" = $state("feed");
	let isSearching = $state(false);
	let searchQuery = $state("");

	// Reset selection when loading a NEW set of messages (e.g. merging files)
	let lastCount = $state(0);
	$effect(() => {
		if (messages.length > lastCount) {
			lastCount = messages.length;
			selectedChannel = null;
			selectedIds = new Set();
			viewMode = "feed";
			isSearching = false;
			searchQuery = "";
		}
	});

	let channels = $derived(getChannelsInfo(messages));
	let channelPhotoMap = $derived(
		Object.fromEntries(channels.map((c) => [c.name, c.photo])),
	);

	let filteredMessages = $derived(
		messages.filter((m) => {
			const channelMatch = !selectedChannel || m.chat === selectedChannel;
			const query = searchQuery.toLowerCase().trim();
			if (!query) return channelMatch;
			
			const searchMatch = 
				(m.text || "").toLowerCase().includes(query) || 
				m.sender.toLowerCase().includes(query) ||
				m.chat.toLowerCase().includes(query);
			
			return channelMatch && searchMatch;
		})
	);

	function handleSelectChannel(name: string | null) {
		selectedIds = new Set();
		selectedChannel = name;
		viewMode = "feed";
		isSearching = false;
		searchQuery = "";
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	function toggleSearch() {
		isSearching = !isSearching;
		if (!isSearching) searchQuery = "";
	}

	function updateSearch(query: string) {
		searchQuery = query;
	}

	function toggleView() {
		viewMode = viewMode === "feed" ? "grid" : "feed";
		if (viewMode === "grid") {
			selectedIds = new Set();
			isSearching = false;
			searchQuery = "";
			window.scrollTo({ top: 0 });
		}
	}

	function getMsgId(m: MessageType): string {
		return m.id || `${m.sender}_${m.timestamp}_${(m.text || "").slice(0, 20)}`;
	}

	function toggleMessageSelection(id: string) {
		if (selectedIds.has(id)) {
			selectedIds.delete(id);
		} else {
			selectedIds.add(id);
		}
		selectedIds = new Set(selectedIds);
	}

	function cancelSelection() {
		selectedIds = new Set();
		window.getSelection()?.removeAllRanges();
	}

	async function copySelected() {
		const text = messages
			.filter((m) => selectedIds.has(getMsgId(m)))
			.map((m) => `[${m.sender}]: ${m.text || m.media || "[Media]"}`)
			.join("\n\n");

		try {
			await navigator.clipboard.writeText(text);
			alert("Copied to clipboard!");
		} catch (err) {
			console.error("Failed to copy", err);
		}
		cancelSelection();
	}

	function scrollToDate(date: string) {
		const el = document.getElementById(`date-${date}`);
		if (el) {
			const offset = 80; // Header height
			const bodyRect = document.body.getBoundingClientRect().top;
			const elementRect = el.getBoundingClientRect().top;
			const elementPosition = elementRect - bodyRect;
			const offsetPosition = elementPosition - offset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
		}
	}

	let messageGroups = $derived(groupByDate(filteredMessages));
</script>

<div class="tg-container">
	{#if viewMode === "feed" && messageGroups.length > 1}
		<nav class="tg-sidebar-timeline" aria-label="Timeline navigation">
			{#each messageGroups as group}
				<button class="timeline-tick" onclick={() => scrollToDate(group.date)} title={group.date}>
					<span class="tick-line"></span>
					<span class="tick-label">{group.date}</span>
				</button>
			{/each}
		</nav>
	{/if}

	<Header
		{channelName}
		msgCount={messages.length}
		{fileName}
		{channels}
		{onReset}
		{selectedChannel}
		{viewMode}
		selectedCount={selectedIds.size}
		{searchQuery}
		{isSearching}
		onToggleSearch={toggleSearch}
		onUpdateSearch={updateSearch}
		onSelectChannel={handleSelectChannel}
		onToggleView={toggleView}
		onCancelSelection={cancelSelection}
		onCopySelected={copySelected}
	/>

	{#if viewMode === "feed"}
		<section class="tg-messages" id="news-gallery">
			{#if filteredMessages.length === 0}
				<div class="empty-state">No messages found for this channel.</div>
			{:else}
				{#each messageGroups as group}
					<div class="tg-date-separator" id="date-{group.date}">
						<span class="tg-date-label">{group.date}</span>
					</div>
					{#each group.messages as msg (getMsgId(msg))}
						<Message
							{msg}
							isSelected={selectedIds.has(getMsgId(msg))}
							{searchQuery}
							channelPhoto={channelPhotoMap[msg.chat]}
							onToggle={() => toggleMessageSelection(getMsgId(msg))}
						/>
					{/each}
				{/each}
			{/if}
		</section>

		<Lightbox galleryId="news-gallery" />
	{:else}
		<section class="tg-grid-page">
			<div class="grid-header-inline">
				<h3>Browse Channels</h3>
				<p>Explore content sources in this batch</p>
			</div>
			<div class="channels-grid">
				<button
					class="channel-card-large"
					class:active={selectedChannel === null}
					onclick={() => handleSelectChannel(null)}
				>
					<Avatar name="All" size="56px" fontSize="1.2rem" />
					<div class="card-large-info">
						<div class="card-large-name">All Messages</div>
						<div class="card-large-count">
							{messages.length} total messages
						</div>
					</div>
				</button>

				{#each channels as channel}
					<button
						class="channel-card-large"
						class:active={selectedChannel === channel.name}
						onclick={() => handleSelectChannel(channel.name)}
					>
						<Avatar name={channel.name} photo={channel.photo} size="56px" fontSize="1.2rem" />
						<div class="card-large-info">
							<div class="card-large-name">{channel.name}</div>
							<div class="card-large-count">
								{channel.count} messages
							</div>
						</div>
					</button>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.tg-container {
		position: relative;
		z-index: 1;
		max-width: 680px;
		margin: 0 auto;
		min-height: 100vh;
	}

	.tg-messages {
		padding: 0.5rem 0.75rem 2rem;
		animation: slideUp 0.3s ease-out;
	}

	.tg-grid-page {
		padding: 1.5rem 1rem 3rem;
		animation: slideUp 0.3s ease-out;
	}

	.grid-header-inline {
		margin-bottom: 2rem;
	}
	.grid-header-inline h3 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: white;
	}
	.grid-header-inline p {
		margin: 0.25rem 0 0;
		color: var(--text-secondary);
	}

	.channels-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}

	.channel-card-large {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 20px;
		padding: 1.25rem;
		display: flex;
		align-items: center;
		gap: 1.25rem;
		cursor: pointer;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		text-align: left;
		color: white;
	}
	.channel-card-large:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.15);
		transform: translateY(-4px);
	}
	.channel-card-large.active {
		background: rgba(94, 170, 236, 0.1);
		border-color: var(--accent);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	}

	.card-large-info {
		min-width: 0;
		flex: 1;
	}
	.card-large-name {
		font-weight: 700;
		font-size: 1.1rem;
		margin-bottom: 0.25rem;
	}
	.card-large-count {
		color: var(--text-secondary);
		font-size: 0.85rem;
	}

	.tg-date-separator {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 3.5rem 0 2rem;
		padding: 3rem 1rem;
		position: relative;
		z-index: 1;
		background: rgba(30, 48, 64, 0.4);
		border-radius: 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(8px);
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		text-align: center;
		overflow: hidden;
	}

	.tg-date-separator::before {
		content: "";
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at center, rgba(94, 170, 236, 0.08) 0%, transparent 70%);
		pointer-events: none;
	}

	.tg-date-label {
		color: white;
		font-size: 1.75rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.tg-date-label::after {
		content: "NEWS ARCHIVE";
		font-size: 0.7rem;
		letter-spacing: 0.3em;
		color: var(--accent);
		font-weight: 700;
		opacity: 0.6;
	}

	/* Sidebar Timeline */
	.tg-sidebar-timeline {
		position: fixed;
		left: 0;
		top: 100px;
		bottom: 40px;
		width: 40px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 4px;
		z-index: 100;
		padding: 1rem 0;
	}

	.timeline-tick {
		background: none;
		border: none;
		padding: 0;
		height: 30px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		position: relative;
		cursor: pointer;
		color: var(--text-secondary);
		transition: all 0.2s;
	}

	.tick-line {
		width: 12px;
		height: 2px;
		background: rgba(112, 132, 153, 0.4);
		border-radius: 0 4px 4px 0;
		transition: all 0.2s;
	}

	.tick-label {
		position: absolute;
		left: 100%;
		background: #1c2a36;
		padding: 0.15rem 0.5rem;
		border-radius: 6px;
		font-size: 0.75rem;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transform: translateX(8px);
		transition: all 0.2s;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.timeline-tick:hover .tick-line {
		width: 24px;
		background: var(--accent);
	}

	.timeline-tick:hover .tick-label {
		opacity: 1;
		transform: translateX(4px);
	}

	.empty-state {
		text-align: center;
		padding: 4rem 1rem;
		color: var(--text-secondary);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(15px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 480px) {
		.tg-messages {
			padding: 0.5rem 0.4rem 2rem;
		}
		.channels-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
