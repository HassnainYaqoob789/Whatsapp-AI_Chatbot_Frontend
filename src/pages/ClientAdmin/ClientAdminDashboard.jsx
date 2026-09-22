import React, { useContext, useEffect, useState, useRef } from 'react';
import { Layout, Menu, Button, List, Avatar, Input, Typography, message, Table, Tag, Modal, Form, Select, Space, Card, Statistic, Popconfirm, Switch, Tooltip, Row, Col, Spin, Progress, Dropdown, Upload } from 'antd';
import { LogoutOutlined, MessageOutlined, BarChartOutlined, FileTextOutlined, UserOutlined, SendOutlined, PlusOutlined, DeleteOutlined, RobotOutlined, UserSwitchOutlined, RiseOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, ThunderboltOutlined, TeamOutlined, PhoneOutlined, FireOutlined, SettingOutlined, NotificationOutlined, MenuOutlined, DownOutlined, ArrowLeftOutlined, PaperClipOutlined } from '@ant-design/icons';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/axiosConfig';
import { io } from 'socket.io-client';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import ClientSettings from './ClientSettings';
import BroadcastManager from './BroadcastManager';
import AutoReplies from './AutoReplies';
import { NaracordLogo, NaracordIcon } from '../../components/NaracordLogo';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const ClientAdminDashboard = () => {
  const { logout, user } = useContext(AuthContext);
  const [activeMenu, setActiveMenu] = useState('inbox');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ────── SOCKET ──────
  const [socket, setSocket] = useState(null);

  // ────── INBOX STATE ──────
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatDetails, setChatDetails] = useState(null);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [manualMessage, setManualMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Pagination for chat history
  const [chatPage, setChatPage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(false);
  const [loadingMoreChats, setLoadingMoreChats] = useState(false);

  // Send Template Modal (inside Inbox)
  const [isSendTemplateModalVisible, setIsSendTemplateModalVisible] = useState(false);
  const [sendTemplateForm] = Form.useForm();
  const [availableTemplates, setAvailableTemplates] = useState([]);
  // Variable support for Send Template modal
  const [sendTplVars, setSendTplVars] = useState([]);
  const [sendTplVarValues, setSendTplVarValues] = useState({});
  const [sendTplPreview, setSendTplPreview] = useState('');
  // Labels extracted from template examples — { 1: "Customer Name", 2: "Discount" }
  const [sendTplVarLabels, setSendTplVarLabels] = useState({});

  // ────── LEADS STATE ──────
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  // ────── TEMPLATES STATE ──────
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [isCreateTemplateModalVisible, setIsCreateTemplateModalVisible] = useState(false);
  const [createTemplateForm] = Form.useForm();
  // Dynamic buttons builder state — each button: { type, text, url, phone_number }
  const [templateButtons, setTemplateButtons] = useState([]);
  // Variable labels for create form — { 1: "Customer Name", 2: "Discount", ... }
  const [varLabels, setVarLabels] = useState({});

  // ────── ANALYTICS STATE ──────
  const [analytics, setAnalytics] = useState([]);
  const [quota, setQuota] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [country, setCountry] = useState('Pakistan'); // New state for dynamic pricing

  // ═══════════════════════════════════════════
  //  SOCKET.IO SETUP
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (user && user.clientId) {
      const socketUrl = api.defaults.baseURL.replace(/\/api\/?$/, '') || 'http://localhost:9999';
      const newSocket = io(socketUrl);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('join-client-room', user.clientId);
      });

      newSocket.on('chat-updated', (data) => {
        fetchChats(false);
        if (data.phone === selectedChat) {
          loadChatHistory(data.phone, 1, false, false);
        }
      });

      // ── Polling fallback when socket disconnects ──
      let pollInterval = null;
      newSocket.on('disconnect', () => {
        console.warn('Socket disconnected — falling back to 10s polling');
        pollInterval = setInterval(() => fetchChats(false), 10000);
      });
      newSocket.on('connect', () => {
        // Clear polling once socket reconnects
        if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
        newSocket.emit('join-client-room', user.clientId);
      });

      return () => {
        if (pollInterval) clearInterval(pollInterval);
        newSocket.close();
      };
    }
  }, [user]);

  // Handle active chat updates smoothly without closure stale state
  const activeChatRef = useRef(selectedChat);
  useEffect(() => {
    activeChatRef.current = selectedChat;
  }, [selectedChat]);

  // Second listener removed to prevent double-firing


  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [chatDetails]);

  // ═══════════════════════════════════════════
  //  DATA FETCHING
  // ═══════════════════════════════════════════

  const fetchChats = async (showLoading = true) => {
    if (showLoading) setChatsLoading(true);
    try {
      const response = await api.get('/chatbot/chats');
      setChats(response.data.chats || []);
    } catch (error) {
      console.error("Failed to load inbox", error);
    } finally {
      if (showLoading) setChatsLoading(false);
    }
  };

  const loadChatHistory = async (phone, page = 1, append = false, showLoading = true) => {
    try {
      if (!append) setSelectedChat(phone);
      if (append) setLoadingMoreChats(true);

      const response = await api.get(`/chatbot/chats/${phone}?page=${page}&limit=50`);
      const { chat, pagination } = response.data;

      if (append) {
        setChatDetails(prev => ({
          ...prev,
          messages: [...chat.messages, ...prev.messages] // prepend older messages
        }));
      } else {
        setChatDetails(chat);
      }

      if (pagination) {
        setChatPage(pagination.page);
        setHasMoreChats(pagination.hasMore);
      }
    } catch (error) {
      message.error("Failed to load chat history");
    } finally {
      if (append) setLoadingMoreChats(false);
    }
  };

  const fetchLeads = async () => {
    setLeadsLoading(true);
    try {
      const response = await api.get('/chatbot/leads');
      setLeads(response.data.leads || []);
    } catch (error) {
      console.error("Failed to load leads");
    } finally {
      setLeadsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const response = await api.get('/chatbot/templates');
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error("Failed to load templates");
    } finally {
      setTemplatesLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [analyticsRes, quotaRes, settingsRes] = await Promise.all([
        api.get('/chatbot/analytics'),
        api.get('/chatbot/quota').catch(() => ({ data: { quota: null } })),
        api.get('/clients/me/settings').catch(() => ({ data: { client: { country: 'Pakistan' } } }))
      ]);
      setAnalytics(analyticsRes.data.analytics || []);
      if (quotaRes.data?.quota) setQuota(quotaRes.data.quota);
      if (settingsRes.data?.client?.country) setCountry(settingsRes.data.client.country);
    } catch (error) {
      console.error("Failed to load analytics or quota");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    // Check origin to redirect Plugin users
    const checkOrigin = async () => {
      try {
        const res = await api.get('/clients/me/settings');
        if (res.data?.client?.origin === 'PLUGIN') {
          window.location.href = '/client/meta-connect';
        }
      } catch (err) {
        console.error("Failed to fetch client profile");
      }
    };
    checkOrigin();
  }, []);

  useEffect(() => {
    if (activeMenu === 'inbox') fetchChats();
    if (activeMenu === 'leads') fetchLeads();
    if (activeMenu === 'templates') fetchTemplates();
    if (activeMenu === 'analytics') { fetchChats(); fetchLeads(); fetchTemplates(); fetchAnalytics(); }
  }, [activeMenu]);

  // ═══════════════════════════════════════════
  //  MANUAL CHAT & AI HANDOFF
  // ═══════════════════════════════════════════

  const handleToggleAi = async (checked) => {
    if (!selectedChat) return;
    // checked = true -> AI is ON (isAiPaused = false)
    // checked = false -> AI is OFF / Manual (isAiPaused = true)
    try {
      await api.patch(`/chatbot/chats/${selectedChat}/toggle-ai`, { isAiPaused: !checked });
      setChatDetails(prev => ({ ...prev, isAiPaused: !checked }));
      message.success(`AI has been ${checked ? 'enabled' : 'paused'} for this chat.`);
    } catch (error) {
      message.error("Failed to toggle AI state.");
    }
  };

  const sendManualMessageAction = async () => {
    if (!manualMessage.trim() || !selectedChat) return;
    setIsSending(true);
    try {
      await api.post('/chatbot/chats/send-message', {
        phone: selectedChat,
        message: manualMessage
      });
      setManualMessage('');
      loadChatHistory(selectedChat, 1, false, false);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMedia = async (file) => {
    if (!selectedChat) return false;
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('phone', selectedChat);
      formData.append('media', file);

      await api.post('/chatbot/chats/send-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      message.success('Media sent successfully');
      loadChatHistory(selectedChat, 1, false, false);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to send media.");
    } finally {
      setIsSending(false);
    }
    return false; // Prevent default upload behavior
  };

  // ═══════════════════════════════════════════
  //  TEMPLATE ACTIONS
  // ═══════════════════════════════════════════

  // ────── BUTTON BUILDER HELPERS ──────
  const addTemplateButton = () => {
    if (templateButtons.length >= 10) {
      message.warning('Maximum 10 buttons allowed by Meta.');
      return;
    }
    setTemplateButtons(prev => [...prev, { type: 'QUICK_REPLY', text: '', url: '', phone_number: '' }]);
  };

  const removeTemplateButton = (index) => {
    setTemplateButtons(prev => prev.filter((_, i) => i !== index));
  };

  const updateTemplateButton = (index, field, value) => {
    setTemplateButtons(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // Reset irrelevant fields when type changes
      if (field === 'type') {
        updated[index].url = '';
        updated[index].phone_number = '';
        updated[index].text = '';
      }
      return updated;
    });
  };

  // Validate buttons against Meta rules before submit
  const validateButtons = (buttons) => {
    const urlButtons = buttons.filter(b => b.type === 'URL');
    const phoneButtons = buttons.filter(b => b.type === 'PHONE_NUMBER');

    if (urlButtons.length > 2) return 'Maximum 2 URL buttons allowed by Meta.';
    if (phoneButtons.length > 1) return 'Maximum 1 Phone Number button allowed by Meta.';

    const emojiRegex = /(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}])/u;

    for (let i = 0; i < buttons.length; i++) {
      const b = buttons[i];
      const label = (b.text || '').trim();
      if (!label) return `Button ${i + 1}: Label text is required.`;
      if (label.length > 25) return `Button ${i + 1}: Label must be max 25 characters.`;
      if (/\{\{\d+\}\}/.test(label)) return `Button ${i + 1}: Variables like {{1}} are not allowed in button labels.`;
      if (/[\*\_\~\`]/.test(label)) return `Button ${i + 1}: Formatting characters (*, _) are not allowed in button labels.`;
      if (emojiRegex.test(label)) return `Button ${i + 1} ("${label}"): Meta strictly forbids emojis in button labels. Please remove emojis.`;

      if (b.type === 'URL') {
        if (!b.url || b.url.trim() === '') return `Button ${i + 1}: URL is required for URL button.`;
        try { new URL(b.url.trim()); } catch { return `Button ${i + 1}: Please enter a valid URL (e.g. https://example.com).`; }
      }
      if (b.type === 'PHONE_NUMBER') {
        if (!b.phone_number || b.phone_number.trim() === '') return `Button ${i + 1}: Phone number is required.`;
      }
    }
    return null; // no error
  };

  const handleCreateTemplate = async (values) => {
    // Validate buttons
    if (templateButtons.length > 0) {
      const btnError = validateButtons(templateButtons);
      if (btnError) {
        message.error(btnError);
        return;
      }
    }

    // ── Validate body text against Meta rules before calling API ──
    const bodyErr = validateTemplateBody(values.bodyText);
    if (bodyErr) {
      message.error(bodyErr);
      return;
    }

    try {
      const components = [];

      // HEADER (text only for now)
      if (values.headerText && values.headerText.trim()) {
        components.push({ type: 'HEADER', format: 'TEXT', text: values.headerText.trim() });
      }

      // BODY — detect variables and attach example values (Meta requires examples)
      const bodyVars = extractVarNumbers(values.bodyText);
      const bodyComp = { type: 'BODY', text: values.bodyText };
      if (bodyVars.length > 0) {
        // Use labels as example values — both human-readable AND fulfills Meta's example requirement
        const exampleValues = bodyVars.map(n => varLabels[n]?.trim() || `Sample ${n}`);
        bodyComp.example = { body_text: [exampleValues] };
      }
      components.push(bodyComp);

      // FOOTER (optional)
      if (values.footerText && values.footerText.trim()) {
        components.push({ type: 'FOOTER', text: values.footerText.trim() });
      }

      // BUTTONS
      if (templateButtons.length > 0) {
        const nonQR = templateButtons.filter(b => b.type !== 'QUICK_REPLY');
        const qr = templateButtons.filter(b => b.type === 'QUICK_REPLY');
        const sortedButtons = [...nonQR, ...qr];
        const metaButtons = sortedButtons.map(b => {
          if (b.type === 'QUICK_REPLY') return { type: 'QUICK_REPLY', text: b.text.trim() };
          if (b.type === 'URL') return { type: 'URL', text: b.text.trim(), url: b.url.trim() };
          if (b.type === 'PHONE_NUMBER') return { type: 'PHONE_NUMBER', text: b.text.trim(), phone_number: b.phone_number.trim() };
          return null;
        }).filter(Boolean);
        components.push({ type: 'BUTTONS', buttons: metaButtons });
      }

      await api.post('/chatbot/templates', {
        name: values.name,
        language: values.language || 'en_US',
        category: values.category || 'MARKETING',
        components
      });

      message.success('Template submitted to Meta for approval!');
      setIsCreateTemplateModalVisible(false);
      createTemplateForm.resetFields();
      setTemplateButtons([]);
      setVarLabels({});
      fetchTemplates();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create template');
    }
  };

  const handleDeleteTemplate = async (name) => {
    try {
      await api.delete(`/chatbot/templates/${name}`);
      message.success('Template deleted!');
      fetchTemplates();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete template');
    }
  };

  // ────── SEND TEMPLATE (from Inbox) ──────

  // Helper: extract unique sorted variable numbers from body text
  const extractVarNumbers = (text) => {
    if (!text) return [];
    const found = new Set();
    const regex = /\{\{(\d+)\}\}/g;
    let m;
    while ((m = regex.exec(text)) !== null) found.add(Number(m[1]));
    return Array.from(found).sort((a, b) => a - b);
  };

  // Helper: validate template body against Meta rules
  // Returns null if OK, or an error string
  const validateTemplateBody = (bodyText) => {
    if (!bodyText || bodyText.trim() === '') return 'Body text cannot be empty.';
    const text = bodyText.trim();

    // Variable cannot be at the very start
    if (/^\{\{\d+\}\}/.test(text)) {
      return 'Variable {{N}} cannot be at the start of the body. Add text before it — e.g. "Dear {{1}}," not "{{1}},"';
    }
    // Variable cannot be at the very end
    if (/\{\{\d+\}\}\s*$/.test(text)) {
      return 'Variable {{N}} cannot be at the end of the body. Add text after it — e.g. "contact {{1}}." not "contact {{1}}"';
    }
    // Variables must be sequential starting from 1
    const found = new Set();
    const regex = /\{\{(\d+)\}\}/g;
    let m;
    while ((m = regex.exec(text)) !== null) found.add(Number(m[1]));
    if (found.size > 0) {
      const nums = Array.from(found).sort((a, b) => a - b);
      if (nums[0] !== 1) {
        return `Variables must start from {{1}}. You used {{${nums[0]}}} as the first variable.`;
      }
      for (let i = 1; i < nums.length; i++) {
        if (nums[i] !== nums[i - 1] + 1) {
          return `Variable numbers must be sequential — no gaps allowed. Missing {{${nums[i - 1] + 1}}} between {{${nums[i - 1]}}} and {{${nums[i]}}}.`;
        }
      }
    }
    return null;
  };

  // Helper: build live preview by replacing {{N}} with entered values
  const buildSendPreview = (bodyText, vars, values) => {
    if (!bodyText) return '';
    let preview = bodyText;
    vars.forEach(n => {
      const val = values[n] || `{{${n}}}`;
      preview = preview.replace(new RegExp(`\\{\\{${n}\\}\\}`, 'g'), val);
    });
    return preview;
  };

  const openSendTemplateModal = async () => {
    try {
      const response = await api.get('/chatbot/templates');
      const approved = (response.data.templates || []).filter(t => t.status === 'APPROVED');
      setAvailableTemplates(approved);
      // Reset variable state
      setSendTplVars([]);
      setSendTplVarValues({});
      setSendTplPreview('');
      setSendTplVarLabels({});
      setIsSendTemplateModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch approved templates');
    }
  };

  // When user picks a template in the modal — detect variables + extract labels from example
  const handleSendTplSelect = (templateName) => {
    sendTemplateForm.setFieldValue('templateName', templateName);
    const tpl = availableTemplates.find(t => t.name === templateName);
    if (!tpl) { setSendTplVars([]); setSendTplVarValues({}); setSendTplPreview(''); return; }
    const bodyComp = tpl.components?.find(c => c.type === 'BODY');
    const bodyTxt = bodyComp?.text || '';
    const vars = extractVarNumbers(bodyTxt);

    // Extract example values from Meta template — these are the labels set during create
    // Meta stores them as bodyComp.example.body_text[0] = ["Customer Name", "Discount", ...]
    const exampleValues = bodyComp?.example?.body_text?.[0] || [];
    // Build a labels map: { 1: "Customer Name", 2: "Discount", ... }
    const labelsFromExample = {};
    vars.forEach((n, i) => {
      labelsFromExample[n] = exampleValues[i] || `Variable ${n}`;
    });

    setSendTplVars(vars);
    setSendTplVarValues({});
    setSendTplPreview(bodyTxt);
    // Store labels so modal can display them
    setSendTplVarLabels(labelsFromExample);
  };

  // When user types a variable value — update preview live
  const handleSendTplVarChange = (varNum, val) => {
    const updated = { ...sendTplVarValues, [varNum]: val };
    setSendTplVarValues(updated);
    const tpl = availableTemplates.find(t => t.name === sendTemplateForm.getFieldValue('templateName'));
    const bodyComp = tpl?.components?.find(c => c.type === 'BODY');
    setSendTplPreview(buildSendPreview(bodyComp?.text || '', sendTplVars, updated));
  };

  const handleSendTemplate = async (values) => {
    // Validate all variable fields are filled
    for (const n of sendTplVars) {
      if (!sendTplVarValues[n] || sendTplVarValues[n].trim() === '') {
        message.error(`Please fill in the value for {{${n}}}`);
        return;
      }
    }

    try {
      const selectedTpl = availableTemplates.find(t => t.name === values.templateName);
      const bodyComp = selectedTpl?.components?.find(c => c.type === 'BODY');
      const bodyText = bodyComp?.text || '';

      // Build resolved body text for chat history
      let resolvedBody = bodyText;
      sendTplVars.forEach(n => {
        const val = sendTplVarValues[n] || '';
        resolvedBody = resolvedBody.replace(new RegExp(`\\{\\{${n}\\}\\}`, 'g'), val);
      });

      // Build variableValues array sorted by var number [val1, val2, ...]
      const variableValues = sendTplVars.map(n => sendTplVarValues[n] || '');

      await api.post('/chatbot/templates/send', {
        phone: selectedChat,
        templateName: values.templateName,
        templateBodyText: resolvedBody,
        language: values.language || 'en_US',
        ...(variableValues.length > 0 && { variableValues }),
      });

      message.success('Template sent!');
      setIsSendTemplateModalVisible(false);
      sendTemplateForm.resetFields();
      setSendTplVars([]);
      setSendTplVarValues({});
      setSendTplPreview('');
      loadChatHistory(selectedChat);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send template');
    }
  };

  // ═══════════════════════════════════════════
  //  RENDER: INBOX
  // ═══════════════════════════════════════════

  const renderInbox = () => (
    <div className={`inbox-container ${selectedChat ? 'chat-active' : ''}`}>
      {/* Chat List Sidebar */}
      <div className="inbox-sidebar">
        <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
          <Title level={5} style={{ margin: 0 }}>💬 Live Inbox</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>{chats.length} conversation(s)</Text>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <List
            loading={chatsLoading}
            itemLayout="horizontal"
            dataSource={chats}
            locale={{
              emptyText: (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📭</div>
                  <Title level={5} style={{ margin: 0, color: '#475569' }}>No conversations yet</Title>
                  <Text style={{ fontSize: 13, display: 'block', marginTop: 8 }}>Messages will appear here automatically<br />once customers start chatting.</Text>
                </div>
              )
            }}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  background: selectedChat === item.phoneNumber ? '#f0f5ff' : '#fff',
                  borderBottom: '1px solid #f5f5f5',
                  borderLeft: selectedChat === item.phoneNumber ? '4px solid #1890ff' : '4px solid transparent',
                  transition: 'all 0.2s'
                }}
                onClick={() => loadChatHistory(item.phoneNumber)}
              >
                <List.Item.Meta
                  avatar={<Avatar size="large" style={{ backgroundColor: item.isAiPaused ? '#faad14' : '#1890ff' }} icon={item.isAiPaused ? <UserSwitchOutlined /> : <RobotOutlined />} />}
                  title={<div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>{item.phoneNumber}</Text>
                    {item.isAiPaused && <Tag color="warning" style={{ margin: 0, fontSize: 10 }}>Manual</Tag>}
                  </div>}
                  description={<Text type="secondary" style={{ fontSize: 11 }}>{new Date(item.updatedAt).toLocaleString()}</Text>}
                />
              </List.Item>
            )}
          />
        </div>
      </div>

      {/* Chat Window */}
      <div className="inbox-chat-window">
        {selectedChat && chatDetails ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-title">
                <Button
                  className="mobile-back-btn"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setSelectedChat(null)}
                  type="text"
                  style={{ display: 'none' }} // Ensure it uses CSS for display
                />
                <div>
                  <Title level={5} style={{ margin: 0 }}>{selectedChat}</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>{chatDetails.messages?.length || 0} messages history</Text>
                </div>
              </div>
              <div className="chat-header-actions">
                <Tooltip title={chatDetails.isAiPaused ? "AI is Paused. Turn ON to let AI reply automatically." : "AI is active. Turn OFF to take over manually."}>
                  <div className="ai-toggle-badge">
                    <RobotOutlined style={{ color: chatDetails.isAiPaused ? '#bfbfbf' : '#1890ff' }} />
                    <Text strong style={{ fontSize: 13, color: chatDetails.isAiPaused ? '#8c8c8c' : '#262626' }}>AI Replies</Text>
                    <Switch
                      checked={!chatDetails.isAiPaused}
                      onChange={handleToggleAi}
                      checkedChildren="ON"
                      unCheckedChildren="OFF"
                      size="small"
                    />
                  </div>
                </Tooltip>
                <Button type="default" icon={<FileTextOutlined />} onClick={openSendTemplateModal}>
                  Template
                </Button>
              </div>
            </div>


            {/* Meta Pricing Info Bar */}
            <div style={{ padding: '10px 24px', background: '#fffbeb', borderBottom: '1px solid #fde68a', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              {/* Info side */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
                <span style={{ fontSize: 16 }}>💡</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#1a1a2e' }}>Meta WhatsApp API Pricing</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>
                    Message charges vary by category (Service, Marketing, Utility) and your region. Pricing is set by Meta and may change periodically.{' '}
                    <a href="https://developers.facebook.com/docs/whatsapp/pricing" target="_blank" rel="noopener noreferrer" style={{ color: '#4361ee', fontWeight: 600 }}>
                      View Meta's Official Pricing →
                    </a>
                  </div>
                </div>
              </div>
              <div style={{ width: 1, background: '#fde68a', alignSelf: 'stretch', flexShrink: 0 }} />
              {/* Template side */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
                <span style={{ fontSize: 16 }}>📋</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#92400e' }}>Template Required (Outside 24hr)</div>
                  <div style={{ fontSize: 11, color: '#92400e' }}>
                    Outside the 24-hour customer service window, only approved templates can be sent.
                  </div>
                </div>
              </div>
            </div>


            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

              {hasMoreChats && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Button
                    type="default"
                    loading={loadingMoreChats}
                    onClick={() => loadChatHistory(selectedChat, chatPage + 1, true)}
                    style={{ borderRadius: 20, fontSize: 12 }}
                  >
                    Load Older Messages
                  </Button>
                </div>
              )}

              {chatDetails.messages?.map((msg, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end',
                  marginBottom: 16
                }}>
                  <div style={{
                    maxWidth: '65%',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                    background: msg.role === 'user' ? '#fff' : 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                    border: msg.role === 'user' ? '1px solid #f0f0f0' : 'none'
                  }}>
                    <Text style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{msg.content}</Text>
                    <div style={{ fontSize: 10, color: '#999', marginTop: 6, textAlign: 'right', fontWeight: 500 }}>
                      {msg.role === 'user' ? 'Customer' : 'Agent'}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Manual Chat Input */}
            <div style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      { key: '1', label: '👋 Hello, how can I help you today?' },
                      { key: '2', label: '⏳ Please give me a moment to check this for you.' },
                      { key: '3', label: '✅ Your order has been confirmed.' },
                      { key: '4', label: '🙏 Thank you for contacting us!' },
                    ],
                    onClick: (e) => {
                      const text = e.domEvent.target.innerText;
                      setManualMessage((prev) => prev + (prev ? ' ' : '') + text);
                    }
                  }}
                  placement="topLeft"
                >
                  <Button
                    shape="circle"
                    icon={<ThunderboltOutlined />}
                    size="large"
                    style={{ height: 48, width: 48, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#f59e0b' }}
                  />
                </Dropdown>
                <Upload
                  showUploadList={false}
                  beforeUpload={handleSendMedia}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                >
                  <Button
                    shape="circle"
                    icon={<PaperClipOutlined />}
                    size="large"
                    loading={isSending}
                    style={{ height: 48, width: 48, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}
                  />
                </Upload>
                <Input.TextArea
                  placeholder="Type a manual reply... (Must be within 24hrs of user's last message)"
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) { e.preventDefault(); sendManualMessageAction(); }
                  }}
                  style={{ borderRadius: 12 }}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined />}
                  size="large"
                  onClick={sendManualMessageAction}
                  loading={isSending}
                  style={{ background: 'var(--gradient-primary)', border: 'none', height: 48, width: 48 }}
                />
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: '#bfbfbf' }}>
            <MessageOutlined style={{ fontSize: 64, marginBottom: 16, opacity: 0.5 }} />
            <Title level={4} type="secondary" style={{ margin: 0 }}>Select a conversation</Title>
            <Text type="secondary">to start chatting or view history</Text>
          </div>
        )}
      </div>

      {/* Send Template Modal */}
      <Modal
        title="Send Template to Customer"
        open={isSendTemplateModalVisible}
        onCancel={() => {
          setIsSendTemplateModalVisible(false);
          sendTemplateForm.resetFields();
          setSendTplVars([]);
          setSendTplVarValues({});
          setSendTplPreview('');
        }}
        footer={null}
        destroyOnClose
        width={520}
      >
        <Form form={sendTemplateForm} layout="vertical" onFinish={handleSendTemplate}>

          {/* Pricing Notice */}
          <div style={{ marginBottom: 20, padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#92400e', marginBottom: 3 }}>💰 Paid Template Message</div>
                <div style={{ fontSize: 11, color: '#92400e', lineHeight: 1.5 }}>
                  Sending a template outside the 24-hour window initiates a <strong>paid Meta conversation</strong>.
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#78350f', marginBottom: 4 }}>📊 Regional Meta Rates:</div>
                <div style={{ fontSize: 11, color: '#92400e', lineHeight: 1.8 }}>
                  Rates vary by country. Please check the <strong>Analytics</strong> tab to see exact Meta API charges for <strong>Marketing</strong> and <strong>Utility</strong> conversations in your region.
                </div>
              </div>
            </div>
          </div>

          {/* Template select */}
          <Form.Item name="templateName" label="Select Approved Template" rules={[{ required: true }]}>
            <Select
              placeholder="Choose a template"
              onChange={handleSendTplSelect}
              size="large"
            >
              {availableTemplates.map(t => (
                <Select.Option key={t.name} value={t.name}>{t.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Language */}
          <Form.Item name="language" label="Language" initialValue="en_US" style={{ marginBottom: 0 }}>
            <Select size="large" style={{ width: 200 }}>
              <Select.Option value="en_US">English (en_US)</Select.Option>
              <Select.Option value="en_GB">English UK (en_GB)</Select.Option>
              <Select.Option value="ur">Urdu (ur)</Select.Option>
              <Select.Option value="ar">Arabic (ar)</Select.Option>
              <Select.Option value="hi">Hindi (hi)</Select.Option>
              <Select.Option value="id">Indonesian (id)</Select.Option>
              <Select.Option value="tr">Turkish (tr)</Select.Option>
              <Select.Option value="es">Spanish (es)</Select.Option>
              <Select.Option value="fr">French (fr)</Select.Option>
              <Select.Option value="de">German (de)</Select.Option>
            </Select>
          </Form.Item>

          {/* ── Variable Inputs — shown only if template has {{N}} vars ── */}
          {sendTplVars.length > 0 && (
            <div style={{ margin: '20px 0 4px' }}>
              <Text strong style={{ fontSize: 13 }}>
                Fill in Variable Values
              </Text>
              <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 12 }}>
                These replace the {`{{1}}, {{2}}`} placeholders in the message.
              </Text>

              {sendTplVars.map(n => (
                <div
                  key={n}
                  style={{
                    display: 'flex', gap: 10, alignItems: 'center',
                    marginBottom: 10
                  }}
                >
                  {/* Var badge — shows label name + {{N}} hint */}
                  <div style={{
                    minWidth: 110, padding: '4px 8px', borderRadius: 8,
                    background: 'linear-gradient(135deg,#667eea,#764ba2)',
                    color: '#fff', fontSize: 11, fontWeight: 700,
                    flexShrink: 0, textAlign: 'center', lineHeight: 1.4
                  }}>
                    {sendTplVarLabels[n] || `Variable ${n}`}
                    <div style={{ opacity: 0.75, fontWeight: 400, fontSize: 10 }}>{`{{${n}}}`}</div>
                  </div>
                  <Input
                    placeholder={`Enter ${sendTplVarLabels[n] || `{{${n}}}`}...`}
                    value={sendTplVarValues[n] || ''}
                    onChange={e => handleSendTplVarChange(n, e.target.value)}
                    size="middle"
                    style={{ flex: 1 }}
                  />
                </div>
              ))}

              {/* Live preview */}
              {sendTplPreview && (
                <div style={{
                  padding: '10px 14px', background: '#f0fdf4',
                  border: '1px solid #bbf7d0', borderRadius: 8,
                  fontSize: 13, marginTop: 6, marginBottom: 4
                }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                    Live preview:
                  </Text>
                  <Text style={{ color: '#166534', whiteSpace: 'pre-wrap' }}>{sendTplPreview}</Text>
                </div>
              )}
            </div>
          )}

          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 20 }}>
            <Button
              onClick={() => {
                setIsSendTemplateModalVisible(false);
                sendTemplateForm.resetFields();
                setSendTplVars([]);
                setSendTplVarValues({});
                setSendTplPreview('');
              }}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
              Send Template
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

  // ═══════════════════════════════════════════
  //  RENDER: LEADS
  // ═══════════════════════════════════════════

  const leadsColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (text) => <Text strong>{text}</Text> },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (text) => <Text copyable>{text}</Text> },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (text) => text || <Text type="secondary">—</Text> },
    { title: 'Source', dataIndex: 'source', key: 'source', render: (text) => <Tag color="blue">{text}</Tag> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (text) => {
        const colorMap = { New: 'blue', Contacted: 'gold', Converted: 'green', Lost: 'red' };
        return <Tag color={colorMap[text] || 'default'}>{text || 'New'}</Tag>;
      }
    },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (text) => new Date(text).toLocaleDateString() },
  ];

  const exportLeadsToCSV = () => {
    if (leads.length === 0) {
      message.warning('No leads to export.');
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Phone,Email,Source,Status,Date\n";
    leads.forEach(lead => {
      const row = [
        `"${lead.name || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.email || ''}"`,
        `"${lead.source || ''}"`,
        `"${lead.status || 'New'}"`,
        `"${new Date(lead.createdAt || lead.created).toLocaleDateString()}"`
      ];
      csvContent += row.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `whatsapp_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderLeads = () => (
    <div style={{ padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>🔥 Captured Leads</Title>
          <Text type="secondary">{leads.length} lead(s) captured via WhatsApp AI</Text>
        </div>
        <Button type="primary" icon={<FileTextOutlined />} onClick={exportLeadsToCSV} style={{ background: '#10b981', border: 'none' }}>
          Download CSV
        </Button>
      </div>
      <Table
        dataSource={leads}
        columns={leadsColumns}
        rowKey="_id"
        loading={leadsLoading}
        pagination={{ pageSize: 15 }}
        locale={{
          emptyText: (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🎯</div>
              <Title level={5} style={{ margin: 0, color: '#475569' }}>No leads captured yet</Title>
              <Text style={{ fontSize: 13, display: 'block', marginTop: 8 }}>Once your AI captures a hot lead,<br />it will magically appear right here.</Text>
            </div>
          )
        }}
      />
    </div>
  );

  // ═══════════════════════════════════════════
  //  RENDER: ANALYTICS (Premium Dashboard)
  // ═══════════════════════════════════════════

  const CHART_COLORS = ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96', '#13c2c2', '#fadb14', '#f5222d'];

  // Dynamic Meta pricing reference based on country
  const PRICING_DICTIONARY = {
    'Pakistan': [
      { category: 'Marketing', rate: '$0.0394', tag: '~PKR 11.0', color: '#fa8c16' },
      { category: 'Utility', rate: '$0.0132', tag: '~PKR 3.7', color: '#1890ff' },
      { category: 'Authentication', rate: '$0.0089', tag: '~PKR 2.5', color: '#722ed1' },
      { category: 'Service', rate: 'See Meta', tag: 'Check Meta', color: '#52c41a' }
    ],
    'India': [
      { category: 'Marketing', rate: '$0.0099', tag: '~INR 0.82', color: '#fa8c16' },
      { category: 'Utility', rate: '$0.0042', tag: '~INR 0.35', color: '#1890ff' },
      { category: 'Authentication', rate: '$0.0014', tag: '~INR 0.12', color: '#722ed1' },
      { category: 'Service', rate: 'See Meta', tag: 'Check Meta', color: '#52c41a' }
    ],
    'United States': [
      { category: 'Marketing', rate: '$0.0250', tag: 'USD $0.025', color: '#fa8c16' },
      { category: 'Utility', rate: '$0.0150', tag: 'USD $0.015', color: '#1890ff' },
      { category: 'Authentication', rate: '$0.0135', tag: 'USD $0.0135', color: '#722ed1' },
      { category: 'Service', rate: 'See Meta', tag: 'Check Meta', color: '#52c41a' }
    ],
    'United Kingdom': [
      { category: 'Marketing', rate: '$0.0631', tag: '~GBP 0.05', color: '#fa8c16' },
      { category: 'Utility', rate: '$0.0385', tag: '~GBP 0.03', color: '#1890ff' },
      { category: 'Authentication', rate: '$0.0336', tag: '~GBP 0.026', color: '#722ed1' },
      { category: 'Service', rate: 'See Meta', tag: 'Check Meta', color: '#52c41a' }
    ],
    'United Arab Emirates': [
      { category: 'Marketing', rate: '$0.0339', tag: '~AED 0.12', color: '#fa8c16' },
      { category: 'Utility', rate: '$0.0163', tag: '~AED 0.06', color: '#1890ff' },
      { category: 'Authentication', rate: '$0.0159', tag: '~AED 0.058', color: '#722ed1' },
      { category: 'Service', rate: 'See Meta', tag: 'Check Meta', color: '#52c41a' }
    ],
    'Saudi Arabia': [
      { category: 'Marketing', rate: '$0.0450', tag: '~SAR 0.17', color: '#fa8c16' },
      { category: 'Utility', rate: '$0.0200', tag: '~SAR 0.075', color: '#1890ff' },
      { category: 'Authentication', rate: '$0.0190', tag: '~SAR 0.071', color: '#722ed1' },
      { category: 'Service', rate: 'See Meta', tag: 'Check Meta', color: '#52c41a' }
    ],
    'Australia': [
      { category: 'Marketing', rate: '$0.0760', tag: '~AUD 0.11', color: '#fa8c16' },
      { category: 'Utility', rate: '$0.0250', tag: '~AUD 0.038', color: '#1890ff' },
      { category: 'Authentication', rate: '$0.0220', tag: '~AUD 0.033', color: '#722ed1' },
      { category: 'Service', rate: 'See Meta', tag: 'Check Meta', color: '#52c41a' }
    ],
    'Canada': [
      { category: 'Marketing', rate: '$0.0250', tag: '~CAD 0.034', color: '#fa8c16' },
      { category: 'Utility', rate: '$0.0150', tag: '~CAD 0.020', color: '#1890ff' },
      { category: 'Authentication', rate: '$0.0135', tag: '~CAD 0.018', color: '#722ed1' },
      { category: 'Service', rate: 'See Meta', tag: 'Check Meta', color: '#52c41a' }
    ],
    'Germany': [
      { category: 'Marketing', rate: '$0.0906', tag: '~EUR 0.084', color: '#fa8c16' },
      { category: 'Utility', rate: '$0.0553', tag: '~EUR 0.051', color: '#1890ff' },
      { category: 'Authentication', rate: '$0.0483', tag: '~EUR 0.045', color: '#722ed1' },
      { category: 'Service', rate: 'See Meta', tag: 'Check Meta', color: '#52c41a' }
    ],
    'Turkey': [
      { category: 'Marketing', rate: '$0.0130', tag: '~TRY 0.45', color: '#fa8c16' },
      { category: 'Utility', rate: '$0.0065', tag: '~TRY 0.23', color: '#1890ff' },
      { category: 'Authentication', rate: '$0.0055', tag: '~TRY 0.19', color: '#722ed1' },
      { category: 'Service', rate: 'See Meta', tag: 'Check Meta', color: '#52c41a' }
    ],
    'Global/Other': [
      { category: 'Marketing', rate: 'Varies', tag: 'Check Meta', color: '#fa8c16' },
      { category: 'Utility', rate: 'Varies', tag: 'Check Meta', color: '#1890ff' },
      { category: 'Authentication', rate: 'Varies', tag: 'Check Meta', color: '#722ed1' },
      { category: 'Service (Free Tier)', rate: '$0.00', tag: 'FREE', color: '#52c41a' }
    ]
  };

  const handleCountryChange = async (newCountry) => {
    setCountry(newCountry);
    try {
      await api.put('/clients/me/settings', { country: newCountry });
      message.success(`Pricing country updated to ${newCountry}`);
    } catch (err) {
      console.error("Failed to save country:", err);
    }
  };

  const PRICING_DATA = PRICING_DICTIONARY[country] || PRICING_DICTIONARY['Global/Other'];

  const renderAnalytics = () => {
    // Calculate totals from Meta's API response
    let totalSent = 0;
    let totalDelivered = 0;
    let totalCosts = 0;
    let businessInitiated = 0;
    let userInitiated = 0;
    let freeConversations = 0;
    let paidConversations = 0;

    // Build daily chart data from Meta's conversation_analytics response
    let dailyChartData = [];
    let conversationTypeData = [];

    if (analytics && analytics.length > 0) {
      analytics.forEach(item => {
        if (item.data_points) {
          item.data_points.forEach(dp => {
            totalSent += (dp.sent || 0);
            totalDelivered += (dp.delivered || 0);
            totalCosts += (dp.cost || 0);
            businessInitiated += (dp.business_initiated || 0);
            userInitiated += (dp.user_initiated || 0);
            freeConversations += (dp.free_tier || dp.free_entry_point || 0);
            paidConversations += (dp.paid || 0);

            // Build daily chart entry
            const dateLabel = dp.start ? new Date(dp.start * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';
            dailyChartData.push({
              date: dateLabel,
              sent: dp.sent || 0,
              delivered: dp.delivered || 0,
              cost: parseFloat((dp.cost || 0).toFixed(4)),
            });
          });
        }
      });
    }

    // Build conversation type pie chart data
    conversationTypeData = [
      { name: 'Business Initiated', value: businessInitiated || 0 },
      { name: 'User Initiated', value: userInitiated || 0 },
      { name: 'Free Conversations', value: freeConversations || 0 },
    ].filter(d => d.value > 0);

    // Calculate total messages from our own DB
    let totalMessages = 0;
    let aiMessages = 0;
    chats.forEach(chat => {
      const msgCount = chat.messages?.length || 0;
      totalMessages += msgCount;
      chat.messages?.forEach(m => { if (m.role === 'assistant') aiMessages++; });
    });
    const humanMessages = totalMessages - aiMessages;
    const aiPausedChats = chats.filter(c => c.isAiPaused).length;
    const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 100;
    const leadConversionRate = chats.length > 0 ? ((leads.length / chats.length) * 100).toFixed(1) : 0;
    const totalConversations = businessInitiated + userInitiated + freeConversations;

    // Message source pie data
    const msgSourceData = [
      { name: 'AI Responses', value: aiMessages },
      { name: 'Human Replies', value: humanMessages },
    ].filter(d => d.value > 0);

    const cardStyle = {
      borderRadius: 16,
      background: '#fff',
      border: '1px solid #f0f0f0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
    };

    return (
      <div>
        {/* ── Header with Sandbox Badge + Refresh ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Title level={3} style={{ margin: 0 }}>📊 WhatsApp API Analytics</Title>
            </div>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
              Monitor your Meta Cloud API usage, messaging stats, and billing — Last 30 Days
            </Text>
            <div style={{ marginTop: 12 }}>
              {totalConversations === 0 ? (
                <Tag color="warning" style={{ borderRadius: 20, padding: '4px 12px', fontWeight: 600, background: '#fffbe6', color: '#faad14', border: 'none' }}>
                  <ClockCircleOutlined /> Sandbox Mode — No conversations yet
                </Tag>
              ) : (
                <Tag color="success" style={{ borderRadius: 20, padding: '4px 12px', fontWeight: 600 }}>
                  <CheckCircleOutlined /> Live — {totalConversations} conversation(s) tracked
                </Tag>
              )}
            </div>
          </div>
          <Button
            icon={<BarChartOutlined />}
            onClick={() => { fetchChats(); fetchLeads(); fetchTemplates(); fetchAnalytics(); }}
            loading={analyticsLoading}
            style={{ borderRadius: 8 }}
          >
            Refresh
          </Button>
        </div>

        {analyticsLoading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" tip="Loading Meta Analytics..." /></div>
        ) : (
          <>
            {/* ── ROW 1: Top 4 Stat Cards ── */}
            <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <Card style={{ ...cardStyle, borderTop: '3px solid #1890ff' }} bodyStyle={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BarChartOutlined style={{ color: '#fff', fontSize: 16 }} />
                    </div>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Total Conversations</Text>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#262626' }}>{totalConversations || chats.length}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Last 30 days</Text>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card style={{ ...cardStyle, borderTop: '3px solid #52c41a' }} bodyStyle={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarOutlined style={{ color: '#fff', fontSize: 16 }} />
                    </div>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Total Cost</Text>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#262626' }}>${totalCosts.toFixed(2)}</div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card style={{ ...cardStyle, borderTop: '3px solid #722ed1' }} bodyStyle={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#722ed1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserOutlined style={{ color: '#fff', fontSize: 16 }} />
                    </div>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>User-Initiated</Text>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#262626' }}>{userInitiated}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Customer initiated conversation</Text>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card style={{ ...cardStyle, borderTop: '3px solid #fa8c16' }} bodyStyle={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fa8c16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <SendOutlined style={{ color: '#fff', fontSize: 16 }} />
                    </div>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Business-Initiated</Text>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#262626' }}>{businessInitiated}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Business initiated conversation</Text>
                </Card>
              </Col>
            </Row>

            {/* ── ROW 2: Free vs Paid & Pricing Reference ── */}
            <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
              {/* Free vs Paid Breakdown */}
              <Col xs={24} lg={12}>
                <Card title={<span style={{ fontWeight: 600 }}><RiseOutlined style={{ color: '#52c41a', marginRight: 8 }} />Free vs Paid Conversations</span>} style={cardStyle} headStyle={{ borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ marginBottom: 24, background: '#f8fafc', padding: '16px', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text strong>Free Conversations</Text>
                      <Tag color="green">{freeConversations}</Tag>
                    </div>
                  </div>
                  <div style={{ marginBottom: 24, background: '#f8fafc', padding: '16px', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text strong>Paid Conversations</Text>
                      <Tag color="orange">{paidConversations}</Tag>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <a href="https://developers.facebook.com/docs/whatsapp/pricing" target="_blank" rel="noopener noreferrer" style={{ color: '#4361ee', fontWeight: 600 }}>
                        View Meta's Official Pricing Page →
                      </a>
                    </Text>
                  </div>
                </Card>
              </Col>

              {/* Pricing Reference */}
              <Col xs={24} lg={12}>
                <Card
                  title={<span style={{ fontWeight: 600 }}><TeamOutlined style={{ color: '#1890ff', marginRight: 8 }} />Pricing Reference</span>}
                  extra={
                    <Select
                      value={country}
                      onChange={handleCountryChange}
                      size="small"
                      style={{ minWidth: 160 }}
                    >
                      <Select.Option value="Pakistan">🇵🇰 Pakistan (PKR)</Select.Option>
                      <Select.Option value="India">🇮🇳 India (INR)</Select.Option>
                      <Select.Option value="United States">🇺🇸 United States (USD)</Select.Option>
                      <Select.Option value="United Kingdom">🇬🇧 UK (GBP)</Select.Option>
                      <Select.Option value="United Arab Emirates">🇦🇪 UAE (AED)</Select.Option>
                      <Select.Option value="Saudi Arabia">🇸🇦 Saudi Arabia (SAR)</Select.Option>
                      <Select.Option value="Australia">🇦🇺 Australia (AUD)</Select.Option>
                      <Select.Option value="Canada">🇨🇦 Canada (CAD)</Select.Option>
                      <Select.Option value="Germany">🇩🇪 Germany (EUR)</Select.Option>
                      <Select.Option value="Turkey">🇹🇷 Turkey (TRY)</Select.Option>
                      <Select.Option value="Global/Other">🌐 Global / Other</Select.Option>
                    </Select>
                  }
                  style={cardStyle}
                  headStyle={{ borderBottom: '1px solid #f0f0f0' }}
                >
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: '0 16px', border: '1px solid #f0f0f0' }}>
                    {PRICING_DATA.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: idx < PRICING_DATA.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }} />
                          <Text strong>{item.category}</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Text style={{ fontWeight: 700, fontSize: 14 }}>{item.rate}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>{item.tag}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px 0', borderTop: '1px solid #f0f0f0', marginTop: 8 }}>
                    <a href="https://developers.facebook.com/docs/whatsapp/pricing" target="_blank" rel="noopener noreferrer" style={{ color: '#4361ee', fontWeight: 600, fontSize: 12 }}>
                      📄 View Meta's Official Pricing Page →
                    </a>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Rates are set by Meta and may change. Always verify on Meta's website.</div>
                  </div>
                </Card>
              </Col>

              {/* AI Token Quota (Hidden from Client Dashboard — Internal Management Logic) */}
              {/* 
              <Col xs={24} lg={12}>
                <Card title={<span style={{ fontWeight: 600 }}><ThunderboltOutlined style={{ color: '#a855f7', marginRight: 8 }} />AI Token Quota Usage</span>} style={cardStyle} headStyle={{ borderBottom: '1px solid #f0f0f0' }}>
                  ...
                </Card>
              </Col>
              */}
            </Row>

            {/* ── ROW 3: Empty state banner (as requested in screenshot) ── */}
            {dailyChartData.length === 0 && (
              <Row>
                <Col span={24}>
                  <Card style={{ ...cardStyle, background: '#fafafa', textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ background: '#f0f0f0', width: 48, height: 48, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <div style={{ width: 24, height: 16, border: '2px solid #bfbfbf', borderTop: 'none', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: -10, left: 4, width: 12, height: 10, border: '2px solid #bfbfbf', borderBottom: 'none' }} />
                      </div>
                    </div>
                    <div style={{ color: '#262626', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>No conversation data available yet</div>
                    <div style={{ color: '#8c8c8c', fontSize: 13 }}>Analytics data will appear here once your WhatsApp Business Account is verified and conversations start flowing through the API.</div>
                  </Card>
                </Col>
              </Row>
            )}
          </>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════
  //  RENDER: TEMPLATES
  // ═══════════════════════════════════════════

  const templateColumns = [
    { title: 'Template Name', dataIndex: 'name', key: 'name', render: (text) => <Text strong>{text}</Text> },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (text) => <Tag color="purple">{text}</Tag> },
    { title: 'Language', dataIndex: 'language', key: 'language' },
    {
      title: 'Status', dataIndex: 'status', key: 'status', render: (text) => {
        const colorMap = { APPROVED: 'green', PENDING: 'orange', REJECTED: 'red' };
        return <Tag color={colorMap[text] || 'default'}>{text}</Tag>;
      }
    },
    {
      title: 'Actions', key: 'actions', render: (_, record) => (
        <Popconfirm title={`Delete template "${record.name}"?`} onConfirm={() => handleDeleteTemplate(record.name)} okText="Delete" okButtonProps={{ danger: true }}>
          <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
        </Popconfirm>
      )
    },
  ];

  const renderTemplates = () => (
    <div style={{ padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>📋 Template Manager</Title>
          <Text type="secondary">{templates.length} official Meta template(s)</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsCreateTemplateModalVisible(true)} style={{ background: 'var(--gradient-primary)', border: 'none' }}>
          Create New Template
        </Button>
      </div>

      <Table dataSource={templates} columns={templateColumns} rowKey="name" loading={templatesLoading} pagination={{ pageSize: 10 }} />

      {/* Create Template Modal */}
      <Modal
        title="Create New WhatsApp Template"
        open={isCreateTemplateModalVisible}
        onCancel={() => {
          setIsCreateTemplateModalVisible(false);
          createTemplateForm.resetFields();
          setTemplateButtons([]);
          setVarLabels({});
        }}
        footer={null}
        width={720}
        destroyOnClose
      >
        <Form form={createTemplateForm} layout="vertical" onFinish={handleCreateTemplate}>

          {/* ── Row 1: Name + Category + Language ── */}
          <Form.Item
            name="name"
            label="Template Name (lowercase, underscores only)"
            rules={[
              { required: true },
              { pattern: /^[a-z0-9_]+$/, message: 'Only lowercase letters, numbers, and underscores' }
            ]}
          >
            <Input placeholder="e.g. welcome_message" size="large" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="category" label="Category" style={{ flex: 1 }} initialValue="MARKETING">
              <Select size="large">
                <Select.Option value="MARKETING">Marketing</Select.Option>
                <Select.Option value="UTILITY">Utility</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="language" label="Language" style={{ flex: 1 }} initialValue="en_US">
              <Select size="large">
                <Select.Option value="en_US">English (en_US)</Select.Option>
                <Select.Option value="en_GB">English UK (en_GB)</Select.Option>
                <Select.Option value="ur">Urdu (ur)</Select.Option>
                <Select.Option value="ar">Arabic (ar)</Select.Option>
                <Select.Option value="hi">Hindi (hi)</Select.Option>
                <Select.Option value="id">Indonesian (id)</Select.Option>
                <Select.Option value="tr">Turkish (tr)</Select.Option>
                <Select.Option value="es">Spanish (es)</Select.Option>
                <Select.Option value="fr">French (fr)</Select.Option>
                <Select.Option value="de">German (de)</Select.Option>
              </Select>
            </Form.Item>
          </div>

          {/* ── Header ── */}
          <Form.Item
            name="headerText"
            label="Header Text (optional — max 60 chars)"
            extra={<span style={{ fontSize: 12, color: '#64748b' }}>Meta strictly forbids emojis, asterisks (*), or variables in the header.</span>}
            rules={[
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (/[\*\_\~\`]/.test(value)) {
                    return Promise.reject(new Error('Formatting characters (*, _, ~, `) are not allowed in the header.'));
                  }
                  if (/[\r\n]/.test(value)) {
                    return Promise.reject(new Error('Newlines are not allowed in the header.'));
                  }
                  if (/\{\{\d+\}\}/.test(value)) {
                    return Promise.reject(new Error('Variables are not allowed in the header.'));
                  }
                  const emojiRegex = /(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}])/u;
                  if (emojiRegex.test(value)) {
                    return Promise.reject(new Error('Meta strictly forbids emojis in the header text. Please remove all emojis.'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input placeholder="e.g. Special Offer for You" size="large" maxLength={60} showCount />
          </Form.Item>

          {/* ── Body ── */}
          <Form.Item
            name="bodyText"
            label="Body Text"
            rules={[
              { required: true, message: 'Body text is required' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const err = validateTemplateBody(value);
                  return err ? Promise.reject(err) : Promise.resolve();
                }
              }
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Your message body. Use {{1}}, {{2}} for variables. Max 1024 chars."
              maxLength={1024}
              showCount
              onChange={e => {
                // Auto-detect variables and reset labels for new ones
                const vars = extractVarNumbers(e.target.value);
                setVarLabels(prev => {
                  const updated = {};
                  vars.forEach(n => { updated[n] = prev[n] || ''; });
                  return updated;
                });
              }}
            />
          </Form.Item>

          {/* ── Variable Labels — shown when body has {{N}} vars ── */}
          {Object.keys(varLabels).length > 0 && (
            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 10, padding: '14px 16px', marginTop: -8, marginBottom: 16
            }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                📝 Name your variables
              </Text>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                Give each <code>{'{{N}}'}</code> a clear label so you know what to fill when sending.
                This also serves as the example value for Meta's approval review.
              </Text>
              {extractVarNumbers(createTemplateForm.getFieldValue('bodyText') || '').map(n => (
                <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <div style={{
                    minWidth: 42, height: 28, borderRadius: 6,
                    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                    color: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0
                  }}>
                    {`{{${n}}}`}
                  </div>
                  <Input
                    size="small"
                    placeholder={`Label for {{${n}}}  e.g. Customer Name, Discount Amount, City`}
                    value={varLabels[n] || ''}
                    onChange={e => setVarLabels(prev => ({ ...prev, [n]: e.target.value }))}
                    style={{ flex: 1 }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── Footer ── */}
          <Form.Item name="footerText" label="Footer Text (optional — max 60 chars)">
            <Input placeholder="e.g. Reply STOP to unsubscribe" size="large" maxLength={60} showCount />
          </Form.Item>

          {/* ══════════════════════════════════════
              BUTTONS BUILDER
              ══════════════════════════════════════ */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '20px 20px 12px',
            background: '#f8fafc',
            marginBottom: 24
          }}>
            {/* Section header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <Text strong style={{ fontSize: 14 }}>Interactive Buttons (optional)</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color="blue">Quick Reply</Tag>
                  <Tag color="green">Visit Website (URL)</Tag>
                  <Tag color="orange">Call Phone</Tag>
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                    Max 10 total · 2 URL · 1 Phone
                  </Text>
                </div>
              </div>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addTemplateButton}
                disabled={templateButtons.length >= 10}
                style={{ borderRadius: 8 }}
              >
                Add Button
              </Button>
            </div>

            {/* Empty state */}
            {templateButtons.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '20px 0',
                color: '#94a3b8',
                borderTop: '1px dashed #e2e8f0'
              }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  No buttons added. Click "Add Button" to include Quick Reply, URL, or Phone buttons.
                </Text>
              </div>
            )}

            {/* Button rows */}
            {templateButtons.map((btn, index) => (
              <div
                key={index}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '14px 16px',
                  marginBottom: 10,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start'
                }}
              >
                {/* Button index badge */}
                <div style={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--gradient-primary, linear-gradient(135deg,#667eea,#764ba2))',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  marginTop: 4,
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Type + Label row */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {/* Button Type */}
                    <Select
                      value={btn.type}
                      onChange={(val) => updateTemplateButton(index, 'type', val)}
                      style={{ width: 170 }}
                      size="middle"
                    >
                      <Select.Option value="QUICK_REPLY">
                        <span>⚡ Quick Reply</span>
                      </Select.Option>
                      <Select.Option
                        value="URL"
                        disabled={templateButtons.filter(b => b.type === 'URL').length >= 2 && btn.type !== 'URL'}
                      >
                        <span>🔗 Visit Website</span>
                      </Select.Option>
                      <Select.Option
                        value="PHONE_NUMBER"
                        disabled={templateButtons.filter(b => b.type === 'PHONE_NUMBER').length >= 1 && btn.type !== 'PHONE_NUMBER'}
                      >
                        <span>📞 Call Phone</span>
                      </Select.Option>
                    </Select>

                    {/* Button Label */}
                    <Input
                      placeholder="Button label (max 25 chars)"
                      value={btn.text}
                      onChange={(e) => updateTemplateButton(index, 'text', e.target.value)}
                      maxLength={25}
                      showCount
                      style={{ flex: 1 }}
                    />
                  </div>

                  {/* Extra field: URL */}
                  {btn.type === 'URL' && (
                    <Input
                      placeholder="https://yourwebsite.com"
                      value={btn.url}
                      onChange={(e) => updateTemplateButton(index, 'url', e.target.value)}
                      prefix={<span style={{ color: '#94a3b8', fontSize: 12 }}>URL</span>}
                    />
                  )}

                  {/* Extra field: Phone Number */}
                  {btn.type === 'PHONE_NUMBER' && (
                    <Input
                      placeholder="e.g. 923001234567 (with country code, no +)"
                      value={btn.phone_number}
                      onChange={(e) => updateTemplateButton(index, 'phone_number', e.target.value)}
                      prefix={<span style={{ color: '#94a3b8', fontSize: 12 }}>Phone</span>}
                    />
                  )}
                </div>

                {/* Remove button */}
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeTemplateButton(index)}
                  style={{ marginTop: 2, flexShrink: 0 }}
                  title="Remove this button"
                />
              </div>
            ))}

            {/* Live count */}
            {templateButtons.length > 0 && (
              <div style={{ textAlign: 'right', paddingTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {templateButtons.length}/10 buttons added
                  {templateButtons.filter(b => b.type === 'URL').length > 0 && ` · ${templateButtons.filter(b => b.type === 'URL').length}/2 URL`}
                  {templateButtons.filter(b => b.type === 'PHONE_NUMBER').length > 0 && ` · ${templateButtons.filter(b => b.type === 'PHONE_NUMBER').length}/1 Phone`}
                </Text>
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 8 }}>
            <Button
              onClick={() => {
                setIsCreateTemplateModalVisible(false);
                createTemplateForm.resetFields();
                setTemplateButtons([]);
              }}
              style={{ marginRight: 12 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              style={{ background: 'var(--gradient-primary)', border: 'none' }}
            >
              Submit to Meta for Approval
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

  // ═══════════════════════════════════════════
  //  RENDER: MAIN CONTENT SWITCH
  // ═══════════════════════════════════════════

  const renderContent = () => {
    switch (activeMenu) {
      case 'inbox': return renderInbox();
      case 'leads': return renderLeads();
      case 'analytics': return renderAnalytics();
      case 'templates': return renderTemplates();
      case 'broadcast': return <BroadcastManager />;
      case 'autoreplies': return <AutoReplies />;
      case 'settings': return <ClientSettings clientId={user?.clientId} />;
      default: return renderInbox();
    }
  };

  // ═══════════════════════════════════════════
  //  MAIN LAYOUT
  // ═══════════════════════════════════════════

  const headerTitles = {
    inbox: 'Message Center',
    leads: 'Lead Management',
    analytics: 'Performance & Billing',
    templates: 'WhatsApp Templates',
    broadcast: 'Marketing Campaigns',
    autoreplies: 'Auto Replies & Menus',
    settings: 'Account Settings'
  };

  const profileMenuItems = [
    {
      key: 'email',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.email}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Business Admin</div>
        </div>
      ),
      disabled: true
    },
    { type: 'divider' },
    {
      key: 'settings',
      label: 'Profile & Settings',
      icon: <SettingOutlined />,
      onClick: () => { setActiveMenu('settings'); setSidebarOpen(false); }
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Sign Out',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: logout
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sider
        className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
        width={260}
      >
        <div className="sidebar-logo" style={{ padding: '0 18px', height: '76px', display: 'flex', alignItems: 'center' }}>
          <NaracordLogo size="sm" badge="CLIENT" theme="dark" />
        </div>

        <Menu
          mode="inline"
          selectedKeys={[activeMenu]}
          onClick={(e) => {
            setActiveMenu(e.key);
            setSelectedChat(null);
            setChatDetails(null);
            setSidebarOpen(false);
          }}
        >
          <Menu.Item key="inbox" icon={<MessageOutlined />}>Live Inbox</Menu.Item>
          <Menu.Item key="leads" icon={<UserOutlined />}>Captured Leads</Menu.Item>
          <Menu.Item key="analytics" icon={<BarChartOutlined />}>Meta Analytics</Menu.Item>
          <Menu.Item key="templates" icon={<FileTextOutlined />}>Templates</Menu.Item>
          <Menu.Item key="broadcast" icon={<NotificationOutlined />}>Broadcast / Campaigns</Menu.Item>
          <Menu.Item key="autoreplies" icon={<ThunderboltOutlined />}>Auto Replies</Menu.Item>
          <Menu.Item key="settings" icon={<SettingOutlined />}>Profile & Settings</Menu.Item>
        </Menu>

        {/* Sidebar bottom profile */}
        <div className="sidebar-bottom">
          <Dropdown menu={{ items: profileMenuItems }} trigger={['click']} placement="topRight">
            <div className="sidebar-profile">
              <div className="sidebar-avatar">
                <UserOutlined />
              </div>
              <div className="sidebar-user-info">
                <span className="user-name">{user?.email?.split('@')[0]}</span>
                <span className="user-role">Business Admin</span>
              </div>
              <DownOutlined style={{ color: '#64748b', fontSize: 10 }} />
            </div>
          </Dropdown>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5 }}>Engineered by <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Alisons Technology</strong></span>
          </div>
        </div>
      </Sider>

      <Layout className="dashboard-main-layout" style={{ marginLeft: 260 }}>
        <Header className="dashboard-header">
          {/* Mobile hamburger */}
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <div className="hamburger-icon">
              <span /><span /><span />
            </div>
          </button>

          <div className="header-title">
            {headerTitles[activeMenu] || 'Dashboard'}
          </div>

          <div className="header-right">
            <Dropdown menu={{ items: profileMenuItems }} trigger={['click']}>
              <div className="profile-trigger">
                <div className="profile-info">
                  <span className="profile-name">{user?.email?.split('@')[0]}</span>
                  <span className="profile-role">Business Admin</span>
                </div>
                <div className="profile-avatar">
                  <UserOutlined />
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ padding: '24px', background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ClientAdminDashboard;
