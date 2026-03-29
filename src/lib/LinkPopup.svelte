<script lang="ts">
	interface Props {
		url: string;
		onClose: () => void;
	}

	let { url, onClose }: Props = $props();
	let linkCopied = $state(false);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(url);
			linkCopied = true;
			setTimeout(() => { linkCopied = false; }, 2000);
		} catch {
			// Fallback
			const ta = document.createElement('textarea');
			ta.value = url;
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			document.body.removeChild(ta);
			linkCopied = true;
			setTimeout(() => { linkCopied = false; }, 2000);
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="link-overlay" onclick={onClose}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="link-popup" onclick={(e) => e.stopPropagation()}>
		<div class="link-popup-header">
			<span>🔗 Link</span>
			<button class="link-popup-close" onclick={onClose}>✕</button>
		</div>
		<div class="link-popup-url" dir="ltr">{url}</div>
		<button class="link-popup-copy" onclick={copyLink}>
			{linkCopied ? '✅ Copied!' : '📋 Copy Link'}
		</button>
	</div>
</div>

<style>
	.link-overlay {
		position: fixed; inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 100;
		display: flex; align-items: center; justify-content: center;
		padding: 1rem;
		animation: fadeIn 0.15s ease-out;
	}

	.link-popup {
		background: #1c2a36;
		border: 1px solid rgba(94, 170, 236, 0.2);
		border-radius: 12px;
		padding: 1.25rem;
		max-width: 420px;
		width: 100%;
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
	}

	.link-popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.link-popup-close {
		background: none; border: none;
		color: var(--text-secondary);
		font-size: 1.1rem; cursor: pointer;
		padding: 4px 8px; border-radius: 6px;
		transition: background 0.15s;
	}
	.link-popup-close:hover { background: rgba(255,255,255,0.08); }

	.link-popup-url {
		background: rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		padding: 0.75rem;
		font-size: 0.8rem;
		color: var(--accent);
		word-break: break-all;
		line-height: 1.5;
		margin-bottom: 0.75rem;
		-webkit-user-select: all;
		user-select: all;
	}

	.link-popup-copy {
		width: 100%;
		padding: 0.6rem;
		border-radius: 8px;
		border: none;
		background: var(--accent);
		color: #fff;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
		font-family: inherit;
	}
	.link-popup-copy:hover { opacity: 0.85; }

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
