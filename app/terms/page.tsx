import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Terms of Service Page
 */
export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p>Last updated: October 2024</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using the GoTaskMind website and services, you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, you may not use our services.</p>

          <h2>2. Account Creation</h2>
          <ul>
            <li>You must be at least 13 years old to use our services</li>
            <li>You need to use a Google account to log in to access our services</li>
            <li>You agree to provide accurate, complete, and current information</li>
          </ul>

          <h2>3. Paid Services</h2>
          <h3>3.1 Subscription Plans</h3>
          <p>GoTaskMind offers the following subscription plans:</p>
          <ul>
            <li><strong>Free Plan:</strong> Free to use with basic features</li>
            <li><strong>Pro Plan:</strong> Paid subscription with advanced features and unlimited usage</li>
          </ul>

          <h3>3.2 Payment Terms</h3>
          <ul>
            <li>All payments are processed through Creem (our payment service provider)</li>
            <li>You agree to provide accurate and complete payment information to Creem</li>
            <li>You authorize Creem to charge your payment method according to your selected subscription plan</li>
            <li>Prices may change, but we will provide 30 days notice</li>
            <li><strong>International Payments:</strong> We support multiple currencies and payment methods depending on your region</li>
            <li><strong>Taxes:</strong> You are responsible for complying with local tax regulations, including but not limited to VAT, sales tax, etc.</li>
          </ul>

          <h3>3.3 Refund Policy</h3>
          <p><strong>All Pro plan purchases are final and non-refundable.</strong></p>
          <p>We recommend starting with our Free plan to evaluate if our platform meets your needs before upgrading to a paid subscription. The Free plan includes core features that allow you to thoroughly test our service.</p>
          <p>By purchasing a Pro plan subscription, you acknowledge and agree that:</p>
          <ul>
            <li>All payments are final and non-refundable</li>
            <li>You have evaluated the service through our Free plan</li>
            <li>You understand the features and limitations of the Pro plan</li>
            <li>No refunds will be issued for any portion of the subscription period</li>
          </ul>

          <h2>4. User Conduct</h2>
          <p>When using our services, you agree not to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on others' intellectual property rights</li>
            <li>Upload or share malicious software, viruses, or other harmful content</li>
            <li>Interfere with or disrupt the normal operation of the service</li>
            <li>Attempt to circumvent payment or abuse refund policies</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>All content, features, and functionality of GoTaskMind, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, are the property of GoTaskMind or its licensors and are protected by copyright, trademark, and other intellectual property laws.</p>

          <h2>6. Service Modifications</h2>
          <p>We reserve the right to modify or discontinue the service at any time without prior notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.</p>

          <h2>7. Disclaimer</h2>
          <p>Our service is provided on an "as is" and "as available" basis, without any warranties of any kind, whether express or implied. We do not guarantee that the service will be uninterrupted, timely, secure, or error-free.</p>

          <h2>8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, GoTaskMind and its directors, employees, partners, agents, suppliers, or affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>

          <h2>9. Terms Modification</h2>
          <p>We reserve the right to modify these Terms of Service at any time. When we make material changes, we will notify you by posting the updated terms on our website. Your continued use of the service will be deemed acceptance of the modified terms.</p>

          <h2>10. International Services & Jurisdiction</h2>
          <h3>10.1 Global Service</h3>
          <p>GoTaskMind is a global service, and we provide services to users worldwide. Different regions may have different legal requirements, and we will strive to comply with applicable local laws.</p>

          <h3>10.2 Governing Law</h3>
          <p>These Terms of Service are governed by the following laws:</p>
          <ul>
            <li>For North America (US, Canada) users: Governed by the laws of the State of Delaware, USA</li>
            <li>For European users: Governed by Irish law, in compliance with the EU General Data Protection Regulation (GDPR)</li>
            <li>For Asia-Pacific users: Governed by Singapore law</li>
            <li>For other regions: Governed by Swiss law (as a neutral legal jurisdiction)</li>
          </ul>

          <h3>10.3 Dispute Resolution</h3>
          <p>We prioritize resolving disputes through friendly negotiation. If an agreement cannot be reached, disputes will be resolved through the following methods:</p>
          <ul>
            <li>First through online mediation or arbitration</li>
            <li>Filing a lawsuit in a court of competent jurisdiction in the user's location</li>
            <li>Or other dispute resolution mechanisms agreed upon by both parties</li>
          </ul>

          <h2>11. Cross-Border Services & Compliance</h2>
          <h3>11.1 Service Availability</h3>
          <p>GoTaskMind services are available in most countries and regions, but may be subject to local legal restrictions. We do not provide services in the following areas:</p>
          <ul>
            <li>Countries and regions subject to United Nations sanctions</li>
            <li>Regions where services are prohibited by local laws</li>
            <li>Regions where technical limitations prevent service delivery</li>
          </ul>

          <h3>11.2 Cross-Border Data Transfers</h3>
          <p>Our services may involve cross-border data transfers:</p>
          <ul>
            <li>Data is stored on cloud servers that comply with international security standards</li>
            <li>We employ appropriate legal mechanisms to ensure the legality of cross-border data transfers</li>
            <li>EU user data is protected under GDPR</li>
            <li>California users are protected under CCPA/CPRA</li>
          </ul>

          <h3>11.3 Language and Currency</h3>
          <ul>
            <li>The service supports multiple language interfaces</li>
            <li>Pricing is based on USD, with support for multiple local currency payments</li>
            <li>Exchange rates are determined in real-time by the payment service provider</li>
          </ul>

          <h2>12. Contact Us</h2>
          <p>If you have any questions or concerns about these Terms of Service, please contact us:</p>
          <ul>
            <li><strong>Email:</strong> ljia2541@gmail.com</li>
            <li><strong>Business Hours:</strong> Monday to Friday, 9:00-18:00 (UTC+8)</li>
            <li><strong>Response Time:</strong> We will respond to your inquiry within 48 hours</li>
            <li><strong>Supported Languages:</strong> English, Chinese</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}