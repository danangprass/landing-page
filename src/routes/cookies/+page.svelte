<script lang="ts">
</script>

<svelte:head>
    <title>Cookie Policy — ElectraStore</title>
    <meta name="description" content="Cookie Policy — ElectraStore" />
</svelte:head>

<div class="info-page">
    <div class="info-container">
        <a href="/" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Back to Store
        </a>
        <h1 class="info-title">Cookie Policy</h1>
        
            <section class="info-section">
                <h2 class="info-heading">What Are Cookies</h2>
                <p class="info-text">Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, understand how you use our site, and improve your experience.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Types of Cookies We Use</h2>
                <p class="info-text">Essential cookies are necessary for the website to function and cannot be disabled. Performance cookies help us analyze site usage. Functional cookies remember your preferences. Marketing cookies track your browsing for advertising purposes.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Managing Cookies</h2>
                <p class="info-text">You can control and delete cookies through your browser settings. Disabling certain cookies may affect the functionality of our website. For more information, visit your browser's help documentation.</p>
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
