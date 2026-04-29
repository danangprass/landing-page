<script lang="ts">
</script>

<svelte:head>
    <title>Frequently Asked Questions — ElectraStore</title>
    <meta name="description" content="Frequently Asked Questions — ElectraStore" />
</svelte:head>

<div class="info-page">
    <div class="info-container">
        <a href="/" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Back to Store
        </a>
        <h1 class="info-title">Frequently Asked Questions</h1>
        
            <section class="info-section">
                <h2 class="info-heading">Ordering</h2>
                <p class="info-text">You can place an order by browsing our products, adding items to your bag, and proceeding through checkout. We accept credit cards, debit cards, and various digital payment methods through our secure payment partner Midtrans.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Shipping</h2>
                <p class="info-text">We offer free standard shipping on all orders over $50. Standard delivery takes 3-7 business days. Express shipping is available for an additional fee and delivers within 1-2 business days.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Returns</h2>
                <p class="info-text">Items can be returned within 30 days of delivery for a full refund. Products must be in their original condition with all accessories and packaging included. Visit our Returns page for detailed instructions.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Warranty</h2>
                <p class="info-text">All products come with a minimum 1-year limited warranty against manufacturing defects. Extended warranty options are available for select products during checkout.</p>
            </section>
    </div>
</div>

<style>
    .info-page {
        min-height: 100vh;
        padding: 6rem 1rem 4rem;
    }

    .info-container {
        max-width: 720px;
        margin: 0 auto;
    }

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.875rem;
        color: var(--color-accent);
        text-decoration: none;
        margin-bottom: 2rem;
        transition: opacity 160ms var(--ease-out);
    }
    .back-link:active {
        opacity: 0.7;
    }

    .info-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--color-text-primary);
        letter-spacing: -0.025em;
        margin-bottom: 2.5rem;
    }

    .info-section {
        margin-bottom: 2.5rem;
    }

    .info-heading {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 0.75rem;
    }

    .info-text {
        font-size: 1rem;
        line-height: 1.7;
        color: var(--color-text-secondary);
    }

    @media (max-width: 767px) {
        .info-title {
            font-size: 1.75rem;
        }
        .info-page {
            padding-top: 4rem;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .back-link {
            transition: none;
        }
    }
</style>
