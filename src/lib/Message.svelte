<script lang="ts">
	import Avatar from './Avatar.svelte';
	import type { Message as MessageType } from './types';
	import { formatTime, avatarColor, renderText } from './utils';

	interface Props {
		msg: MessageType;
		msgId?: string;
		isSelected: boolean;
		onToggle: () => void;
		searchQuery?: string;
		channelPhoto?: string | null;
	}

	let { msg, msgId = '', isSelected, onToggle, searchQuery = '', channelPhoto = null }: Props = $props();

	function highlightText(html: string, query: string): string {
		if (!query || !query.trim()) return html;
		const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		// Use a regex that ignores text inside HTML tags to prevent breaking links
		const regex = new RegExp(`(?<!<[^>]*)(${escaped})(?![^<]*>)`, 'gi');
		return html.replace(regex, '<mark class="tg-search-highlight">$1</mark>');
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<article class="tg-msg-wrap" class:is-selected={isSelected} onclick={onToggle} data-msg-id={msgId}>
	<div class="avatar-tap-wrapper">
		<Avatar name={msg.sender} photo={msg.channel_photo || channelPhoto} size="34px" fontSize="0.7rem" />
		{#if isSelected}
			<div class="selection-check">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
			</div>
		{/if}
	</div>
	<div class="tg-msg-bubble">
		<svg class="tg-bubble-tail" width="9" height="20" viewBox="0 0 9 20">
			<path d="M8,1 L9,1 L9,20 L8,20 L8,18 C7.807,15.161 7.124,12.233 5.950,9.218 C5.046,6.893 3.504,4.733 1.325,2.738 C0.917,2.365 0.89,1.732 1.263,1.325 C1.452,1.118 1.72,1 2,1 L8,1 Z" fill="var(--bubble-bg)"/>
		</svg>
		<div class="tg-msg-author" style:color={avatarColor(msg.sender)}>{msg.sender}</div>
		{#if msg.image}
			<a class="pswp-item" href={msg.image} target="_blank" rel="noopener">
				<img class="tg-msg-image" src={msg.image} alt="" loading="lazy" />
			</a>
		{/if}
		{#if msg.text}
			<div class="tg-msg-text" dir="auto">{@html highlightText(renderText(msg.text), searchQuery)}</div>
		{/if}
		{#if msg.media}
			<div class="tg-msg-media">📎 {msg.media}</div>
		{/if}
		<div class="tg-msg-footer">
			<span class="tg-msg-time">{formatTime(msg.timestamp)}</span>
		</div>
	</div>
</article>

<style>
	.tg-msg-wrap {
		display: flex; align-items: flex-start; gap: 0.75rem;
		margin-bottom: 0.35rem;
		padding-left: 0.75rem;
		animation: fadeIn 0.3s ease-out;
		cursor: default;
		transition: background-color 0.2s;
		user-select: text;
		position: relative;
	}
	
	/* Vertical Timeline Line */
	.tg-msg-wrap::before {
		content: '';
		position: absolute;
		left: calc(0.75rem + 17px); /* Align with avatar center (34px / 2) */
		top: 0; bottom: 0;
		width: 2px;
		background: rgba(112, 132, 153, 0.15);
		z-index: 0;
	}
	
	/* Rounded tops/bottoms for the line could be added by checking day groups, 
	   but a simple continuous line is a strong baseline. */

	.tg-msg-wrap.is-selected {
		background-color: rgba(94, 170, 236, 0.1);
	}

	.avatar-tap-wrapper {
		position: relative;
		cursor: pointer;
		flex-shrink: 0;
		z-index: 1; /* Stay above the line */
		background: var(--page-bg); /* Mask the line behind the avatar */
		border-radius: 50%;
	}
	.selection-check {
		position: absolute;
		inset: 0;
		background: rgba(94, 170, 236, 0.8);
		border-radius: 50%;
		display: flex; align-items: center; justify-content: center;
		color: white;
		border: 2px solid var(--page-bg);
		animation: scaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		z-index: 2;
	}

	.tg-msg-bubble {
		position: relative;
		background: var(--bubble-bg);
		border-radius: 0 0.75rem 0.75rem 0.75rem;
		padding: 0.5rem 0.65rem 0.35rem;
		max-width: 85%;
		min-width: 180px;
		transition: background-color 0.2s;
	}
	.is-selected .tg-msg-bubble {
		background-color: #2b5278; /* Brighter blue for selected bubble */
	}

	@keyframes scaleIn {
		from { transform: scale(0); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}

	.tg-bubble-tail {
		position: absolute;
		left: -8px; top: 0;
	}

	.tg-msg-author {
		font-size: 0.8rem; font-weight: 600;
		margin-bottom: 0.15rem;
	}

	.tg-msg-text {
		font-size: 0.9rem;
		line-height: 1.45;
		color: var(--text-primary);
		white-space: pre-wrap;
		word-break: break-word;
	}

	.tg-msg-text :global(.tg-link) {
		color: var(--accent);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color 0.15s;
	}
	.tg-msg-text :global(.tg-link:hover) {
		border-bottom-color: var(--accent);
	}

	.tg-msg-text :global(.tg-search-highlight) {
		background: rgba(255, 193, 7, 0.45);
		color: white;
		border-radius: 4px;
		padding: 0 1px;
		box-shadow: 0 0 8px rgba(255, 193, 7, 0.2);
	}

	.tg-msg-media {
		display: inline-block;
		margin-top: 0.35rem;
		font-size: 0.75rem;
		color: var(--accent);
		background: rgba(94, 170, 236, 0.08);
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
	}

	.pswp-item {
		display: block;
		width: calc(100% + 1.3rem);
		margin-left: -0.65rem;
		margin-right: -0.65rem;
		margin-top: 0.25rem;
		margin-bottom: 0.5rem;
		cursor: zoom-in;
	}

	.tg-msg-image {
		width: 100%;
		border-radius: 0;
		display: block;
	}

	.tg-msg-footer {
		display: flex; justify-content: flex-end;
		margin-top: 0.15rem;
	}

	.tg-msg-time {
		font-size: 0.7rem;
		color: var(--text-secondary);
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
