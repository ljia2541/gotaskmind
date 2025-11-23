import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Privacy Policy Page
 */
export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p>Last updated: October 2024</p>

          <h2>1. Introduction</h2>
          <p>Welcome to GoTaskMind. We highly value your privacy and are committed to protecting your personal information. This Privacy Policy is designed to help you understand how we collect, use, store, and protect your information, and the rights you have regarding this information.</p>

          <h2>2. Information We Collect</h2>
          <h3>2.1 Personal Information</h3>
          <ul>
            <li><strong>Account Information:</strong> When you use your Google account to log in, we may collect your name, email address, and profile picture.</li>
            <li><strong>Payment Information:</strong> Necessary payment information collected through Creem for payment processing (such as payment methods, billing addresses, etc.).</li>
          </ul>

          <h3>2.2 Usage Data</h3>
          <ul>
            <li><strong>Service Usage Data:</strong> We may collect data about how you use our services, such as pages and features you access.</li>
            <li><strong>Subscription Data:</strong> Your subscription plans, payment history, service usage statistics, and related information.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use your information primarily for:</p>
          <ul>
            <li>Providing, maintaining, and improving our services</li>
            <li>Processing your account registration and authentication</li>
            <li>Processing subscription payments and billing management</li>
            <li>Providing customer support and services</li>
            <li>Ensuring service security and integrity</li>
            <li>Sending important service notifications and updates</li>
          </ul>

          <h2>4. Data Storage and Protection</h2>
          <p>We employ industry-standard security measures to protect your personal information from unauthorized access, use, or disclosure. Your information is retained only as long as necessary to achieve the purposes described in this Privacy Policy.</p>

          <h2>5. Third-Party Services</h2>
          <h3>5.1 Authentication Services</h3>
          <p>We use Google OAuth for authentication. By using our services, you agree that Google will process your information according to its privacy policy.</p>

          <h3>5.2 Payment Processing</h3>
          <p>We use Creem as our payment service provider to process all payment transactions. When you make a purchase:</p>
          <ul>
            <li>Your payment information is sent directly to Creem for secure processing</li>
            <li>We do not store your complete credit card or payment account information</li>
            <li>Creem will process your payment data according to its privacy policy</li>
            <li>After transaction completion, we only receive necessary transaction confirmation information (such as payment status, amount, etc.)</li>
          </ul>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access, correct, or delete your personal information</li>
            <li>View and manage your subscription settings</li>
            <li>Request deletion of payment-related data (within legal limits)</li>
            <li>Withdraw consent to data processing</li>
            <li>Data portability rights</li>
          </ul>
          <p>If you wish to exercise these rights, please contact us.</p>

          <h2>7. Data Retention</h2>
          <p>We retain your personal information only as long as necessary:</p>
          <ul>
            <li><strong>Account Information:</strong> While you use our services and for a reasonable period thereafter</li>
            <li><strong>Payment Records:</strong> Typically retained for 7 years as required by law for accounting and tax purposes</li>
            <li><strong>Usage Data:</strong> Used for analysis and service improvement, typically retained for 24 months</li>
          </ul>

          <h2>8. International Data Transfers</h2>
          <p>As a global service, we may transfer your data across borders:</p>
          <ul>
            <li>Data is stored on secure cloud servers that comply with international standards</li>
            <li>We implement appropriate safeguards for international data transfers</li>
            <li>EU users' data is protected under GDPR requirements</li>
            <li>We ensure equivalent protection regardless of where your data is processed</li>
          </ul>

          <h2>9. Cookies and Tracking</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul>
            <li>Remember your preferences and settings</li>
            <li>Analyze service usage and improve user experience</li>
            <li>Ensure service security and prevent fraud</li>
            <li>Provide personalized content and recommendations</li>
          </ul>

          <h2>10. Children's Privacy</h2>
          <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will delete it immediately.</p>

          <h2>11. Changes</h2>
          <p>We may update this Privacy Policy from time to time. When we make significant changes, we will notify you by posting the updated Privacy Policy on our website.</p>

          <h2>12. Contact Us</h2>
          <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
          <ul>
            <li><strong>Email:</strong> ljia2541@gmail.com</li>
            <li><strong>Business Hours:</strong> Monday to Friday, 9:00-18:00 (UTC+8)</li>
            <li><strong>Response Time:</strong> We will respond to your inquiry within 48 hours</li>
            <li><strong>Supported Languages:</strong> English, Chinese</li>
          </ul>

          <h2>13. Regional Legal References</h2>
          <h3>13.1 GDPR Rights (EU Users)</h3>
          <p>If you are located in the European Union, you have the following rights under GDPR:</p>
          <ul>
            <li>Right to access your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
          </ul>

          <h3>13.2 CCPA Rights (California Users)</h3>
          <p>If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA):</p>
          <ul>
            <li>Right to know what personal information is collected</li>
            <li>Right to delete personal information</li>
            <li>Right to opt-out of sale of personal information</li>
            <li>Right to non-discrimination for exercising privacy rights</li>
          </ul>

          <h2>14. Security Measures</h2>
          <p>We implement appropriate technical and organizational measures to protect your information:</p>
          <ul>
            <li>SSL/TLS encryption for data transmission</li>
            <li>Secure cloud storage with regular backups</li>
            <li>Access controls and authentication systems</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Employee training on data protection</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}