<script lang="ts">
</script>

<svelte:head>
    <title>Careers — ElectraStore</title>
    <meta name="description" content="Careers — ElectraStore" />
</svelte:head>

<div class="info-page">
    <div class="info-container">
        <a href="/" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Back to Store
        </a>
        <h1 class="info-title">Careers</h1>
        
            <section class="info-section">
                <h2 class="info-heading">Join Our Team</h2>
                <p class="info-text">ElectraStore is always looking for passionate individuals who love technology and want to help shape the future of online electronics retail. We offer competitive compensation, flexible work arrangements, and opportunities for growth.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Open Positions</h2>
                <p class="info-text">We regularly post open positions in engineering, design, marketing, operations, and customer support. Check back often or follow us on LinkedIn for the latest opportunities.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Our Culture</h2>
                <p class="info-text">We foster a culture of innovation, collaboration, and continuous learning. Our team members are empowered to take ownership of their work and make a meaningful impact on the business.</p>
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
