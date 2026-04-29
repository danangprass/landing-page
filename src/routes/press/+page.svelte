<script lang="ts">
</script>

<svelte:head>
    <title>Press & Media — ElectraStore</title>
    <meta name="description" content="Press & Media — ElectraStore" />
</svelte:head>

<div class="info-page">
    <div class="info-container">
        <a href="/" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Back to Store
        </a>
        <h1 class="info-title">Press & Media</h1>
        
            <section class="info-section">
                <h2 class="info-heading">Media Inquiries</h2>
                <p class="info-text">For press inquiries, interview requests, or media assets, please contact our communications team at press@electrastore.com. We respond to all inquiries within 24 hours during business days.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Press Releases</h2>
                <p class="info-text">Find our latest announcements, product launches, and company news. We regularly share updates about new partnerships, feature releases, and community initiatives.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Brand Assets</h2>
                <p class="info-text">Download our logo, product images, and brand guidelines. All assets are available for media use with proper attribution. Please refer to our brand guidelines for usage terms.</p>
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
