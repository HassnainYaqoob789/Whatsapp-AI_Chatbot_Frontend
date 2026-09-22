import React from 'react';
import LegalLayout from './LegalLayout';
import { 
  SafetyCertificateOutlined, 
  RobotOutlined, 
  MailOutlined, 
  LockOutlined, 
  ApiOutlined, 
  CheckCircleOutlined, 
  FileDoneOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const PrivacyPolicy = () => {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Enterprise Data Protection, WhatsApp Cloud API Compliance, and Multi-Tenant Privacy Standards for Naracord AI."
      lastUpdated="August 03, 2026"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

        {/* Section 1: Introduction */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <SafetyCertificateOutlined style={{ color: '#a855f7' }} /> 1. Introduction & Executive Commitment
          </h2>
          <p>
            Welcome to <strong>Naracord.AI</strong> ("Platform", "we", "us", or "our"), an enterprise Multi-Tenant WhatsApp AI Automation, Lead Qualification, and Customer Engagement SaaS platform engineered and operated by <strong>Alisons Technology</strong> ("Company").
          </p>
          <p>
            This Privacy Policy governs the manner in which Naracord.AI collects, stores, processes, protects, and discloses personal, business, and messaging data collected from:
          </p>
          <ul style={{ paddingLeft: 22, margin: '10px 0' }}>
            <li><strong>SaaS Clients ("Clients"):</strong> Businesses, merchants, and enterprises utilizing our platform, web application, and WordPress plugin.</li>
            <li><strong>End-Users ("Customers"):</strong> Individuals communicating with our Clients via the official WhatsApp Business Cloud API.</li>
          </ul>
          <p>
            We operate in strict compliance with the <strong>Meta Platform Terms</strong>, <strong>WhatsApp Business Messaging Policy</strong>, <strong>General Data Protection Regulation (GDPR)</strong>, <strong>California Consumer Privacy Act (CCPA)</strong>, and global data privacy standards.
          </p>
        </section>

        {/* Section 2: Platform Architecture & Information We Collect */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ApiOutlined style={{ color: '#6366f1' }} /> 2. Information Collected Across Platform Modules
          </h2>
          <p>
            Naracord.AI processes information strictly necessary to fulfill automated customer engagement, AI sales qualification, template management, and broadcast dispatching:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 16 }}>
            {/* Box A */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                A. Client SaaS Administrative Data & Credentials
              </h3>
              <p style={{ margin: '0 0 8px', fontSize: 14, color: '#475569' }}>
                To set up and isolate your multi-tenant workspace, we collect:
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#334155', lineHeight: 1.7 }}>
                <li>Client Organization Name, Admin Email, Encrypted Password, and Assigned Role (Super Admin / Client Admin).</li>
                <li>Meta WhatsApp Business Account (WABA) ID, Phone Number ID, and securely encrypted Meta API Access Tokens.</li>
                <li>Client-dedicated SMTP Relay Configuration (SMTP Host, Port, Username, SSL/TLS preferences, and Encrypted Password).</li>
                <li>Custom AI System Prompts, Knowledge Base Guidelines, Target Offer Details, and Mirroring Rules (e.g. Roman Urdu / English).</li>
              </ul>
            </div>

            {/* Box B */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                B. WhatsApp End-User Conversations & Webhooks
              </h3>
              <p style={{ margin: '0 0 8px', fontSize: 14, color: '#475569' }}>
                When customers interact with your WhatsApp business number, incoming Meta Webhooks transmit:
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#334155', lineHeight: 1.7 }}>
                <li>Sender Phone Number (in E.164 international format) and WhatsApp Profile Display Name.</li>
                <li>Inbound Message Content (text inquiries, quick reply button clicks, interactive list selections).</li>
                <li>Message Metadata: Delivery timestamps, read receipts, and Meta message IDs.</li>
              </ul>
            </div>

            {/* Box C */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                C. Qualified Leads & Real-Time CRM Records
              </h3>
              <p style={{ margin: '0 0 8px', fontSize: 14, color: '#475569' }}>
                When the AI Sales Consultant identifies high purchase intent, it autonomously structures:
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#334155', lineHeight: 1.7 }}>
                <li>Customer Name, Contact Number, Email Address, Business Nature, and Specific Inquired Service.</li>
                <li>Lead Status categorization (New, Contacted, Qualified, Closed) and estimated Deal Value.</li>
                <li>Real-time SMTP Email notification logs dispatched to the Client's sales team.</li>
              </ul>
            </div>

            {/* Box D */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                D. WordPress Plugin & Broadcast Marketing Data
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#334155', lineHeight: 1.7 }}>
                <li>Approved Meta WhatsApp Templates (Header, Body with dynamic variables, Footer, and Quick Reply/URL Buttons).</li>
                <li>Opted-in broadcast recipient lists and delivery success/failure logs.</li>
                <li>WordPress plugin REST API handshake tokens for seamless catalog synchronization.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Purpose of Processing */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThunderboltOutlined style={{ color: '#eab308' }} /> 3. How We Use Collected Data
          </h2>
          <p>We process data strictly under lawful, contractual, and legitimate business grounds:</p>
          <ul style={{ paddingLeft: 22, lineHeight: 1.8 }}>
            <li><strong>AI Conversational Intelligence:</strong> Utilizing advanced LLMs to provide real-time, 24/7 intelligent answers, dynamic language mirroring (Roman Urdu & English), and objection handling.</li>
            <li><strong>Instant Lead Dispatching:</strong> Sending automated, beautifully formatted HTML email alerts via the Client's isolated SMTP credentials whenever a hot lead is captured.</li>
            <li><strong>Template & Broadcast Delivery:</strong> Routing Meta-approved transactional receipts, appointment reminders, and promotional broadcasts.</li>
            <li><strong>Security & Authentication:</strong> Validating JWT tokens, preventing unauthorized multi-tenant data access, and enforcing Meta API rate limits.</li>
          </ul>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 16, marginTop: 12 }}>
            <strong style={{ color: '#166534' }}>🛡️ Strict Zero Data Selling Guarantee:</strong>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#15803d' }}>
              Naracord.AI and Alisons Technology NEVER sell, monetize, broker, or rent any customer data, phone numbers, or conversation transcripts to advertisers or third-party brokers under any circumstances.
            </p>
          </div>
        </section>

        {/* Section 4: AI Model Privacy & Non-Training Guarantee */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <RobotOutlined style={{ color: '#a855f7' }} /> 4. AI Processing & Zero Model Training Policy
          </h2>
          <p>
            Our AI engine integrates enterprise-grade Large Language Models (OpenAI / Google Gemini). We maintain strict commercial data isolation agreements with our AI infrastructure providers:
          </p>
          <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 12, padding: 20 }}>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#581c87', lineHeight: 1.8 }}>
              <li><strong>NO Training on Your Data:</strong> Customer chat messages, company trade secrets, and leads are <strong>NEVER used to train, retrain, or improve foundational public AI models</strong>.</li>
              <li><strong>Ephemeral Processing:</strong> Inbound prompts are processed in-memory solely to generate the immediate contextual reply.</li>
              <li><strong>Zero Permanent Storage by AI Providers:</strong> AI inference queries are processed through zero-data-retention enterprise endpoints.</li>
            </ul>
          </div>
        </section>

        {/* Section 5: Multi-Tenant Security & Isolation */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <LockOutlined style={{ color: '#ef4444' }} /> 5. Multi-Tenant Data Isolation & Security Architecture
          </h2>
          <p>
            Naracord.AI employs multi-layered architectural safeguards to ensure total privacy between different businesses:
          </p>
          <ul style={{ paddingLeft: 22, lineHeight: 1.8 }}>
            <li><strong>Strict Database Partitioning:</strong> Every database query is scoped to the verified <code>clientId</code>. No Client can view or access another Client's leads, chats, or settings.</li>
            <li><strong>Credential Sanitization:</strong> Meta access tokens, SMTP passwords, and AI API keys are masked and automatically stripped from administrative JSON API responses.</li>
            <li><strong>End-to-End Encryption:</strong> All communications between Meta Webhooks, our backend servers, and web clients utilize TLS 1.3 / SSL 256-bit encryption.</li>
            <li><strong>Role-Based Access Control (RBAC):</strong> Granular permissions separating Super Admin management from Client Admin workspace controls.</li>
          </ul>
        </section>

        {/* Section 6: Third-Party Sub-Processors */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileDoneOutlined style={{ color: '#0ea5e9' }} /> 6. Authorized Third-Party Sub-Processors
          </h2>
          <p>We work exclusively with certified, compliant infrastructure sub-processors:</p>
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Sub-Processor</th>
                  <th style={{ padding: '12px 16px' }}>Service Function</th>
                  <th style={{ padding: '12px 16px' }}>Compliance Standards</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>Meta Platforms, Inc.</td>
                  <td style={{ padding: '12px 16px' }}>Official WhatsApp Cloud API & Webhook Dispatcher</td>
                  <td style={{ padding: '12px 16px' }}>SOC 2, SOC 3, GDPR, Meta Platform Terms</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>OpenAI / Google Cloud</td>
                  <td style={{ padding: '12px 16px' }}>AI Natural Language Processing & Lead Qualification</td>
                  <td style={{ padding: '12px 16px' }}>SOC 2 Type II, ISO 27001, GDPR Compliant</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>Client Designated SMTP (e.g. DreamHost)</td>
                  <td style={{ padding: '12px 16px' }}>Lead Notification Email Delivery Relay</td>
                  <td style={{ padding: '12px 16px' }}>SSL / TLS Encrypted SMTP Gateway</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 7: User Rights & Data Deletion */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircleOutlined style={{ color: '#16a34a' }} /> 7. Data Subject Rights & Deletion Guarantee
          </h2>
          <p>
            In accordance with GDPR (Articles 15-22) and CCPA, users retain full autonomy over their personal data:
          </p>
          <ul style={{ paddingLeft: 22, lineHeight: 1.8 }}>
            <li><strong>Right to Access & Export:</strong> Request a complete JSON or CSV export of all captured leads and chat records.</li>
            <li><strong>Right to Rectification:</strong> Update inaccurate business profile information or lead contact details.</li>
            <li><strong>Right to Erasure ("Right to Be Forgotten"):</strong> Request immediate and irreversible sanitization of all WhatsApp chat transcripts and lead records.</li>
          </ul>
          <p>
            To initiate an instant data deletion request, please visit our official <a href="/data-deletion" style={{ color: '#a855f7', fontWeight: 700 }}>User Data Deletion Center</a> or email <a href="mailto:info@alisonstech.com" style={{ color: '#6366f1', fontWeight: 600 }}>info@alisonstech.com</a>.
          </p>
        </section>

        {/* Section 8: Contact & Office Details */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <MailOutlined style={{ color: '#6366f1' }} /> 8. Data Protection & Corporate Inquiries
          </h2>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16 }}>
              Alisons Technology — Compliance & Operations Desk
            </div>
            
            <div style={{ marginTop: 12, color: '#475569', fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <EnvironmentOutlined style={{ color: '#ef4444', marginTop: 3 }} />
              <div>
                <strong>Physical Office Address:</strong><br />
                Office no 201 Plot # A-724 2nd Floor, Block H Street no 11 Sohail Abbas Road North Nazimabad, Karachi, 74600, Pakistan
              </div>
            </div>

            <div style={{ marginTop: 12, color: '#475569', fontSize: 14 }}>
              📧 <strong>Privacy, Legal & Support Email:</strong> <a href="mailto:info@alisonstech.com" style={{ color: '#a855f7', fontWeight: 600 }}>info@alisonstech.com</a>
            </div>
            
            <div style={{ marginTop: 6, color: '#475569', fontSize: 14 }}>
              🌐 <strong>Official Website:</strong> <a href="https://alisonstech.com" target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>alisonstech.com</a>
            </div>
          </div>
        </section>

      </div>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
