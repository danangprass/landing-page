<script lang="ts">
</script>

<svelte:head>
    <title>Privacy Policy — ElectraStore</title>
    <meta name="description" content="Privacy Policy — ElectraStore" />
</svelte:head>

<div class="info-page">
    <div class="info-container">
        <a href="/" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Back to Store
        </a>
        <h1 class="info-title">Privacy Policy</h1>
        
            <section class="info-section">
                <h2 class="info-heading">Information We Collect</h2>
                <p class="info-text">We collect information you provide when creating an account, placing an order, or contacting customer support. This includes your name, email address, shipping address, and payment information. We also collect browsing data through cookies and similar technologies.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">How We Use Your Data</h2>
                <p class="info-text">Your information is used to process orders, provide customer support, and improve our services. We may send you marketing communications if you have opted in. You can unsubscribe at any time.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Data Sharing</h2>
                <p class="info-text">We do not sell your personal information. We share data only with service providers necessary to operate our business, such as payment processors, shipping carriers, and analytics services. All partners are contractually bound to protect your data.</p>
            </section>
            <section class="info-section">
                <h2 class="info-heading">Your Rights</h2>
                <p class="info-text">You have the right to access, correct, or delete your personal data. You can manage your communication preferences in your account settings or contact our privacy team at privacy@electrastore.com.</p>
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
