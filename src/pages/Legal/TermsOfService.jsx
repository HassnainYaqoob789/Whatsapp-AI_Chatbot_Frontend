import React from 'react';
import LegalLayout from './LegalLayout';
import { 
  FileTextOutlined, 
  SafetyCertificateOutlined, 
  StopOutlined, 
  RobotOutlined, 
  SendOutlined, 
  CreditCardOutlined, 
  MailOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const TermsOfService = () => {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="The contractual terms and acceptable use policies governing the access, subscription, and operations of the Naracord.AI WhatsApp Automation Platform."
      lastUpdated="August 03, 2026"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

        {/* Section 1: Agreement */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileTextOutlined style={{ color: '#a855f7' }} /> 1. Agreement to Terms & Contractual Scope
          </h2>
          <p>
            These Terms of Service ("Terms") constitute a legally binding agreement between you (whether an individual or representing a corporate entity, "Client", "You") and <strong>Alisons Technology</strong> ("Company," "we," "us," or "our"), governing your access to and use of the <strong>Naracord.AI</strong> SaaS platform, administrative web applications, WordPress plugins, REST APIs, and automated messaging infrastructure (collectively, the "Platform").
          </p>
          <p>
            By creating an account, onboarding via Meta Embedded Signup, configuring your WhatsApp Business Account (WABA), or installing the Naracord WordPress plugin, you expressly agree to be bound by these Terms and our <a href="/privacy-policy" style={{ color: '#a855f7', fontWeight: 700 }}>Privacy Policy</a>.
          </p>
        </section>

        {/* Section 2: Platform License & Module Capabilities */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <SafetyCertificateOutlined style={{ color: '#6366f1' }} /> 2. SaaS License & Platform Capabilities
          </h2>
          <p>
            Subject to active subscription status and adherence to these Terms, Alisons Technology grants you a commercial, non-exclusive, non-transferable, revocable license to utilize the Platform to:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, margin: '16px 0' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>🤖 AI Conversational Engine</div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                Deploy intelligent AI sales and customer support assistants with custom prompts, knowledge bases, and multi-lingual language mirroring (English & Roman Urdu).
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>📊 Lead Capture & CRM</div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                Automatically identify, parse, and store qualified sales leads with real-time SMTP email dispatch directly to your sales department.
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>📋 Meta Template Manager</div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                Create, validate, submit, and manage Meta-approved WhatsApp marketing, utility, and authentication templates with interactive buttons.
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>📢 Broadcast Campaigns</div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                Execute high-throughput, targeted broadcasts to opted-in audiences with dynamic variable interpolation (e.g. customer name, order number).
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Meta & WhatsApp Messaging Compliance */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <StopOutlined style={{ color: '#ef4444' }} /> 3. WhatsApp Messaging Policy & Anti-Spam Obligations
          </h2>
          <p>
            You agree to strictly comply with the official <strong>Meta Platform Terms</strong> and <strong>WhatsApp Business Messaging Policy</strong>:
          </p>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 22, color: '#991b1b' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px', color: '#991b1b' }}>
              Strictly Prohibited Messaging Practices
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
              <li><strong>Zero Unsolicited Messaging (Spam):</strong> You must obtain verifiable, explicit opt-in consent from end-users before initiating marketing broadcasts.</li>
              <li><strong>Prohibited Industries:</strong> You may not use Naracord.AI to market illegal goods, counterfeit items, unauthorized financial schemes, weapons, or adult content.</li>
              <li><strong>Customer Service Window:</strong> You agree to honor WhatsApp's 24-hour customer service window for session messaging and utilize pre-approved templates for proactive notifications.</li>
              <li><strong>Opt-Out Mechanism:</strong> You must respect user requests to unsubscribe or stop receiving automated communications.</li>
            </ul>
          </div>
          <p style={{ marginTop: 12, fontSize: 14, color: '#64748b' }}>
            Failure to adhere to Meta policies may result in immediate suspension of your WhatsApp phone number tier by Meta Platforms Inc. and permanent termination of your Naracord.AI account without refund.
          </p>
        </section>

        {/* Section 4: AI Output Disclaimers */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <RobotOutlined style={{ color: '#a855f7' }} /> 4. Artificial Intelligence (AI) Output Disclaimers
          </h2>
          <p>
            Naracord.AI leverages state-of-the-art Generative AI to formulate dynamic conversational responses based on the Client's configured system prompt and knowledge instructions.
          </p>
          <ul style={{ paddingLeft: 22, lineHeight: 1.8 }}>
            <li><strong>Automated Natural Language:</strong> AI responses are generated algorithmically. While our system prompt controls maintain high fidelity, AI responses should not be considered legally binding corporate declarations or certified professional advice.</li>
            <li><strong>Client Accountability for Prompts:</strong> The Client maintains total responsibility for the accuracy of pricing, tax compliance statements, discount offers, and company policies provided in their bot prompt.</li>
            <li><strong>Human Agent Fallback:</strong> We strongly advise maintaining human agent oversight for complex commercial negotiations and high-risk client escalations.</li>
          </ul>
        </section>

        {/* Section 5: Multi-Tenant Credentials & SMTP Isolation */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <SendOutlined style={{ color: '#0ea5e9' }} /> 5. Account Security & SMTP Gateway Responsibility
          </h2>
          <p>
            Naracord.AI operates on an isolated multi-tenant architecture:
          </p>
          <ul style={{ paddingLeft: 22, lineHeight: 1.8 }}>
            <li>You are solely responsible for securing your administrative login credentials and Meta access tokens.</li>
            <li>When connecting your custom SMTP server (e.g. DreamHost, Google Workspace, AWS SES), you certify that you possess the lawful authority to utilize that mail server for outgoing lead alert dispatches.</li>
            <li>You agree to notify us immediately at <a href="mailto:info@alisonstech.com" style={{ color: '#a855f7', fontWeight: 600 }}>info@alisonstech.com</a> if you suspect any unauthorized access to your account.</li>
          </ul>
        </section>

        {/* Section 6: Uptime & SLA */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <CreditCardOutlined style={{ color: '#16a34a' }} /> 6. Service Availability, SLA & Limitation of Liability
          </h2>
          <p>
            We target 99.9% uptime for our core message routing engine. However, our services interface directly with upstream third-party providers (including Meta Cloud API, OpenAI/Gemini endpoints, and client mail hosts).
          </p>
          <p>
            To the maximum extent permitted by law, Alisons Technology shall not be liable for any indirect, consequential, or punitive damages (including lost profits, Meta account quality downgrades, or temporary message delivery delays) arising from third-party upstream outages or internet routing failures.
          </p>
        </section>

        {/* Section 7: Termination */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <StopOutlined style={{ color: '#ef4444' }} /> 7. Cancellation & Termination
          </h2>
          <p>
            Clients may terminate their subscription at any time via the admin dashboard. Upon cancellation, access to automated AI webhooks will cease, and stored conversation and lead data will be handled in accordance with our <a href="/data-deletion" style={{ color: '#a855f7', fontWeight: 700 }}>Data Deletion Policy</a>.
          </p>
        </section>

        {/* Section 8: Contact & Legal Desk */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <MailOutlined style={{ color: '#6366f1' }} /> 8. Legal Desk & Corporate Address
          </h2>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16 }}>
              Alisons Technology — Legal & Contracts Department
            </div>
            
            <div style={{ marginTop: 12, color: '#475569', fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <EnvironmentOutlined style={{ color: '#ef4444', marginTop: 3 }} />
              <div>
                <strong>Headquarters Address:</strong><br />
                Office no 201 Plot # A-724 2nd Floor, Block H Street no 11 Sohail Abbas Road North Nazimabad, Karachi, 74600, Pakistan
              </div>
            </div>

            <div style={{ marginTop: 12, color: '#475569', fontSize: 14 }}>
              📧 <strong>Legal & Support Desk:</strong> <a href="mailto:info@alisonstech.com" style={{ color: '#a855f7', fontWeight: 600 }}>info@alisonstech.com</a>
            </div>
            <div style={{ marginTop: 6, color: '#475569', fontSize: 14 }}>
              🌐 <strong>Company Portal:</strong> <a href="https://alisonstech.com" target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>alisonstech.com</a>
            </div>
          </div>
        </section>

      </div>
    </LegalLayout>
  );
};

export default TermsOfService;
