<script lang="ts">
	import PhotoSwipeLightbox from 'photoswipe/lightbox';
	import 'photoswipe/style.css';
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		galleryId?: string;
	}

	let { galleryId = 'news-gallery' }: Props = $props();
	let lightbox: PhotoSwipeLightbox | null = null;

	// Cache resolved dimensions
	const dimCache = new Map<string, { w: number; h: number }>();

	function getImageDimensions(src: string): Promise<{ w: number; h: number }> {
		if (dimCache.has(src)) return Promise.resolve(dimCache.get(src)!);
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				const dims = { w: img.naturalWidth, h: img.naturalHeight };
				dimCache.set(src, dims);
				resolve(dims);
			};
			img.onerror = () => resolve({ w: 800, h: 600 });
			img.src = src;
		});
	}

	onMount(() => {
		lightbox = new PhotoSwipeLightbox({
			gallery: `#${galleryId}`,
			children: 'a.pswp-item',
			pswpModule: () => import('photoswipe'),
			bgOpacity: 0.92,
			padding: { top: 20, bottom: 20, left: 20, right: 20 },
			showHideAnimationType: 'zoom',
			zoom: false,
		});

		// Resolve real dimensions from thumbnail or by loading the image
		lightbox.addFilter('domItemData', (itemData, element) => {
			const img = element.querySelector('img');
			if (img) {
				const src = img.src || element.getAttribute('href') || '';
				itemData.src = src;
				itemData.msrc = src;

				if (img.naturalWidth && img.naturalHeight) {
					itemData.w = img.naturalWidth;
					itemData.h = img.naturalHeight;
				} else {
					// Set initial size, will be corrected on open
					itemData.w = 320;
					itemData.h = 240;
				}
			}
			return itemData;
		});

		// Before slide is activated, ensure correct dimensions
		lightbox.on('contentLoad', (e) => {
			const { content } = e;
			if (content.data.src) {
				getImageDimensions(content.data.src).then((dims) => {
					content.width = dims.w;
					content.height = dims.h;
					content.updateSize?.();
				});
			}
		});

		lightbox.init();
	});

	onDestroy(() => {
		lightbox?.destroy();
		lightbox = null;
	});
</script>
