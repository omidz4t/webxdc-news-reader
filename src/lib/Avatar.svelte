<script lang="ts">
	import { getInitials, avatarColor } from './utils';

	let { name, photo = null, size = '34px', fontSize = '0.7rem' } = $props();
</script>

{#if photo}
	<img
		class="avatar"
		src={photo}
		alt={name}
		style:width={size}
		style:height={size}
	/>
{:else}
	<div
		class="avatar"
		style:background={avatarColor(name)}
		style:width={size}
		style:height={size}
		style:font-size={fontSize}
	>
		{getInitials(name)}
	</div>
{/if}

<style>
	.avatar {
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 700;
		flex-shrink: 0;
		object-fit: cover;
	}
</style>
