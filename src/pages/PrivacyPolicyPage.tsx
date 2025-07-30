import Layout from '../components/layout/Layout';
import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation } from '../contexts/LanguageContext';

const PrivacyPolicyPage = () => {
  const { loading } = useAsyncTranslation('privacy');
  
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
        title="Privacy Policy - ColorPages.art"
        description="Learn how ColorPages.art collects, uses, and protects your personal information when you use our AI coloring page generator."
        canonicalUrl="/privacy-policy"
      />
      <Layout>
        <div className="md:max-w-screen-sm lg:max-w-[992px] px-4 sm:px-6 lg:px-8 pb-12 md:pt-6 sm:pb-20 mx-auto">
          <div className="grid gap-4 md:gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-6 dark:text-white">Privacy Policy</h1>
              <p className="mb-8 dark:text-neutral-400 text-xl">
                <strong>Effective Date: July 28, 2025</strong>
              </p>
              <p className="mb-8 dark:text-neutral-400 text-xl">
                Welcome to ColorPages.art (<strong>"we,"</strong> <strong>"us,"</strong> or <strong>"our"</strong>). This Privacy Policy explains how we collect, use, share, and protect your personal information when you register, log in, generate coloring pages, or otherwise interact with our platform.
              </p>
              
              <ol>
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">1. Changes to This Policy</h2>
                  <p className="mb-5 dark:text-neutral-400">
                    We may update this Privacy Policy as our services evolve or laws change. When we do, we will update the Effective Date at the top. Significant changes will be communicated via email (if you're subscribed) or through a prominent notice on our website. Continued use of our services after such notices implies acceptance of the revised policy.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">2. Information We Collect</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">2.1 Information You Provide</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Account Registration:</strong> Email address, username/display name, encrypted password</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Social Login Data:</strong> If you log in through Google, Facebook, etc., we may receive limited profile information (name, email, avatar)</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Generation Inputs:</strong> Text prompts and metadata about your generations (original uploaded images are processed but not permanently stored)</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>User Communications:</strong> Feedback, inquiries, support messages, and survey responses</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Payment Information:</strong> Processed via PayPal (we receive confirmation details but do not store credit card information)</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">2.2 Automatically Collected Data</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Usage Analytics:</strong> IP address, device type, browser information, pages visited, clickstream data, timestamps, and session duration</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Performance Data:</strong> Error logs, load times, feature usage patterns</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Referral Data:</strong> Information about how you found our website (referral links, search terms, marketing campaigns)</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">2.3 Cookies & Tracking Technologies</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Essential Cookies:</strong> Required for basic website functionality, account management, and security</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Analytics Cookies:</strong> Google Analytics and similar tools to understand usage patterns and improve our service</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Preference Cookies:</strong> Remember your settings and preferences</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Marketing Cookies:</strong> Track effectiveness of advertising campaigns (with your consent)</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">2.4 Third-Party Data</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Social Login Providers:</strong> Profile information shared when you log in via social media</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Payment Processors:</strong> Transaction confirmations and subscription status from PayPal</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Referral Programs:</strong> Attribution data for commission tracking</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">3. How We Use Your Information</h2>
                  <p className="mb-5 dark:text-neutral-400">We use your data to:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Provide Core Services:</strong> Generate coloring pages, manage your account, and deliver requested features</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Improve Our Platform:</strong> Analyze usage patterns, fix bugs, develop new features, and optimize performance</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Customer Support:</strong> Respond to inquiries, troubleshoot issues, and provide technical assistance</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Account Management:</strong> Process payments, manage subscriptions, and handle referral programs</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Communications:</strong> Send transactional notifications, service updates, and newsletters (with consent)</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Security & Fraud Prevention:</strong> Protect against unauthorized access, abuse, and fraudulent activity</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Legal Compliance:</strong> Meet regulatory requirements and respond to legal requests</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Marketing:</strong> Showcase user-generated content (with permission) and improve our marketing efforts</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">4. Content Privacy & Commercial Rights</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">4.1 Generated Content Privacy</h3>
                  <p className="mb-5 dark:text-neutral-400">When creating coloring pages, you may select the "Private" option. When selected:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Your content will NOT appear in public galleries</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Your content will NOT be used for promotional purposes</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Your content will NOT be shared on social media or marketing materials</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Your content remains accessible only to you</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">4.2 Public Content</h3>
                  <p className="mb-5 dark:text-neutral-400">If you do not select "Private," you grant us permission to:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Display your generated works in our public galleries</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Share examples on social media and marketing materials</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Use your content to showcase platform capabilities</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">4.3 Commercial Usage Rights</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Free Users:</strong> Generated content may only be used for personal, educational, or non-commercial purposes</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Paid Subscribers:</strong> Have full commercial rights to use generated content for any purpose, including resale and merchandise</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Content Ownership:</strong> You retain full ownership and copyright of all generated coloring pages</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">4.4 AI Training</h3>
                  <p className="mb-5 dark:text-neutral-400">We do NOT use user-generated content or prompts to train our AI models or any other machine learning systems.</p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">5. Information Sharing & Disclosure</h2>
                  <p className="mb-5 dark:text-neutral-400">We will never sell your personal data. We may share information only in these limited circumstances:</p>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">5.1 With Your Consent</h3>
                  <p className="mb-5 dark:text-neutral-400">When you explicitly agree to share specific information.</p>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">5.2 Service Providers</h3>
                  <p className="mb-5 dark:text-neutral-400">We work with trusted third-party providers who help us operate our service:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Analytics:</strong> Google Analytics for usage statistics</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Payments:</strong> PayPal for subscription processing</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Infrastructure:</strong> Cloud hosting and content delivery services</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Email:</strong> Services for transactional emails and newsletters (with consent)</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Customer Support:</strong> Tools to manage and respond to user inquiries</p></li>
                  </ul>
                  <p className="mb-5 dark:text-neutral-400">All service providers are bound by strict confidentiality agreements and may only use your data as instructed by us.</p>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">5.3 Legal Requirements</h3>
                  <p className="mb-5 dark:text-neutral-400">We may disclose information when required by law, such as:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Responding to court orders, subpoenas, or government requests</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Protecting our legal rights or defending against legal claims</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Preventing fraud, security threats, or harm to users</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Complying with regulatory obligations</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">5.4 Business Transfers</h3>
                  <p className="mb-5 dark:text-neutral-400">In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction. We will notify users of any such changes.</p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">6. Cookies & Your Choices</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">6.1 Cookie Consent</h3>
                  <p className="mb-5 dark:text-neutral-400">When you first visit our website, we'll ask for your consent to use non-essential cookies. You can:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Accept all cookies</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Accept only essential cookies</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Customize your preferences</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Withdraw consent at any time through our cookie settings</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">6.2 Managing Cookies</h3>
                  <p className="mb-5 dark:text-neutral-400">You can control cookies through:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Our cookie preference center (accessible in the website footer)</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Your browser settings (though this may impact website functionality)</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Third-party opt-out tools for analytics and advertising cookies</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">6.3 Impact of Declining Cookies</h3>
                  <p className="mb-5 dark:text-neutral-400">Declining non-essential cookies may affect:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Website performance and user experience</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Our ability to remember your preferences</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Analytics that help us improve our service</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">7. Data Retention & Deletion</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">7.1 Retention Periods</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Account Data:</strong> Stored while your account is active</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Generated Content:</strong> Stored indefinitely while your account exists (unless deleted by you)</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Usage Analytics:</strong> Aggregated data may be retained longer for business insights</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Inactive Accounts:</strong> May be archived or deleted after 24 months of inactivity (with prior notice)</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">7.2 Data Deletion</h3>
                  <p className="mb-5 dark:text-neutral-400">You can request deletion of your data by:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Contacting us at <a className="dark:text-white hover:underline" href="mailto:congcong@mail.xinsulv.com">congcong@mail.xinsulv.com</a></p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Using account deletion tools (when available)</p></li>
                  </ul>
                  <p className="mb-5 dark:text-neutral-400">We will delete your data within 30 days of a valid request, except:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Information we're legally required to retain</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Aggregated, anonymized analytics data</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Data necessary for ongoing legal matters</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">8. Children's Privacy (COPPA Compliance)</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">8.1 Age Requirements</h3>
                  <p className="mb-5 dark:text-neutral-400">Our service is intended for users 13 and older. We do not knowingly collect personal information from children under 13.</p>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">8.2 Verified Parental Consent</h3>
                  <p className="mb-5 dark:text-neutral-400">If we become aware that we've collected information from a child under 13, we will:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Seek verifiable parental consent before further processing</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Delete the information if consent is not obtained</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Provide parents with access to their child's information</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">8.3 Enhanced Privacy for Minors</h3>
                  <p className="mb-5 dark:text-neutral-400">For users under 18:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Marketing communications are disabled by default</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Enhanced privacy settings are applied</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Tracking for advertising purposes is restricted</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">8.4 Parental Rights</h3>
                  <p className="mb-5 dark:text-neutral-400">Parents can:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Request access to their child's information</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Request correction or deletion of data</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Withdraw consent for data processing</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Contact us at <a className="dark:text-white hover:underline" href="mailto:congcong@mail.xinsulv.com">congcong@mail.xinsulv.com</a> for any concerns</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">9. International Users & Data Transfers</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">9.1 Data Processing Location</h3>
                  <p className="mb-5 dark:text-neutral-400">Your information may be processed and stored in the United States or other countries where our service providers operate. These countries may have different data protection laws than your country of residence.</p>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">9.2 European Users (GDPR)</h3>
                  <p className="mb-5 dark:text-neutral-400">If you're in the European Economic Area, you have additional rights under GDPR:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Right to Access:</strong> Request a copy of your personal data</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Right to Rectification:</strong> Correct inaccurate information</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Right to Erasure:</strong> Request deletion of your data</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Right to Portability:</strong> Receive your data in a portable format</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Right to Restrict Processing:</strong> Limit how we use your data</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Right to Object:</strong> Object to certain data processing activities</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">9.3 California Users (CCPA)</h3>
                  <p className="mb-5 dark:text-neutral-400">California residents have rights including:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Right to Know:</strong> What personal information we collect and how it's used</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Right to Delete:</strong> Request deletion of personal information</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Right to Opt-Out:</strong> Opt out of sale of personal information (note: we don't sell personal data)</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">10. Security Measures</h2>
                  <p className="mb-5 dark:text-neutral-400">We implement industry-standard security measures to protect your information:</p>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">10.1 Technical Safeguards</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Encryption of data in transit and at rest</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Secure servers and database access controls</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Regular security audits and vulnerability assessments</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Multi-factor authentication for administrative access</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">10.2 Operational Safeguards</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Employee access controls and training</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Regular security policy reviews</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Incident response procedures</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Data backup and recovery systems</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">10.3 Your Security Responsibilities</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Use strong, unique passwords</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Keep your login credentials confidential</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Report suspicious activity immediately</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Keep your browser and devices updated</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">11. Your Rights & Choices</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">11.1 Account Management</h3>
                  <p className="mb-5 dark:text-neutral-400">You can:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Update your profile information</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Change privacy settings</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Delete generated content</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Cancel your subscription</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">11.2 Communication Preferences</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Opt out of marketing emails (unsubscribe links provided)</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Adjust notification settings in your account</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Contact us to update communication preferences</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">11.3 Data Requests</h3>
                  <p className="mb-5 dark:text-neutral-400">To exercise your rights:</p>
                  <ol className="pl-10 list-decimal dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Email us at <a className="dark:text-white hover:underline" href="mailto:congcong@mail.xinsulv.com">congcong@mail.xinsulv.com</a></p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Include your account email and specific request</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">We may request identity verification for security</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">We'll respond within 30 days (or as required by law)</p></li>
                  </ol>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">11.4 No Discrimination</h3>
                  <p className="mb-5 dark:text-neutral-400">We will not discriminate against you for exercising your privacy rights. Your access to our service will not be affected by your privacy choices.</p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">12. Third-Party Links & Services</h2>
                  <p className="mb-5 dark:text-neutral-400">Our website may contain links to third-party websites or integrate with external services. This Privacy Policy applies only to ColorPages.art. We encourage you to review the privacy policies of any third-party services you use.</p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">13. Contact Us & Data Protection Officer</h2>
                  <p className="mb-5 dark:text-neutral-400">For privacy-related questions, concerns, or requests:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">📧 Primary Contact: <a className="dark:text-white hover:underline" href="mailto:congcong@mail.xinsulv.com">congcong@mail.xinsulv.com</a></p></li>
                    <li><p className="mb-5 dark:text-neutral-400">📄 Contact Form: Available through our website footer</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">🌐 Website: <a className="dark:text-white hover:underline" href="https://colorpages.art">https://colorpages.art</a></p></li>
                  </ul>
                  <p className="mb-5 dark:text-neutral-400">For European users, you also have the right to lodge a complaint with your local data protection authority.</p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">14. Effective Date & Document History</h2>
                  <p className="mb-5 dark:text-neutral-400">This Privacy Policy is effective as of July 28, 2025. Previous versions and their effective dates are available upon request.</p>
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

export default PrivacyPolicyPage;