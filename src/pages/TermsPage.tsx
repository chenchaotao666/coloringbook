import Layout from '../components/layout/Layout';
import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation } from '../contexts/LanguageContext';

const TermsPage = () => {
  const { loading } = useAsyncTranslation('terms');
  
  // 如果翻译还在加载中，不显示任何内容
  if (loading) {
    return (
      <div className="bg-white min-w-0 overflow-hidden">
        <Layout>
          <div className="w-full min-w-0 flex items-center justify-center min-h-[400px]">
            {/* 加载时不显示任何内容 */}
          </div>
        </Layout>
      </div>
    );
  }
  
  return (
    <div className="bg-white min-w-0 overflow-hidden">
      <SEOHead
        title="Terms of Service - ColorPages.art"
        description="Read the terms of service for ColorPages.art, including usage rights, acceptable use policy, and commercial licensing."
        canonicalUrl="/terms"
      />
      <Layout>
        <div className="md:max-w-screen-sm lg:max-w-[992px] px-4 sm:px-6 lg:px-8 pb-12 md:pt-6 sm:pb-20 mx-auto">
          <div className="grid gap-4 md:gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-6 dark:text-white">Terms of Service</h1>
              <p className="mb-8 dark:text-neutral-400 text-xl">
                <strong>Effective Date: July 28, 2025</strong>
              </p>
              <p className="mb-8 dark:text-neutral-400 text-xl">
                Website: <a className="dark:text-white hover:underline" href="https://colorpages.art">https://colorpages.art</a> (<strong>"Website"</strong>, <strong>"We"</strong>, <strong>"Us"</strong>, <strong>"Our"</strong>)
              </p>
              <p className="mb-8 dark:text-neutral-400 text-xl">
                Please read these Terms of Service (<strong>"Terms"</strong>) carefully before using ColorPages.art. By accessing or using the Website, you agree to be bound by these Terms. If you do not agree, you may not access or use our services.
              </p>
              
              <ol>
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">1. Description of Service</h2>
                  <p className="mb-5 dark:text-neutral-400">
                    ColorPages.art is an AI-powered platform that allows users to generate printable coloring pages from text prompts or uploaded images. The commercial usage rights for generated content depend on your subscription tier as outlined in Section 3.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">2. Eligibility</h2>
                  <p className="mb-5 dark:text-neutral-400">
                    You must be at least 13 years old to use this Website. ColorPages.art is not intended for children under 13. By using this site, you confirm that you meet this requirement.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">3. Commercial Use & Content Licensing</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">3.1 Usage Rights by Tier</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Free Users:</strong> May use generated content for personal, educational, or non-commercial creative purposes only.</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Paid Subscribers:</strong> Are granted full commercial rights to use generated content for resale, merchandise, marketing, publishing, digital products, and any other commercial purposes.</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">3.2 Content You Upload</h3>
                  <p className="mb-5 dark:text-neutral-400">
                    You retain full ownership of any content you upload (e.g., text prompts or images). By uploading content, you grant us a limited, worldwide, non-exclusive license to store, process, and use your content solely to operate and improve our services.
                  </p>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">3.3 Generated Content Privacy</h3>
                  <p className="mb-5 dark:text-neutral-400">When generating content, you may select the "Private" option. When this is selected:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Your content will not be displayed in public galleries</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Your content will not be used for promotional purposes on our website or social media</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Your content will not be shared publicly in any way</p></li>
                  </ul>
                  <p className="mb-5 dark:text-neutral-400">
                    If you do not select the "Private" option, you grant us permission to display your generated works in our galleries, on social media, or in marketing materials to showcase platform capabilities.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">4. Acceptable Use Policy</h2>
                  <p className="mb-5 dark:text-neutral-400">You agree not to upload, create, or share content that:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Violates copyright or intellectual property rights</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Contains unlawful, offensive, hateful, explicit, or violent material</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Exploits or harms minors in any way</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Invades privacy or misleads users</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Uses the platform to harm or exploit others</p></li>
                  </ul>
                  <p className="mb-5 dark:text-neutral-400">You also agree not to:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Reverse engineer or interfere with the platform's infrastructure</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Use automated tools (e.g., bots, scrapers) to extract content or overload our services</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Attempt to circumvent usage limitations or security measures</p></li>
                  </ul>
                  <p className="mb-5 dark:text-neutral-400">
                    We reserve the right to remove violating content and suspend or terminate accounts without prior notice for violations of these rules.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">5. Intellectual Property</h2>
                  <p className="mb-5 dark:text-neutral-400">
                    All materials on ColorPages.art—excluding user-uploaded content and AI-generated results—are the property of ColorPages.art or its licensors, including but not limited to:
                  </p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Website design, interface, and user experience elements</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Software code, AI models, and underlying technology</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Logos, trademarks, brand assets, and proprietary text content</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Templates, graphics, and design elements</p></li>
                  </ul>
                  <p className="mb-5 dark:text-neutral-400">
                    You may not use, reproduce, modify, or repurpose these materials without our express written permission.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">6. Payment, Subscriptions & Refund Policy</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">6.1 Pricing & Payment</h3>
                  <p className="mb-5 dark:text-neutral-400">
                    Some features require payment. All prices are clearly disclosed at the point of purchase. Payments are securely processed via third-party services (PayPal).
                  </p>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">6.2 Subscriptions</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Subscriptions automatically renew unless cancelled</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">You can cancel or modify your subscription through PayPal or by contacting support</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Cancellation takes effect at the end of your current billing period</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">6.3 Refund Policy</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>General Policy:</strong> All sales are final unless required otherwise by applicable consumer protection laws</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>European Economic Area (EEA) Users:</strong> May request a refund within 14 days if digital content hasn't been accessed or downloaded</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Technical Issues:</strong> If you experience technical problems or believe you've been incorrectly charged, contact <a className="dark:text-white hover:underline" href="mailto:support@colorpages.art">support@colorpages.art</a></p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">7. Dispute Resolution</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">7.1 Arbitration Agreement</h3>
                  <p className="mb-5 dark:text-neutral-400">
                    In the event of any dispute between you and ColorPages.art, we agree to resolve the issue through binding arbitration rather than in court, except where prohibited by law.
                  </p>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">7.2 Arbitration Terms</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">You agree to waive any right to participate in class action lawsuits</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Arbitration will be conducted in English under the rules of the American Arbitration Association (AAA)</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">The venue for arbitration shall be California, USA, unless both parties agree otherwise</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Each party bears their own costs unless the arbitrator decides otherwise</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">8. Indemnification</h2>
                  <p className="mb-5 dark:text-neutral-400">
                    You agree to indemnify, defend, and hold harmless ColorPages.art, its affiliates, employees, and service providers from any claims, damages, liabilities, or expenses (including reasonable legal fees) arising from:
                  </p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Your use of the Website or violation of these Terms</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Your content uploads or generated outputs</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Your violation of applicable laws or third-party rights</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Infringement of intellectual property rights of others</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">9. Limitation of Liability</h2>
                  <p className="mb-5 dark:text-neutral-400">To the fullest extent permitted by law:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">ColorPages.art is provided "as is" without warranties of any kind</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">We do not guarantee the service will be uninterrupted, error-free, or meet your specific requirements</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">We are not liable for any indirect, incidental, consequential, or punitive damages</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Our total liability to you shall not exceed the amount paid by you (if any) in the 12 months preceding the claim</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Some jurisdictions do not allow limitation of liability, so these limits may not apply to you</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">10. Service Availability & Termination</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">10.1 Service Changes</h3>
                  <p className="mb-5 dark:text-neutral-400">
                    We reserve the right to modify, suspend, or discontinue any aspect of our service at any time, with or without notice.
                  </p>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">10.2 Account Termination</h3>
                  <p className="mb-5 dark:text-neutral-400">We may suspend or terminate your access at any time, without prior notice, if we determine that you have:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Violated these Terms</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Posed a risk to our users, systems, or reputation</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Engaged in fraudulent or abusive behavior</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">11. Governing Law & Jurisdiction</h2>
                  <p className="mb-5 dark:text-neutral-400">
                    These Terms are governed by and construed in accordance with the laws of the State of California, USA, without regard to its conflict of law provisions. Any legal action not subject to arbitration shall be brought exclusively in the courts of California.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">12. Changes to Terms</h2>
                  <p className="mb-5 dark:text-neutral-400">
                    We may revise these Terms periodically to reflect changes in our services, legal requirements, or business practices. The latest version will always be posted on this page with the effective date clearly displayed. Continued use of the Website after changes constitutes your acceptance of the updated Terms.
                  </p>
                  <p className="mb-5 dark:text-neutral-400">
                    For significant changes that materially affect your rights, we will provide additional notice via email (if you're subscribed) or through a prominent notice on our website.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">13. Miscellaneous</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">13.1 Entire Agreement</h3>
                  <p className="mb-5 dark:text-neutral-400">
                    These Terms, together with our Privacy Policy, constitute the entire agreement between you and ColorPages.art.
                  </p>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">13.2 Severability</h3>
                  <p className="mb-5 dark:text-neutral-400">
                    If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
                  </p>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">13.3 No Waiver</h3>
                  <p className="mb-5 dark:text-neutral-400">
                    Our failure to enforce any provision of these Terms does not constitute a waiver of that provision.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">14. Contact Us</h2>
                  <p className="mb-5 dark:text-neutral-400">For questions, feedback, or legal concerns, please reach out:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">📧 Email: <a className="dark:text-white hover:underline" href="mailto:congcong@mail.xinsulv.com">congcong@mail.xinsulv.com</a></p></li>
                    <li><p className="mb-5 dark:text-neutral-400">📄 Contact Form: Available through our website footer</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">🌐 Website: <a className="dark:text-white hover:underline" href="https://colorpages.art">https://colorpages.art</a></p></li>
                  </ul>
                  <p className="mb-5 dark:text-neutral-400"><strong>Last updated: July 28, 2025</strong></p>
                </li>
              </ol>
              
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default TermsPage;