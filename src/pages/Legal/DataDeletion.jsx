import React from 'react';
import LegalLayout from './LegalLayout';
import { 
  DeleteOutlined, 
  CheckCircleOutlined, 
  SafetyOutlined, 
  MailOutlined, 
  SettingOutlined, 
  DatabaseOutlined,
  KeyOutlined,
  CommentOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const DataDeletion = () => {
  return (
    <LegalLayout
      title="User Data Deletion Instructions"
      subtitle="Transparent protocols and step-by-step instructions for WhatsApp subscribers, end-user customers, and SaaS clients to request irreversible data erasure."
      lastUpdated="August 03, 2026"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

        {/* Section 1: Overview */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <SafetyOutlined style={{ color: '#a855f7' }} /> 1. Commitment to Data Subject Erasure
          </h2>
          <p>
            In full compliance with <strong>Meta Platform Data Policies</strong>, <strong>WhatsApp Cloud API Guidelines</strong>, <strong>GDPR Article 17 (Right to Erasure / "Right to be Forgotten")</strong>, and the <strong>California Consumer Privacy Act (CCPA)</strong>, <strong>Naracord.AI</strong> (operated by <strong>Alisons Technology</strong>) provides seamless, automated, and human-verified channels for users to request the permanent deletion of their personal, business, and messaging records.
          </p>
        </section>

        {/* Section 2: Scope of Erasure */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <DatabaseOutlined style={{ color: '#6366f1' }} /> 2. Scope of Data Permanently Purged
          </h2>
          <p>Upon receipt and verification of a data deletion request, the following information is permanently sanitized from active databases and secondary storage:</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, margin: '16px 0' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
              <div style={{ fontWeight: 700, color: '#a855f7', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CommentOutlined style={{ fontSize: 18 }} /> WhatsApp Conversation Logs
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                All inbound customer inquiries, automated AI replies, message timestamps, delivery statuses, and phone number indexes.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
              <div style={{ fontWeight: 700, color: '#6366f1', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <DeleteOutlined style={{ fontSize: 18 }} /> CRM Qualified Leads
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                Customer names, volunteered email addresses, qualification notes, deal values, and historical SMTP notification logs.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
              <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <KeyOutlined style={{ fontSize: 18 }} /> Meta Tokens & Configuration
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                Encrypted Meta API access tokens, Webhook subscriptions, custom system prompts, and client SMTP mail credentials.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Step-by-Step Submission */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <DeleteOutlined style={{ color: '#ef4444' }} /> 3. Step-by-Step Data Erasure Request
          </h2>
          <p>Please select the method appropriate for your user role:</p>

          {/* Option A */}
          <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 14, padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#581c87', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MailOutlined /> Option A: Direct Email Request (For End-User Customers)
            </h3>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#6b21a8' }}>
              If you chatted with an AI assistant on WhatsApp powered by Naracord.AI and want all your records removed:
            </p>
            <ol style={{ margin: 0, paddingLeft: 22, fontSize: 14, color: '#581c87', lineHeight: 1.9 }}>
              <li>
                Send an email to: <a href="mailto:info@alisonstech.com" style={{ fontWeight: 800, color: '#7e22ce' }}>info@alisonstech.com</a>
              </li>
              <li>
                Subject Line: <code>WhatsApp Data Deletion Request - [Your Phone Number]</code>
              </li>
              <li>
                In the body, include your WhatsApp Phone Number (with international country code, e.g. <code>+92 300 1234567</code>).
              </li>
              <li>
                Our compliance team will verify the identifier, permanently sanitize the record, and reply with an official <strong>Deletion Confirmation Receipt & Ticket ID</strong> within <strong>48 hours</strong>.
              </li>
            </ol>
          </div>

          {/* Option B */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <SettingOutlined /> Option B: Instant Self-Service Workspace Purge (For SaaS Clients)
            </h3>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#475569' }}>
              If you are a Client Administrator managing a Naracord workspace:
            </p>
            <ol style={{ margin: 0, paddingLeft: 22, fontSize: 14, color: '#334155', lineHeight: 1.9 }}>
              <li>Log in to your <strong>Naracord.AI Client Dashboard</strong>.</li>
              <li>Go to <strong>Settings</strong> ➔ <strong>Account & WhatsApp Settings</strong>.</li>
              <li>Under the Danger Zone, click <strong>"Disconnect WhatsApp & Delete All Workspace Data"</strong>.</li>
              <li>Confirm the verification prompt. All conversation logs, template caches, leads, and tokens are instantly purged.</li>
            </ol>
          </div>
        </section>

        {/* Section 4: Facebook Login Permission Revocation */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <SafetyOutlined style={{ color: '#0ea5e9' }} /> 4. Revoking Permissions Directly via Meta (Facebook)
          </h2>
          <p>
            If you authorized Naracord.AI using Meta Embedded Signup (Facebook Login for Business) and wish to revoke access directly from your Meta Business Manager:
          </p>
          <ol style={{ paddingLeft: 22, fontSize: 14, lineHeight: 1.8 }}>
            <li>Log into your Facebook account and navigate to <strong>Settings & Privacy</strong> ➔ <strong>Settings</strong>.</li>
            <li>Click on <strong>Business Integrations</strong> (or <strong>Apps and Websites</strong>).</li>
            <li>Find <strong>Naracord AI</strong> (by Alisons Technology) in your active apps list.</li>
            <li>Click <strong>Remove</strong> to permanently sever all webhook subscriptions and access privileges.</li>
          </ol>
        </section>

        {/* Section 5: SLA Guarantee */}
        <section>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <CheckCircleOutlined style={{ fontSize: 32, color: '#16a34a', marginTop: 2 }} />
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#166534', margin: '0 0 6px' }}>
                48-Hour Deletion SLA & Formal Erasure Certificate
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: '#15803d', lineHeight: 1.7 }}>
                All deletion requests are assigned a cryptographically generated tracking ticket. Upon completion, a formal Certificate of Erasure with the exact timestamp is transmitted to the requester for audit and compliance archives.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Contact */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <MailOutlined style={{ color: '#6366f1' }} /> 5. Data Privacy Bureau & Office Location
          </h2>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 22 }}>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16 }}>
              Alisons Technology — Data Protection & Privacy Bureau
            </div>
            
            <div style={{ marginTop: 12, color: '#475569', fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <EnvironmentOutlined style={{ color: '#ef4444', marginTop: 3 }} />
              <div>
                <strong>Office Address:</strong><br />
                Office no 201 Plot # A-724 2nd Floor, Block H Street no 11 Sohail Abbas Road North Nazimabad, Karachi, 74600, Pakistan
              </div>
            </div>

            <div style={{ marginTop: 12, color: '#475569', fontSize: 14 }}>
              📧 <strong>Data Erasure Requests:</strong> <a href="mailto:info@alisonstech.com" style={{ color: '#a855f7', fontWeight: 700 }}>info@alisonstech.com</a>
            </div>
            <div style={{ marginTop: 4, color: '#475569', fontSize: 14 }}>
              ⏱️ <strong>SLA Response Guarantee:</strong> Within 24-48 business hours
            </div>
            <div style={{ marginTop: 4, color: '#475569', fontSize: 14 }}>
              🏢 <strong>Parent Company:</strong> Alisons Technology (<a href="https://alisonstech.com" target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>alisonstech.com</a>)
            </div>
          </div>
        </section>

      </div>
    </LegalLayout>
  );
};

export default DataDeletion;
