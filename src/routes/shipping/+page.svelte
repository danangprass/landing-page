<script lang="ts">
</script>

<svelte:head>
    <title>Shipping Information — ElectraStore</title>
    <meta name="description" content="Shipping Information — ElectraStore" />
</svelte:head>

<div class="info-page">
    <div class="info-container">
        <a href="/" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Back to Store
        </a>
        <h1 class="info-title">Shipping Information</h1>
        
            <section class="info-section">
                <h2 class="info-heading">Delivery Options</h2>
                <p class="info-text">Standard shipping (3-7 business days) is free on orders over $50. Express shipping (1-2 business days) is available starting at $15. Same-day delivery is available in select metropolitan areas for orders placed before 2 PM.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Order Tracking</h2>
                <p class="info-text">Once your order ships, you will receive a confirmation email with a tracking number. You can track your order status at any time through the link provided in the email.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">International Shipping</h2>
                <p class="info-text">We currently ship to select countries in Asia Pacific. International shipping rates are calculated at checkout based on destination and package weight. Customs fees and import duties are the responsibility of the recipient.</p>
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
