<script lang="ts">
	import { getImageUrl } from '$lib/pb';
	import type { ExpandedProduct } from '$lib/pb-types-ext';
	import { browser } from '$app/environment';
	import Button from '$lib/components/ui/button/button.svelte';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	interface Props {
		products: ExpandedProduct[];
	}

	let { products }: Props = $props();

	let currentIndex = $state(0);
	let isPaused = $state(false);
	let prefersReducedMotion = $state(false);

	const slideCount = $derived(products.length);

	// Reduced motion detection
	$effect(() => {
		if (!browser) return;
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mq.matches;
		const handler = (e: MediaQueryListEvent) => {
			prefersReducedMotion = e.matches;
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

	// Auto-rotation every 5s, paused on hover or reduced motion
	$effect(() => {
		if (!browser) return;
		if (prefersReducedMotion || isPaused || slideCount <= 1) return;

		const interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % slideCount;
		}, 5000);

		return () => clearInterval(interval);
	});

	function goTo(index: number) {
		currentIndex = (index + slideCount) % slideCount;
	}

	function goNext() {
		goTo(currentIndex + 1);
	}

	function goPrev() {
		goTo(currentIndex - 1);
	}

	// Touch swipe support
	let touchStartX = $state(0);
	let touchEndX = $state(0);

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}

	function handleTouchMove(e: TouchEvent) {
		touchEndX = e.touches[0].clientX;
	}

	function handleTouchEnd() {
		const diff = touchStartX - touchEndX;
		const threshold = 50;
		if (Math.abs(diff) > threshold) {
			if (diff > 0) {
				goNext();
			} else {
				goPrev();
			}
		}
	}

	function formatPrice(dollars: number): string {
		return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	}
</script>

