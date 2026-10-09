import React, { useState, useEffect, useContext } from 'react';
import { Card, Form, Input, Button, Typography, message, Spin, Alert, Tooltip, Modal, Select, Switch } from 'antd';
import { SaveOutlined, SettingOutlined, ThunderboltOutlined, MailOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import axiosConfig from '../../utils/axiosConfig';
import { AuthContext } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const ClientSettings = ({ clientId }) => {
  const { user } = useContext(AuthContext);
  const channels = user?.clientChannels || { whatsapp: true, discord: false };
  const hasWhatsapp = channels.whatsapp;

  const [form] = Form.useForm();
  const [wizardForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isWizardVisible, setIsWizardVisible] = useState(false);

  useEffect(() => {
    fetchMySettings();
  }, [clientId]);

  const fetchMySettings = async () => {
    try {
      setFetching(true);
      const res = await axiosConfig.get('/clients/me/settings');
      if (res.data.success) {
        const c = res.data.client;
        form.setFieldsValue({
          systemPrompt:          c.systemPrompt,
          leadNotificationEmail: c.leadNotificationEmail,
          useNaracordQuota:      c.useNaracordQuota !== false,
          aiModel:               c.aiModel || 'gpt-4o-mini',
          aiApiKey:              '',
          smtpHost:              c.smtpHost     || '',
          smtpPort:              c.smtpPort     || 465,
          smtpUser:              c.smtpUser     || '',
          smtpPassword:          '',
          smtpFrom:              c.smtpFrom     || '',
          phoneNumberId:         c.phoneNumberId || '',
          wabaId:                c.wabaId || '',
          whatsappToken:         '',
          welcomeMessage:        c.welcomeMessage || '',
          welcomeButtons:        (c.welcomeButtons && c.welcomeButtons.length > 0) ? c.welcomeButtons : [{ id: 'btn_1', title: '' }, { id: 'btn_2', title: '' }, { id: 'btn_3', title: '' }],
          externalApiUrl:        c.externalApiUrl || '',
          externalApiKey:        c.externalApiKey || '',
          leadCaptureFields:     c.leadCaptureFields || [],
        });
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to load settings");
    } finally {
      setFetching(false);
    }
  };

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      // Don't overwrite sensitive fields with empty strings
      if (!values.smtpPassword)  delete values.smtpPassword;
      if (!values.aiApiKey)      delete values.aiApiKey;
      if (!values.whatsappToken) delete values.whatsappToken;
      if (!values.externalApiKey) delete values.externalApiKey;

      // Filter out empty welcome buttons (only send buttons with actual titles)
      if (values.welcomeButtons) {
        values.welcomeButtons = values.welcomeButtons
          .filter(b => b && b.title && b.title.trim())
          .map((b, i) => ({ id: b.id || `btn_${i + 1}`, title: b.title.trim() }));
      }

      const res = await axiosConfig.put('/clients/me/settings', values);
      if (res.data.success) {
        message.success('Settings updated successfully!');
        // Clear password fields after save
        form.setFieldsValue({ smtpPassword: '', aiApiKey: '', whatsappToken: '' });
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleTestSmtp = async () => {
    try {
      setTestingSmtp(true);
      const values = form.getFieldsValue();
      const payload = {
        smtpHost: values.smtpHost,
        smtpPort: values.smtpPort,
        smtpUser: values.smtpUser,
        smtpPassword: values.smtpPassword,
        smtpFrom: values.smtpFrom,
        testRecipient: values.leadNotificationEmail || values.smtpUser
      };

      const res = await axiosConfig.post('/clients/me/test-smtp', payload);
      if (res.data.success) {
        message.success(res.data.message || 'Test email sent successfully!');
      } else {
        message.error(res.data.message || 'Failed to send test email');
      }
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'SMTP Connection Failed. Please check your credentials.');
    } finally {
      setTestingSmtp(false);
    }
  };

  const loadPromptTemplate = (type) => {
    let template = "";
    if (type === 'general') {
      template = `You are a helpful and polite AI sales assistant for [YOUR BUSINESS NAME].

KNOWLEDGE BASE:
- We provide [Service 1] starting at [Price].
- We provide [Service 2] starting at [Price].
- Our office hours are Monday to Friday, 9 AM to 6 PM.
- Our office is located at [Address].

RULES:
1. Always be polite, professional, and welcoming.
2. Keep your answers short (maximum 2 to 3 sentences).
3. If a user asks for something outside of the knowledge base, politely say you don't have that information and offer to connect them with a human agent.
4. If the user shows strong interest, ask for their Name and Email to schedule a call.`;
    } else if (type === 'real_estate') {
      template = `You are a professional real estate AI assistant for [AGENCY NAME]. Your goal is to qualify leads and book site visits.

KNOWLEDGE BASE:
- Project A: 2-Bed Apartments in DHA, Price: 2.5 Crore PKR.
- Project B: 5-Marla Commercial Plots in Bahria Town, Price: 80 Lac PKR.
- We offer 3-year easy installment plans.
- Down payment is 20%.

RULES:
1. Always greet the user warmly.
2. Keep your replies very concise and easy to read. Use bullet points if necessary.
3. Never invent prices or projects.
4. Try to find out the user's budget and preferred location.
5. Once they show interest, ask them: "Would you like our senior agent to call you for a free consultation?"`;
    } else if (type === 'ecommerce') {
      template = `You are a friendly customer support AI for [STORE NAME], an online store selling [SHOES/CLOTHING/ELECTRONICS].

KNOWLEDGE BASE:
- We offer free shipping on all orders over [Amount].
- Delivery takes 3 to 5 working days nationwide.
- We offer a 7-day return and exchange policy.
- Best selling item: [Product Name] for [Price].

RULES:
1. Be enthusiastic and use emojis sparingly.
2. Keep your replies under 3 sentences.
3. If someone asks for order tracking, tell them to provide their Order ID.
4. If a customer is angry or wants a refund, apologize and say "Let me transfer you to our human support team immediately."`;
    }

    form.setFieldsValue({ systemPrompt: template });
    message.success("Template loaded! Don't forget to edit the brackets [ ] with your real details.");
  };

  const generateWizardPrompt = (values) => {
    const { businessName, agentName, industry, knowledge, goal, contact } = values;

    let goalInstruction = "";
    if (goal === 'lead') {
      goalInstruction = `### 4. LEAD GENERATION FUNNEL (STRICT RULES)
If a user shows interest, strictly follow this:
- STEP 1: Politely ask for their contact information: "Certainly! I'd be happy to assist you. Please provide your Name and Phone Number." (Or equivalent in Roman Urdu if the user is typing in Roman Urdu).
- STEP 2: Wait for their reply.
- STEP 3: Once they provide details, acknowledge warmly: "Thank you! Our team will contact you shortly."
  CRITICAL: You MUST append a hidden data tag at the very end exactly like this: [[LEAD_DATA: CustomerName | CustomerPhone | ]]`;
    } else if (goal === 'support') {
      goalInstruction = `### 4. SUPPORT PROTOCOL
- Your primary goal is to resolve the user's issue quickly based on the KNOWLEDGE BASE.
- Do not push for sales unless the user explicitly asks to buy something.
- Empathize with the customer if they are facing a problem.`;
    } else if (goal === 'booking') {
      goalInstruction = `### 4. BOOKING/APPOINTMENT FUNNEL
If the user wants to book, follow this:
- STEP 1: Ask for their preferred Date and Time.
- STEP 2: Ask for their Name and Phone Number.
- STEP 3: Confirm the booking and append: [[LEAD_DATA: CustomerName | CustomerPhone | BookingTime]]`;
    }

    const masterPrompt = `You are "${agentName}", the professional AI Assistant at "${businessName}" (${industry}).
Your ultimate goal is to assist customers and provide exceptional support.

### 1. YOUR IDENTITY & TONE (CRITICAL)
- Be extremely professional, polite, and persuasive.
- Keep your messages SHORT and PUNCHY. WhatsApp users prefer concise messages. Maximum 2-3 short paragraphs per reply.
- ALWAYS use clean bullet points (-) and WhatsApp-native bolding (*text*) for emphasis. Do not use Markdown (**text**).
- STRICT LANGUAGE MIRRORING: You MUST reply in the EXACT SAME LANGUAGE as the user's LATEST message (English or Roman Urdu).
- ROMAN URDU RULES: If communicating in Roman Urdu, use standard conversational Pakistani Roman Urdu ("main", "shukriya", "foran").
- ONLY introduce yourself in the VERY FIRST message. Do not repeat long greetings in subsequent replies.

### 2. CORE KNOWLEDGE BASE (STRICTLY ADHERE TO THIS)
${knowledge}

### 3. BOUNDARIES & ESCALATION
- Do not answer off-topic questions. Politely bring the conversation back to ${businessName}.
- If a user asks a highly technical or complicated question you do not know, say: "For detailed assistance regarding this inquiry, please contact our team at: ${contact}"
- NEVER hallucinate or invent prices/products that are not in the knowledge base.

${goalInstruction}

You are highly intelligent, and your only focus is ${businessName}'s success.`;

    form.setFieldsValue({ systemPrompt: masterPrompt });
    setIsWizardVisible(false);
    message.success("Master Prompt Generated successfully! You can review and tweak it before saving.");
  };

  if (fetching) return <div style={{ textAlign: 'center', padding: 50 }}><Spin /></div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SettingOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={3} style={{ margin: 0 }}>Profile & AI Settings</Title>
        </div>
        {hasWhatsapp && (
          <Button 
            type="primary" 
            size="large" 
            icon={<span style={{ fontSize: 18 }}>📱</span>} 
            onClick={() => window.location.href = '/client/meta-connect'}
            style={{ background: '#25D366', borderColor: '#25D366', fontWeight: 600, boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)' }}
          >
            Connect WhatsApp Meta
          </Button>
        )}
      </div>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Alert
          message="AI Personality & Knowledge Base (Brain of your AI)"
          description={
            <div>
              <p style={{ marginBottom: 8 }}>The System Prompt is how you train your AI. A good prompt has 3 parts:</p>
              <ol style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li><b>Role:</b> Who is the AI? (e.g. "You are an assistant for Naracord")</li>
                <li><b>Knowledge:</b> What are your prices, services, and timings?</li>
                <li><b>Rules:</b> How should the AI behave? (e.g. "Keep answers under 2 lines, be polite")</li>
              </ol>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ marginRight: 12 }}>Need a starting point?</Text>
          <Tooltip title="Answer a few simple questions to automatically generate a master-level AI prompt">
            <Button type="primary" size="small" icon={<ThunderboltOutlined />} onClick={() => setIsWizardVisible(true)} style={{ marginRight: 12, background: '#722ed1', borderColor: '#722ed1' }}>
              ✨ Guided AI Setup Wizard
            </Button>
          </Tooltip>
          <Text type="secondary" style={{ marginRight: 12 }}>Or load basic template:</Text>
          <Tooltip title="Click to load a standard prompt for service-based businesses">
            <Button size="small" onClick={() => loadPromptTemplate('general')} style={{ marginRight: 8 }}>General</Button>
          </Tooltip>
          <Tooltip title="Click to load a prompt tailored for property sales and site visits">
            <Button size="small" onClick={() => loadPromptTemplate('real_estate')} style={{ marginRight: 8 }}>Real Estate</Button>
          </Tooltip>
          <Tooltip title="Click to load a prompt for online stores, tracking, and refunds">
            <Button size="small" onClick={() => loadPromptTemplate('ecommerce')}>E-commerce</Button>
          </Tooltip>
        </div>

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="systemPrompt"
            label={<Text strong>AI System Prompt (Write your instructions here)</Text>}
            rules={[{ required: true, message: 'System prompt cannot be empty!' }]}
          >
            <Input.TextArea
              rows={14}
              placeholder="You are an AI assistant for..."
              style={{ fontFamily: 'monospace', fontSize: 14 }}
            />
          </Form.Item>

          {hasWhatsapp && (
            <>
              <Form.Item
                name="leadNotificationEmail"
                label={<Text strong>Lead Notification Email</Text>}
                extra="Email address where new captured leads will be sent."
              >
                <Input type="email" placeholder="admin@business.com" size="large" />
              </Form.Item>

              <div style={{ marginBottom: 24, padding: 16, background: '#f8f9fa', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <Title level={5} style={{ marginTop: 0, color: '#0f172a' }}>Dynamic Lead Capture Fields (SaaS)</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  Define custom fields you want the AI to capture from the user before closing a lead (e.g. Budget, City). 
                  The AI will automatically ask for these, and they will be included in the email notification.
                </Text>
                
                <Form.List name="leadCaptureFields">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <div key={key} style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'center' }}>
                          <Form.Item
                            {...restField}
                            name={[name, 'label']}
                            style={{ margin: 0, flex: 1 }}
                            rules={[{ required: true, message: 'Missing label' }]}
                          >
                            <Input placeholder="Label (e.g. Project Budget)" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'key']}
                            style={{ margin: 0, flex: 1 }}
                            rules={[{ required: true, message: 'Missing key' }]}
                          >
                            <Input placeholder="Key (e.g. project_budget)" />
                          </Form.Item>
                          <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ef4444', fontSize: 18 }} />
                        </div>
                      ))}
                      <Form.Item style={{ margin: 0, marginTop: 12 }}>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          Add Custom Lead Field
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </div>
            </>
          )}

          {hasWhatsapp && (
            <>
              <div style={{ padding: '10px 14px', background: '#f0fdf4', borderLeft: '4px solid #22c55e', borderRadius: '4px', marginBottom: '24px' }}>
                <Text style={{ color: '#166534', fontSize: '13px' }}>
                  <strong>📱 WhatsApp Connection:</strong> You no longer need to update Meta API keys manually. 
                  If your WhatsApp disconnects, simply use the <strong>"Connect with Meta"</strong> button in your dashboard to securely re-link your account.
                </Text>
              </div>

              {/* ── Manual Meta Credentials (Advanced/Fallback) ── */}
              <div style={{
                background: '#fafafa',
                border: '1px solid #d9d9d9',
                borderRadius: 12,
                padding: '20px 24px',
                marginBottom: 24,
                marginTop: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>🔑</span>
                  <Text strong style={{ fontSize: 15 }}>Manual Meta Credentials (Advanced)</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
                  If you generated your Permanent Token and IDs manually via the Meta Developer Portal, you can enter them here to override the automated connection.
                </Text>
                
                <div style={{ display: 'flex', gap: 16 }}>
                  <Form.Item name="phoneNumberId" label="Phone Number ID" style={{ flex: 1 }}>
                    <Input placeholder="e.g. 1301346903068753" size="large" />
                  </Form.Item>
                  <Form.Item name="wabaId" label="WABA ID" style={{ flex: 1 }}>
                    <Input placeholder="e.g. 1111648884706447" size="large" />
                  </Form.Item>
                </div>
                
                <Form.Item name="whatsappToken" label="Permanent Access Token" extra="Leave blank to keep your current token.">
                  <Input.Password placeholder="EAAG..." size="large" />
                </Form.Item>
              </div>
            </>
          )}

          {/* ── AI Quota & BYOK ── */}
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 12,
            padding: '20px 24px',
            marginBottom: 24,
            marginTop: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>🤖</span>
              <Text strong style={{ fontSize: 15 }}>AI Engine & Settings</Text>
            </div>
            
            <Form.Item
              name="useNaracordQuota"
              valuePropName="checked"
              style={{ marginBottom: 12 }}
            >
              <Switch checkedChildren="Managed Engine" unCheckedChildren="Custom API Key" />
            </Form.Item>
            
            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.useNaracordQuota !== currentValues.useNaracordQuota}>
              {({ getFieldValue, setFieldsValue }) => {
                const useNaracordQuota = getFieldValue('useNaracordQuota');
                if (useNaracordQuota) {
                  // Force to default if Naracord quota enabled
                  setFieldsValue({ aiModel: 'gpt-4o-mini' });
                }
                
                return (
                  <div style={{ marginTop: 16 }}>
                    <Form.Item name="aiModel" label="AI Brain Engine" style={{ marginBottom: 16 }}>
                      <Select size="large" disabled={useNaracordQuota}>
                        <Select.Option value="gpt-4o-mini">OpenAI GPT-4o Mini (Default)</Select.Option>
                        <Select.Option value="gpt-4o">OpenAI GPT-4o</Select.Option>
                        <Select.Option value="gemini-flash">Google Gemini Flash</Select.Option>
                      </Select>
                    </Form.Item>
                    
                    {useNaracordQuota ? (
                      <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
                        You are currently using <b>Naracord AI Managed Engine</b>. The AI Brain is fully managed, hosted, and optimized for your business.
                      </Text>
                    ) : (
                      <div style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #fcd34d' }}>
                        <Text type="warning" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                          <b>Bring Your Own Key (BYOK):</b> You have selected Custom API Key. Provide your own API Key below to power the chatbot.
                        </Text>
                        <Form.Item
                          name="aiApiKey"
                          label="Your API Key"
                          extra="Leave blank to keep current key."
                          style={{ marginBottom: 0 }}
                        >
                          <Input.Password placeholder="sk-... or Gemini Key" size="large" />
                        </Form.Item>
                      </div>
                    )}
                  </div>
                );
              }}
            </Form.Item>
          </div>

          {/* ── Welcome Menu Configuration ── */}
          {hasWhatsapp && (
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: 12,
              padding: '20px 24px',
              marginBottom: 24,
              marginTop: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>💬</span>
                <Text strong style={{ fontSize: 15 }}>Welcome Menu (First Message Auto-Reply)</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
                When a new customer sends their first message (Hi, Hello, etc.), the bot will automatically send an interactive message with quick-reply buttons.
                Customize the welcome text and up to 3 buttons below. Leave empty to use defaults.
              </Text>

              <Form.Item 
                name="welcomeMessage" 
                label="Welcome Message" 
                extra="The greeting text shown above the buttons. Use *text* for bold. Leave blank for default."
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder={`e.g. Welcome to *Your Business*! 👋\n\nHow can we help you today?`}
                  maxLength={1024}
                  showCount
                />
              </Form.Item>

              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Quick Reply Buttons (Max 3, each max 20 characters)</Text>
              <Form.List name="welcomeButtons">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <Form.Item {...restField} name={[name, 'id']} hidden initialValue={`btn_${index + 1}`}>
                          <Input />
                        </Form.Item>
                        <Form.Item 
                          {...restField} 
                          name={[name, 'title']} 
                          style={{ flex: 1, marginBottom: 0 }}
                          rules={[{ max: 20, message: 'Max 20 characters' }]}
                        >
                          <Input placeholder={`Button ${index + 1} label (e.g. Learn More)`} size="large" maxLength={20} />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined style={{ color: '#ff4d4f', fontSize: 18, cursor: 'pointer' }} onClick={() => remove(name)} />
                        )}
                      </div>
                    ))}
                    {fields.length < 3 && (
                      <Button type="dashed" onClick={() => add({ id: `btn_${fields.length + 1}`, title: '' })} block icon={<PlusOutlined />} style={{ marginTop: 4 }}>
                        Add Button
                      </Button>
                    )}
                  </>
                )}
              </Form.List>
            </div>
          )}

          {/* ── Universal API / Webhook Integration ── */}
          {hasWhatsapp && (
            <div style={{
              background: '#faf5ff',
              border: '1px solid #e9d5ff',
              borderRadius: 12,
              padding: '20px 24px',
              marginBottom: 24,
              marginTop: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>🔗</span>
                <Text strong style={{ fontSize: 15 }}>Universal API & Webhook (SaaS Integration)</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
                Connect your own backend software to this Chatbot. Instruct the AI to collect specific fields and trigger this API. The Chatbot will forward the structured data to your URL securely.
              </Text>

              <div style={{ display: 'flex', gap: 16 }}>
                <Form.Item name="externalApiUrl" label="External API Endpoint (URL)" style={{ flex: 2 }}
                  extra="e.g. https://api.yoursoftware.com/api/chatbot-onboard">
                  <Input placeholder="https://..." size="large" />
                </Form.Item>
                <Form.Item name="externalApiKey" label="API Secret Key" style={{ flex: 1 }}
                  extra="Sent in headers as 'x-chatbot-api-key'">
                  <Input.Password placeholder="Enter your secret key" size="large" />
                </Form.Item>
              </div>
            </div>
          )}

          {/* ── Email Notification SMTP ── */}
          {hasWhatsapp && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '20px 24px',
              marginBottom: 24,
              marginTop: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>📧</span>
                <Text strong style={{ fontSize: 15 }}>Email Notification SMTP</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
                Configure your custom business domain SMTP server so lead notification emails are delivered directly from your own company email address.
              </Text>

              <div style={{ display: 'flex', gap: 16 }}>
                <Form.Item name="smtpHost" label="SMTP Host" style={{ flex: 2 }}
                  extra="e.g. mail.yourdomain.com or smtp.yourdomain.com">
                  <Input placeholder="mail.yourdomain.com" size="large" />
                </Form.Item>
                <Form.Item name="smtpPort" label="SMTP Port" style={{ flex: 1 }}>
                  <Select size="large">
                    <Select.Option value={465}>465 (SSL)</Select.Option>
                    <Select.Option value={587}>587 (TLS)</Select.Option>
                    <Select.Option value={25}>25 (Plain)</Select.Option>
                  </Select>
                </Form.Item>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <Form.Item name="smtpUser" label="SMTP Username / Email" style={{ flex: 1 }}>
                  <Input placeholder="notifications@yourdomain.com" size="large" />
                </Form.Item>
                <Form.Item
                  name="smtpPassword"
                  label="SMTP Password"
                  style={{ flex: 1 }}
                  extra="Your domain email account password"
                >
                  <Input.Password placeholder="Enter SMTP password" size="large" />
                </Form.Item>
              </div>

              <Form.Item name="smtpFrom" label='From Address / Sender Header'
                extra='Sender display name and email. e.g. "Your Business <notifications@yourdomain.com>"'
                style={{ marginBottom: 16 }}>
                <Input placeholder="Your Business <notifications@yourdomain.com>" size="large" />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
                <Button
                  type="dashed"
                  onClick={handleTestSmtp}
                  loading={testingSmtp}
                  icon={<MailOutlined />}
                >
                  🧪 Send Test Email
                </Button>
              </div>
            </div>
          )}

          <Form.Item style={{ marginTop: 32, marginBottom: 0, textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={loading} style={{ background: 'var(--gradient-primary)', border: 'none' }}>
              Save AI Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Guided Wizard Modal */}
      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ThunderboltOutlined style={{ color: '#722ed1' }} /> Smart Prompt Builder</div>}
        open={isWizardVisible}
        onCancel={() => setIsWizardVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Alert
          message="Let's build your AI's brain!"
          description="Fill out these simple details about your business. We will generate a highly professional, master-level system prompt for you automatically."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Form form={wizardForm} layout="vertical" onFinish={generateWizardPrompt}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="businessName" label="Business Name" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input placeholder="e.g. Ali Garments" size="large" />
            </Form.Item>
            <Form.Item name="agentName" label="AI Agent Name" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input placeholder="e.g. Sara, Rehan, Assistant" size="large" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="industry" label="Industry Type" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Select size="large" placeholder="Select Industry">
                <Option value="E-commerce / Retail">E-commerce / Retail</Option>
                <Option value="Real Estate">Real Estate</Option>
                <Option value="Software / IT">Software / IT</Option>
                <Option value="Travel / Tourism">Travel / Tourism</Option>
                <Option value="Restaurant / Food">Restaurant / Food</Option>
                <Option value="Education / Institute">Education / Institute</Option>
                <Option value="Other Services">Other Services</Option>
              </Select>
            </Form.Item>
            <Form.Item name="goal" label="Primary AI Goal" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Select size="large" placeholder="What should the AI do?">
                <Option value="lead">Generate Leads (Ask Name/Phone)</Option>
                <Option value="booking">Book Appointments</Option>
                <Option value="support">Customer Support (Answer queries)</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="knowledge" label="Core Knowledge (Products, Services, Prices, Rules)" rules={[{ required: true }]}>
            <Input.TextArea
              rows={5}
              placeholder="e.g. We sell T-shirts for Rs. 1000. Delivery takes 3 days. Return policy is 7 days. Free shipping on orders over Rs. 3000."
            />
          </Form.Item>

          <Form.Item name="contact" label="Human Contact (For Escalation)" rules={[{ required: true }]}>
            <Input placeholder="e.g. 0300-1234567 or support@example.com" size="large" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: 24, marginBottom: 0 }}>
            <Button onClick={() => setIsWizardVisible(false)} style={{ marginRight: 12 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#722ed1', borderColor: '#722ed1' }}>
              Generate Prompt
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default ClientSettings;
