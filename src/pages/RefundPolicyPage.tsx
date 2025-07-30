import Layout from '../components/layout/Layout';
import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation } from '../contexts/LanguageContext';

const RefundPolicyPage = () => {
  const { loading } = useAsyncTranslation('refund');
  
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
        title="Refund Policy - ColorPages.art"
        description="Learn about ColorPages.art refund policy, including subscription refunds, regional consumer rights, and refund request process."
        canonicalUrl="/refund-policy"
      />
      <Layout>
        <div className="md:max-w-screen-sm lg:max-w-[992px] px-4 sm:px-6 lg:px-8 pb-12 md:pt-6 sm:pb-20 mx-auto">
          <div className="grid gap-4 md:gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-6 dark:text-white">Refund Policy</h1>
              <p className="mb-8 dark:text-neutral-400 text-xl">
                <strong>Effective Date: July 28, 2025</strong>
              </p>
              <p className="mb-8 dark:text-neutral-400 text-xl">
                This Refund Policy applies to all purchases made on ColorPages.art and should be read in conjunction with our Terms of Service and Privacy Policy.
              </p>
              
              <ol>
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">1. General Refund Policy</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">1.1 Default Policy</h3>
                  <p className="mb-5 dark:text-neutral-400">
                    All sales are final unless specifically provided otherwise in this policy or required by applicable consumer protection laws. Digital products and services are generally non-refundable once accessed or used.
                  </p>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">1.2 Processing Method</h3>
                  <p className="mb-5 dark:text-neutral-400">
                    Approved refunds will be processed through the same payment method used for the original purchase (typically PayPal) within 5-10 business days.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">2. Subscription Refunds</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">2.1 Monthly Subscriptions</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Cancellation:</strong> You may cancel your monthly subscription at any time through PayPal or by contacting support</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Effective Date:</strong> Cancellations take effect at the end of your current billing cycle</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Refunds:</strong> Generally, no refunds are provided for partial months of service already rendered</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Exception:</strong> If you experience technical issues that prevent service usage, contact support within 48 hours for potential pro-rated refund consideration</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">2.2 Annual Subscriptions</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Cancellation:</strong> You may cancel your annual subscription at any time</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Refunds:</strong> Pro-rated refunds may be considered on a case-by-case basis for annual subscriptions cancelled within the first 30 days</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Calculation:</strong> Refunds are calculated based on unused months remaining in your subscription period</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">3. Regional Consumer Rights</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">3.1 European Economic Area (EEA) Users</h3>
                  <p className="mb-5 dark:text-neutral-400">Under EU consumer protection laws, you have the right to:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>14-Day Cooling-Off Period:</strong> Cancel digital content purchases within 14 days of purchase</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Condition:</strong> This right is waived once you begin downloading or accessing the digital content</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Process:</strong> Contact support within the 14-day period to request a refund</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Full Refund:</strong> Eligible cancellations receive a complete refund of the purchase price</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">3.2 Other Jurisdictions</h3>
                  <p className="mb-5 dark:text-neutral-400">
                    We comply with applicable consumer protection laws in your jurisdiction. If you believe you have additional rights under local law, please contact us to discuss your specific situation.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">4. Technical Issues & Service Problems</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">4.1 Platform Outages</h3>
                  <p className="mb-5 dark:text-neutral-400">If our service experiences significant downtime or technical issues:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Extended Outages:</strong> Service credits or partial refunds may be provided for outages exceeding 24 hours</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Calculation:</strong> Credits are calculated based on the proportional downtime during your billing period</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Notification:</strong> We will proactively communicate about significant service disruptions</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">4.2 Feature Malfunctions</h3>
                  <p className="mb-5 dark:text-neutral-400">If core features of our service are not functioning properly:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Reporting:</strong> Contact support immediately with details about the issue</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Resolution:</strong> We will work to resolve technical problems within 48-72 hours</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Compensation:</strong> If issues cannot be resolved promptly, refunds or credits may be considered</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">4.3 Account Access Problems</h3>
                  <p className="mb-5 dark:text-neutral-400">If you cannot access your account due to technical issues on our end:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Immediate Support:</strong> Contact us for urgent assistance</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Resolution Timeline:</strong> Account access issues are prioritized for same-day resolution</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Compensation:</strong> Extended access problems may qualify for service credits</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">5. Billing Errors & Unauthorized Charges</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">5.1 Billing Disputes</h3>
                  <p className="mb-5 dark:text-neutral-400">If you believe you've been charged incorrectly:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Report Immediately:</strong> Contact support within 30 days of the charge</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Documentation:</strong> Provide details about the disputed charge</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Investigation:</strong> We will investigate all billing disputes within 5 business days</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Resolution:</strong> Confirmed errors will be refunded promptly</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">5.2 Unauthorized Transactions</h3>
                  <p className="mb-5 dark:text-neutral-400">For unauthorized charges on your account:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Immediate Action:</strong> Contact both ColorPages.art support and your payment provider</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Security Review:</strong> We will review account security and transaction history</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Refund:</strong> Confirmed unauthorized charges will be refunded once verified</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">5.3 Duplicate Charges</h3>
                  <p className="mb-5 dark:text-neutral-400">If you're accidentally charged multiple times:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Automatic Detection:</strong> Our systems monitor for duplicate transactions</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Quick Resolution:</strong> Duplicate charges are typically refunded within 2-3 business days</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Manual Reporting:</strong> Contact support if you notice duplicate charges we haven't caught</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">6. Content & Usage Issues</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">6.1 Content Quality</h3>
                  <p className="mb-5 dark:text-neutral-400">While we strive to provide high-quality AI-generated content:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>No Quality Guarantee:</strong> We cannot guarantee specific artistic outcomes or satisfaction with generated content</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Subjective Nature:</strong> Content quality is subjective and typically not grounds for refunds</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Technical Issues:</strong> If content generation fails due to technical problems, we may provide credits for additional generations</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">6.2 Commercial Usage Disputes</h3>
                  <p className="mb-5 dark:text-neutral-400">If there are questions about commercial usage rights:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Clarification:</strong> Contact support for clarification on usage rights for your subscription tier</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Upgrade Option:</strong> Consider upgrading to a commercial subscription for full usage rights</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>No Retroactive Refunds:</strong> Refunds are not provided for content used beyond your subscription tier's permitted uses</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">7. Refund Request Process</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">7.1 How to Request a Refund</h3>
                  <ol className="pl-10 list-decimal dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Email Support:</strong> Contact <a className="dark:text-white hover:underline" href="mailto:congcong@mail.xinsulv.com">congcong@mail.xinsulv.com</a> with "Refund Request" in the subject line</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Required Information:</strong></p>
                      <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                        <li><p className="mb-5 dark:text-neutral-400">Your account email address</p></li>
                        <li><p className="mb-5 dark:text-neutral-400">Order/transaction ID or date of purchase</p></li>
                        <li><p className="mb-5 dark:text-neutral-400">Reason for refund request</p></li>
                        <li><p className="mb-5 dark:text-neutral-400">Any supporting documentation</p></li>
                      </ul>
                    </li>
                  </ol>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">7.2 Processing Timeline</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Initial Response:</strong> We'll acknowledge your request within 24 hours</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Review Period:</strong> Most refund requests are reviewed within 3-5 business days</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Decision:</strong> You'll receive a decision with explanation within 5-7 business days</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Processing:</strong> Approved refunds are processed within 5-10 business days</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">7.3 Required Documentation</h3>
                  <p className="mb-5 dark:text-neutral-400">Depending on your refund reason, we may request:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Screenshots of technical issues</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Browser/device information for troubleshooting</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">PayPal transaction confirmations</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Evidence of billing errors</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">8. Non-Refundable Situations</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">8.1 Standard Exclusions</h3>
                  <p className="mb-5 dark:text-neutral-400">Refunds are generally not provided for:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Change of Mind:</strong> Simple changes in preference or needs</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Misunderstanding Features:</strong> Not fully understanding service capabilities before purchase</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Competitive Alternatives:</strong> Finding alternative services after purchase</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Partial Usage:</strong> Using the service and then requesting a refund</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Account Violations:</strong> Accounts terminated for Terms of Service violations</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">8.2 Abuse Prevention</h3>
                  <p className="mb-5 dark:text-neutral-400">To prevent refund abuse:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Pattern Monitoring:</strong> We monitor for patterns of refund requests</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Account Restrictions:</strong> Excessive refund requests may result in account limitations</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Investigation:</strong> Suspicious refund patterns will be thoroughly investigated</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">9. Alternative Solutions</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">9.1 Service Credits</h3>
                  <p className="mb-5 dark:text-neutral-400">Instead of cash refunds, we may offer:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Account Credits:</strong> Credits applied to your account for future use</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Extended Service:</strong> Additional service time to compensate for issues</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Feature Upgrades:</strong> Temporary access to premium features</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">9.2 Payment Plan Adjustments</h3>
                  <p className="mb-5 dark:text-neutral-400">For subscription issues:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Plan Changes:</strong> Downgrade or upgrade options</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Billing Cycle Changes:</strong> Switch between monthly and annual billing</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Temporary Suspension:</strong> Pause service instead of cancellation</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">10. PayPal-Specific Policies</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">10.1 PayPal Protection</h3>
                  <p className="mb-5 dark:text-neutral-400">Your purchases are also covered by PayPal's Buyer Protection policies:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Additional Coverage:</strong> PayPal may provide additional refund protections</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Dispute Process:</strong> You can open disputes directly through PayPal</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Resolution:</strong> We work cooperatively with PayPal to resolve disputes</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">10.2 PayPal Refund Processing</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Method:</strong> Refunds are processed back to your PayPal account</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Timeline:</strong> PayPal refunds typically appear within 3-5 business days</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Currency:</strong> Refunds are issued in the original purchase currency</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">11. Contact & Support</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">11.1 Refund Inquiries</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">📧 Email: <a className="dark:text-white hover:underline" href="mailto:congcong@mail.xinsulv.com">congcong@mail.xinsulv.com</a></p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Subject Line: "Refund Request - [Your Issue]"</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Response Time: Within 24 hours</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">11.2 General Support</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">📄 Contact Form: Available through our website footer</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">🌐 Website: <a className="dark:text-white hover:underline" href="https://colorpages.art">https://colorpages.art</a></p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Support Hours: Monday-Friday, 9 AM - 6 PM PST</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">11.3 Escalation Process</h3>
                  <p className="mb-5 dark:text-neutral-400">If you're not satisfied with the initial refund decision:</p>
                  <ol className="pl-10 list-decimal dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Request a review by emailing <a className="dark:text-white hover:underline" href="mailto:congcong@mail.xinsulv.com">congcong@mail.xinsulv.com</a> with "Refund Review" in the subject</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Provide additional context or documentation</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">A senior team member will review your case within 3-5 business days</p></li>
                  </ol>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">12. Policy Updates</h2>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">12.1 Changes to Policy</h3>
                  <p className="mb-5 dark:text-neutral-400">We may update this Refund Policy to reflect:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">Changes in our services or business model</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">New legal requirements</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Improved customer service practices</p></li>
                  </ul>
                  
                  <h3 className="font-semibold mb-2 dark:text-white">12.2 Notification</h3>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Minor Changes:</strong> Updated on website with new effective date</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Significant Changes:</strong> Email notification to active subscribers</p></li>
                    <li><p className="mb-5 dark:text-neutral-400"><strong>Grandfathering:</strong> Existing purchases generally remain subject to the policy in effect at time of purchase</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">13. Legal Compliance</h2>
                  <p className="mb-5 dark:text-neutral-400">This Refund Policy complies with applicable laws in the jurisdictions where we operate, including but not limited to:</p>
                  <ul className="pl-10 list-disc dark:marker:text-neutral-400">
                    <li><p className="mb-5 dark:text-neutral-400">EU Consumer Rights Directive</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">California consumer protection laws</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">Federal Trade Commission (FTC) guidelines</p></li>
                    <li><p className="mb-5 dark:text-neutral-400">PayPal's Terms of Service</p></li>
                  </ul>
                  <p className="mb-5 dark:text-neutral-400">
                    <strong>Last updated: July 28, 2025</strong>
                  </p>
                  <p className="mb-5 dark:text-neutral-400">
                    For questions about this Refund Policy, please contact <a className="dark:text-white hover:underline" href="mailto:congcong@mail.xinsulv.com">congcong@mail.xinsulv.com</a>
                  </p>
                </li>
              </ol>
              
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default RefundPolicyPage;