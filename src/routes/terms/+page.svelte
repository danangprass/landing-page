<script lang="ts">
</script>

<svelte:head>
    <title>Terms of Service — ElectraStore</title>
    <meta name="description" content="Terms of Service — ElectraStore" />
</svelte:head>

<div class="info-page">
    <div class="info-container">
        <a href="/" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Back to Store
        </a>
        <h1 class="info-title">Terms of Service</h1>
        
            <section class="info-section">
                <h2 class="info-heading">Acceptance of Terms</h2>
                <p class="info-text">By accessing or using the ElectraStore website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Account Registration</h2>
                <p class="info-text">You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information when creating an account.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Purchases</h2>
                <p class="info-text">All purchases are subject to product availability and price confirmation. We reserve the right to cancel or limit quantities on any order. Prices are subject to change without notice.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Intellectual Property</h2>
                <p class="info-text">All content on this website, including text, images, logos, and software, is the property of ElectraStore or its content suppliers and is protected by intellectual property laws.</p>
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
