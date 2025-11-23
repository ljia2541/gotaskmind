import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            We're here to help with any questions about GoTaskMind
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                For general inquiries, support, or feedback, send us an email.
              </p>
              <Button asChild className="w-full">
                <a href="mailto:ljia2541@gmail.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Response Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Business Hours:</strong> Monday-Friday, 9:00-18:00 (UTC+8)</li>
                <li><strong>Response Time:</strong> Within 48 hours</li>
                <li><strong>Languages:</strong> English, Chinese</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">How do I get started with GoTaskMind?</h3>
                <p className="text-muted-foreground">
                  Simply sign up with your Google account and start describing your projects.
                  Our AI will help you break them down into manageable tasks.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept various payment methods through Creem, including credit cards,
                  debit cards, and other local payment options depending on your region.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Can I cancel my subscription anytime?</h3>
                <p className="text-muted-foreground">
                  Yes, you can cancel your Pro subscription at any time. You'll continue
                  to have access to Pro features until the end of your current billing period.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Is my data secure?</h3>
                <p className="text-muted-foreground">
                  We take data security seriously and use industry-standard encryption
                  and security measures to protect your information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            For technical issues, account problems, or partnership inquiries,
            please include detailed information in your email so we can assist you better.
          </p>
        </div>
      </div>
    </div>
  );
}