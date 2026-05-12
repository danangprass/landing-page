export interface StaticPage {
	title: string;
	slug: string;
	content: string;
}

export const staticPages: StaticPage[] = [
	{
		title: 'Our Story',
		slug: 'about',
		content: `<p>ElectraStore was founded with a simple mission: to make premium electronics accessible to everyone. We believe technology should inspire, connect, and empower.</p>
<p>Since our founding, we have curated a collection of cutting-edge devices — from smartphones to laptops, audio gear to wearables — each selected for its quality, design, and innovation.</p>
<h2>Our Values</h2>
<p><strong>Quality First</strong> — Every product in our store meets rigorous standards for performance and reliability.</p>
<p><strong>Customer Focus</strong> — Your experience matters. We are committed to exceptional service at every step.</p>
<p><strong>Innovation</strong> — We stay ahead of the curve, bringing you the latest technology as it emerges.</p>`,
	},
	{
		title: 'Careers',
		slug: 'careers',
		content: `<p>Join a team that is passionate about technology and customer experience. At ElectraStore, we are building the future of electronics retail.</p>
<h2>Why Work With Us</h2>
<p>We offer competitive compensation, flexible work arrangements, and opportunities for growth. Our team is distributed across the globe, working together to deliver exceptional products and service.</p>
<h2>Open Positions</h2>
<p>We are always looking for talented individuals. Check back regularly for new openings, or send your resume to <a href="mailto:careers@electrastore.com">careers@electrastore.com</a>.</p>`,
	},
	{
		title: 'Cookie Policy',
		slug: 'cookies',
		content: `<p>This Cookie Policy explains how ElectraStore uses cookies and similar technologies on our website.</p>
<h2>What Are Cookies</h2>
<p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, understand how you use our site, and improve your experience.</p>
<h2>Types of Cookies We Use</h2>
<p><strong>Essential Cookies</strong> — Required for the website to function properly, such as maintaining your shopping bag and account session.</p>
<p><strong>Analytics Cookies</strong> — Help us understand how visitors interact with our site so we can improve it.</p>
<p><strong>Preference Cookies</strong> — Remember your settings and preferences for future visits.</p>
<h2>Managing Cookies</h2>
<p>You can control and delete cookies through your browser settings. Please note that disabling essential cookies may affect site functionality.</p>`,
	},
	{
		title: 'Frequently Asked Questions',
		slug: 'faq',
		content: `<h2>Orders & Shipping</h2>
<p><strong>How long does shipping take?</strong><br/>Standard shipping takes 5-7 business days. Express shipping delivers in 2-3 business days, and overnight shipping arrives the next business day.</p>
<p><strong>Do you ship internationally?</strong><br/>Yes, we ship to most countries worldwide. Shipping rates and delivery times vary by destination.</p>
<p><strong>Can I track my order?</strong><br/>Absolutely. Once your order ships, you will receive a tracking number via email.</p>
<h2>Returns & Refunds</h2>
<p><strong>What is your return policy?</strong><br/>You may return most items within 30 days of delivery for a full refund. Items must be in original condition with all accessories.</p>
<p><strong>How do I initiate a return?</strong><br/>Visit your order history in your account, select the order, and click "Request Return."</p>
<h2>Payment</h2>
<p><strong>What payment methods do you accept?</strong><br/>We accept credit/debit cards, bank transfers, and digital wallets through our secure Midtrans payment gateway.</p>`,
	},
	{
		title: 'Press',
		slug: 'press',
		content: `<p>Welcome to the ElectraStore press room. Find the latest news, media resources, and contact information for press inquiries.</p>
<h2>Media Contact</h2>
<p>For press inquiries, please email <a href="mailto:press@electrastore.com">press@electrastore.com</a>. We respond to media requests within 24 hours.</p>
<h2>Brand Assets</h2>
<p>Download our logo, brand guidelines, and product photography from our media kit. Contact our press team for access.</p>`,
	},
	{
		title: 'Privacy Policy',
		slug: 'privacy',
		content: `<p>Your privacy is important to us. This Privacy Policy explains how ElectraStore collects, uses, and protects your personal information.</p>
<h2>Information We Collect</h2>
<p><strong>Account Information</strong> — Name, email address, and password when you create an account.</p>
<p><strong>Order Information</strong> — Shipping address, billing address, and payment details required to process your orders.</p>
<p><strong>Usage Data</strong> — Pages visited, products viewed, and interactions with our site.</p>
<h2>How We Use Your Information</h2>
<p>We use your information to process orders, improve our services, communicate with you about your account, and send marketing communications you have opted into.</p>
<h2>Data Protection</h2>
<p>We implement industry-standard security measures to protect your data. Payment information is processed securely through Midtrans and is never stored on our servers.</p>
<h2>Your Rights</h2>
<p>You may request access to, correction of, or deletion of your personal data at any time by contacting our support team.</p>`,
	},
	{
		title: 'Returns & Exchanges',
		slug: 'returns',
		content: `<p>We want you to love your purchase. If you are not completely satisfied, we are here to help.</p>
<h2>Return Policy</h2>
<p>Most items can be returned within 30 days of delivery. Items must be in original condition with all accessories, manuals, and packaging.</p>
<h2>How to Return an Item</h2>
<ol><li>Sign in to your account and navigate to your order history.</li><li>Select the order and click "Request Return."</li><li>Follow the instructions to print your return label.</li><li>Drop off the package at the designated carrier location.</li></ol>
<h2>Refunds</h2>
<p>Refunds are processed within 5-10 business days after we receive your return. The refund will be issued to your original payment method.</p>
<h2>Exchanges</h2>
<p>Need a different size, color, or model? Initiate an exchange through your order history and we will ship the replacement once we receive your return.</p>`,
	},
	{
		title: 'Shipping Information',
		slug: 'shipping',
		content: `<h2>Shipping Methods</h2>
<p><strong>Standard Shipping</strong> — Free on all orders. Delivers in 5-7 business days.</p>
<p><strong>Express Shipping</strong> — $9.99. Delivers in 2-3 business days.</p>
<p><strong>Overnight Shipping</strong> — $19.99. Delivers the next business day (order by 2 PM EST).</p>
<h2>International Shipping</h2>
<p>We ship to most countries worldwide. International shipping rates are calculated at checkout based on destination and package weight.</p>
<h2>Order Tracking</h2>
<p>Once your order ships, you will receive a confirmation email with a tracking number. You can also track your order from your account dashboard.</p>`,
	},
	{
		title: 'Sustainability',
		slug: 'sustainability',
		content: `<p>At ElectraStore, we are committed to reducing our environmental impact and building a more sustainable future.</p>
<h2>Our Commitment</h2>
<p><strong>Responsible Packaging</strong> — We use recycled and recyclable materials for all packaging. Our boxes are FSC-certified and we have eliminated single-use plastics.</p>
<p><strong>Carbon Neutral Shipping</strong> — We offset carbon emissions for every shipment through verified reforestation and renewable energy projects.</p>
<p><strong>Product Lifecycle</strong> — We partner with manufacturers who prioritize energy efficiency, repairability, and sustainable materials.</p>
<h2>Recycling Program</h2>
<p>Send us your old electronics and we will recycle them responsibly — for free. Contact support to request a prepaid recycling kit.</p>`,
	},
	{
		title: 'Terms of Service',
		slug: 'terms',
		content: `<p>These Terms of Service govern your use of the ElectraStore website and services. By using our site, you agree to these terms.</p>
<h2>Account Responsibilities</h2>
<p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
<h2>Orders & Pricing</h2>
<p>All prices are listed in US dollars. We reserve the right to correct pricing errors and cancel orders affected by such errors. Product availability is subject to change.</p>
<h2>Intellectual Property</h2>
<p>All content on this site — including text, images, logos, and product descriptions — is the property of ElectraStore and protected by copyright law.</p>
<h2>Limitation of Liability</h2>
<p>ElectraStore is not liable for any indirect or consequential damages arising from the use of our products or services.</p>
<h2>Changes to Terms</h2>
<p>We may update these terms from time to time. Continued use of the site after changes constitutes acceptance of the updated terms.</p>`,
	},
];

export const staticPagesBySlug = new Map(
	staticPages.map((p) => [p.slug, p]),
);