{#if slideCount > 0}
	<section
		class="carousel"
		role="region"
		aria-roledescription="carousel"
		aria-label="New arrivals"
		onmouseenter={() => (isPaused = true)}
		onmouseleave={() => (isPaused = false)}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
	>
		<div class="carousel-mesh" aria-hidden="true"></div>
		<div class="carousel-glow" aria-hidden="true"></div>

		<div class="carousel-track" aria-live="polite">
			{#each products as product, i (product.id)}
				{@const isActive = i === currentIndex}
				{@const priceStr = product.price != null ? formatPrice(product.price) : '--'}
				{@const desc = product.description ?? ''}
				<div
					class="carousel-slide"
					class:active={isActive}
					class:instant={prefersReducedMotion}
					role="group"
					aria-roledescription="slide"
					aria-label="Slide {i + 1} of {slideCount}: {product.name}"
					aria-hidden={!isActive}
				>
					<div class="slide-inner">
						<div class="slide-text">
							<span class="slide-badge">New Arrival</span>
							<h1 class="slide-title">{product.name}</h1>
							<p class="slide-subtitle">{desc}</p>
							<p class="slide-price">From {priceStr}</p>
							<div class="slide-actions">
								<Button href="/products/{product.slug}" class="btn-shop">Shop Now</Button>
							</div>
						</div>

						{#if product.images?.[0]}
							<div class="slide-visual">
								<div class="slide-image-glow" aria-hidden="true"></div>
								<img
									src={getImageUrl(product, product.images[0])}
									alt={product.name}
									class="slide-image"
									loading={i === 0 ? 'eager' : 'lazy'}
								/>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		{#if slideCount > 1}
			<Button
				variant="ghost"
				size="icon"
				class="carousel-arrow carousel-arrow-prev"
				onclick={goPrev}
				aria-label="Previous slide"
			>
				<ChevronLeftIcon class="size-6" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class="carousel-arrow carousel-arrow-next"
				onclick={goNext}
				aria-label="Next slide"
			>
				<ChevronRightIcon class="size-6" />
			</Button>
		{/if}

		{#if slideCount > 1}
			<div class="carousel-dots" role="tablist" aria-label="Slide navigation">
				{#each products as _, i}
					<button
						class="carousel-dot"
						class:active={i === currentIndex}
						onclick={() => goTo(i)}
						role="tab"
						aria-selected={i === currentIndex}
						aria-label="Go to slide {i + 1}"
					></button>
				{/each}
			</div>
		{/if}

		<div class="scroll-hint" aria-hidden="true">
			<div class="scroll-mouse">
				<div class="scroll-wheel"></div>
			</div>
		</div>
	</section>
{/if}

<style>
	.carousel {
		position: relative;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background-color: var(--color-bg);
	}

	.carousel-mesh {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 80% 60% at 20% 40%, rgba(41, 151, 255, 0.1) 0%, transparent 60%),
			radial-gradient(ellipse 60% 80% at 80% 60%, rgba(168, 85, 247, 0.08) 0%, transparent 55%),
			radial-gradient(ellipse 50% 50% at 50% 100%, rgba(41, 151, 255, 0.06) 0%, transparent 50%);
		pointer-events: none;
		animation: mesh-shift 12s ease-in-out infinite alternate;
	}

	.carousel-glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 50% 30%, rgba(41, 151, 255, 0.08) 0%, transparent 50%);
		pointer-events: none;
	}

	@keyframes mesh-shift {
		0% { transform: translate(0, 0) scale(1); }
		100% { transform: translate(-2%, 2%) scale(1.05); }
	}

	/* Track & slides */
	.carousel-track {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 72rem;
		padding: 6rem 1.5rem 4rem;
	}

	.carousel-slide {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		pointer-events: none;
		transition: opacity 700ms cubic-bezier(0.16, 1, 0.3, 1);
		padding: 6rem 1.5rem 4rem;
	}

	.carousel-slide.active {
		opacity: 1;
		pointer-events: auto;
		position: relative;
	}

	.carousel-slide.instant {
		transition: none;
	}

	.slide-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3rem;
		width: 100%;
		text-align: center;
	}

	/* Text */
	.slide-text {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 36rem;
	}

	.slide-badge {
		display: inline-block;
		padding: 0.375rem 1rem;
		border-radius: var(--radius-full);
		background: rgba(41, 151, 255, 0.15);
		border: 1px solid rgba(41, 151, 255, 0.25);
		color: var(--color-accent);
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
		backdrop-filter: blur(8px);
	}

	.slide-title {
		font-size: clamp(2.75rem, 8vw, 5rem);
		font-weight: 700;
		color: var(--color-text-primary);
		letter-spacing: -0.03em;
		line-height: 1.05;
		text-wrap: balance;
	}

	.slide-subtitle {
		margin-top: 1.25rem;
		font-size: clamp(1.125rem, 2.5vw, 1.375rem);
		color: var(--color-text-secondary);
		max-width: 36rem;
		line-height: 1.5;
		text-wrap: pretty;
	}

	.slide-price {
		margin-top: 1rem;
		font-size: 1.25rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.slide-actions {
		margin-top: 2.5rem;
	}

	:global(.btn-shop) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.875rem 2.5rem;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: #fff;
		font-size: 1.0625rem;
		font-weight: 600;
		text-decoration: none;
		transition: background 200ms ease-out, transform 200ms ease-out,
			box-shadow 300ms ease-out;
	}

	:global(.btn-shop):hover {
		background: var(--color-accent-hover);
		box-shadow: 0 0 24px rgba(41, 151, 255, 0.3);
	}

	:global(.btn-shop):active {
		transform: scale(0.97);
	}

	/* Product image */
	.slide-visual {
		position: relative;
		flex-shrink: 0;
	}

	.slide-image-glow {
		position: absolute;
		inset: -20%;
		background: radial-gradient(circle at 50% 50%, rgba(41, 151, 255, 0.15) 0%, transparent 60%);
		pointer-events: none;
		animation: glow-pulse 4s ease-in-out infinite alternate;
	}

	@keyframes glow-pulse {
		0% { opacity: 0.6; transform: scale(1); }
		100% { opacity: 1; transform: scale(1.1); }
	}

	.slide-image {
		position: relative;
		width: 100%;
		max-width: 28rem;
		height: auto;
		border-radius: var(--radius-lg);
		object-fit: cover;
		aspect-ratio: 4 / 3;
		animation: image-float 6s ease-in-out infinite;
	}

	@keyframes image-float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-12px); }
	}

	/* Navigation arrows */
	:global(.carousel-arrow) {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: var(--radius-full);
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(29, 29, 31, 0.7);
		color: var(--color-text-primary);
		cursor: pointer;
		backdrop-filter: blur(12px);
		transition: background 200ms ease-out, border-color 200ms ease-out,
			transform 200ms ease-out;
	}

	:global(.carousel-arrow):hover {
		background: rgba(41, 151, 255, 0.15);
		border-color: rgba(41, 151, 255, 0.4);
		color: var(--color-accent);
	}

	:global(.carousel-arrow):active {
		transform: translateY(-50%) scale(0.93);
	}

	:global(.carousel-arrow-prev) {
		left: 1rem;
	}

	:global(.carousel-arrow-next) {
		right: 1rem;
	}

	/* Dot indicators */
	.carousel-dots {
		position: absolute;
		bottom: 4.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 10;
		display: flex;
		gap: 0.625rem;
		padding: 0.5rem;
	}

	.carousel-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: var(--radius-full);
		border: none;
		background: rgba(255, 255, 255, 0.3);
		cursor: pointer;
		padding: 0;
		transition: background 250ms ease-out, width 250ms ease-out;
	}

	.carousel-dot:hover {
		background: rgba(255, 255, 255, 0.5);
	}

	.carousel-dot.active {
		background: var(--color-accent);
		width: 1.75rem;
	}

	/* Scroll hint */
	.scroll-hint {
		position: absolute;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		opacity: 0.35;
		z-index: 5;
	}

	.scroll-mouse {
		width: 1.5rem;
		height: 2.25rem;
		border: 2px solid var(--color-text-secondary);
		border-radius: 9999px;
		position: relative;
	}

	.scroll-wheel {
		width: 4px;
		height: 6px;
		background: var(--color-text-secondary);
		border-radius: 2px;
		position: absolute;
		top: 6px;
		left: 50%;
		transform: translateX(-50%);
		animation: scroll-wheel 1.5s ease-in-out infinite;
	}

	@keyframes scroll-wheel {
		0%, 100% { opacity: 1; transform: translateX(-50%) translateY(0); }
		50% { opacity: 0.3; transform: translateX(-50%) translateY(6px); }
	}

	/* Desktop horizontal layout */
	@media (min-width: 1024px) {
		.slide-inner {
			flex-direction: row;
			text-align: left;
			gap: 4rem;
			padding: 4rem 2rem;
		}

		.slide-text {
			align-items: flex-start;
		}

		:global(.carousel-arrow-prev) {
			left: 1.5rem;
		}

		:global(.carousel-arrow-next) {
			right: 1.5rem;
		}

		.carousel-track {
			padding: 4rem 2rem;
		}

		.carousel-slide {
			padding: 4rem 2rem;
		}
	}

	/* Mobile adjustments */
	@media (max-width: 640px) {
		:global(.carousel-arrow) {
			width: 2.5rem;
			height: 2.5rem;
		}

		:global(.carousel-arrow-prev) {
			left: 0.5rem;
		}

		:global(.carousel-arrow-next) {
			right: 0.5rem;
		}

		.slide-image {
			max-width: 20rem;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.carousel-mesh {
			animation: none;
		}

		.scroll-hint {
			display: none;
		}

		.slide-image-glow {
			animation: none;
		}

		.slide-image {
			animation: none;
		}

		.carousel-slide {
			transition: none;
		}
	}
</style>
