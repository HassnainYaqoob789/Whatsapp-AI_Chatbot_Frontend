import React, { useState, useEffect } from 'react';
import {
  Card, Select, Input, Button, Table, Typography, Tag,
  message, Alert, Spin, Divider, Radio, Tooltip, Upload
} from 'antd';
import {
  NotificationOutlined, SendOutlined, InfoCircleOutlined, PlusOutlined, UploadOutlined
} from '@ant-design/icons';
import axiosConfig from '../../utils/axiosConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: extract unique variable numbers from template body text
// e.g. "Hi {{1}}, your order {{2}} is ready!" → [1, 2]
// ─────────────────────────────────────────────────────────────────────────────
function extractVarNumbers(text) {
  if (!text) return [];
  const found = new Set();
  const regex = /\{\{(\d+)\}\}/g;
  let m;
  while ((m = regex.exec(text)) !== null) found.add(Number(m[1]));
  return Array.from(found).sort((a, b) => a - b);
}

// Label shown in UI for each lead-field option
const LEAD_FIELD_LABELS = {
  lead_name:   '👤 Lead Name',
  lead_phone:  '📞 Lead Phone',
  lead_email:  '📧 Lead Email',
  lead_source: '🔗 Lead Source',
  lead_status: '🏷️ Lead Status',
};

const BroadcastManager = () => {
  const [templates, setTemplates]         = useState([]);
  const [leads, setLeads]                 = useState([]);
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [broadcasting, setBroadcasting]   = useState(false);

  // ── Form state ──
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedTplObj, setSelectedTplObj]     = useState(null); // full template object
  const [templateVars, setTemplateVars]         = useState([]);   // [1, 2, 3, ...]
  const [variableMapping, setVariableMapping]   = useState({});
  // variableMapping shape: { "1": "lead_name" | "lead_phone" | "fixed:<text>" }

  const [manualNumbers, setManualNumbers] = useState('');
  const [selectedLeadPhones, setSelectedLeadPhones] = useState([]);
  const [broadcastLanguage, setBroadcastLanguage] = useState('en_US');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resT, resL, resB] = await Promise.all([
        axiosConfig.get('/chatbot/templates'),
        axiosConfig.get('/chatbot/leads'),
        axiosConfig.get('/chatbot/broadcast'),
      ]);
      if (resT.data.success) setTemplates(resT.data.templates.filter(t => t.status === 'APPROVED'));
      if (resL.data.success) setLeads(resL.data.leads);
      if (resB.data.success) setBroadcastHistory(resB.data.broadcasts || []);
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch broadcast data');
    } finally {
      setLoading(false);
    }
  };

  // ── When template is selected: extract variables, reset mapping ──
  const handleTemplateChange = (val) => {
    setSelectedTemplate(val);
    const tpl = templates.find(t => t.name === val);
    setSelectedTplObj(tpl || null);

    if (tpl) {
      const bodyComp = tpl.components?.find(c => c.type === 'BODY');
      const vars = extractVarNumbers(bodyComp?.text || '');
      setTemplateVars(vars);
      // Default mapping: first var → lead_name, rest → blank fixed
      const defaultMap = {};
      vars.forEach((n, i) => {
        defaultMap[String(n)] = i === 0 ? 'lead_name' : '';
      });
      setVariableMapping(defaultMap);
    } else {
      setTemplateVars([]);
      setVariableMapping({});
    }
  };

  // ── Update one variable's mapping ──
  const updateMapping = (varNum, source) => {
    setVariableMapping(prev => ({ ...prev, [String(varNum)]: source }));
  };

  // ── Update fixed value text ──
  const updateFixedValue = (varNum, text) => {
    setVariableMapping(prev => ({
      ...prev,
      [String(varNum)]: `fixed:${text}`
    }));
  };

  // ── Get current fixed text for a varNum ──
  const getFixedText = (varNum) => {
    const src = variableMapping[String(varNum)] || '';
    return src.startsWith('fixed:') ? src.slice(6) : '';
  };

  // ── Validate mapping before send ──
  const validateMapping = () => {
    for (const n of templateVars) {
      const src = variableMapping[String(n)] || '';
      if (!src) return `Please set a value source for {{${n}}}`;
      if (src === 'fixed:') return `Please enter a fixed value for {{${n}}}`;
      if (src.startsWith('fixed:') && src.slice(6).trim() === '')
        return `Fixed value for {{${n}}} cannot be empty`;
    }
    return null;
  };

  // ── Build a preview of what one message will look like ──
  const buildPreview = () => {
    const bodyComp = selectedTplObj?.components?.find(c => c.type === 'BODY');
    if (!bodyComp?.text) return '';
    let preview = bodyComp.text;
    templateVars.forEach(n => {
      const src = variableMapping[String(n)] || '';
      let sample = `{{${n}}}`;
      if (src === 'lead_name')   sample = 'Ali Khan';
      else if (src === 'lead_phone')  sample = '923001234567';
      else if (src === 'lead_email')  sample = 'ali@example.com';
      else if (src === 'lead_source') sample = 'WhatsApp AI';
      else if (src === 'lead_status') sample = 'New';
      else if (src.startsWith('fixed:')) sample = src.slice(6) || `{{${n}}}`;
      preview = preview.replace(new RegExp(`\\{\\{${n}\\}\\}`, 'g'), sample);
    });
    return preview;
  };

  // ── Download CSV Template ──
  const downloadCsvTemplate = () => {
    const csvContent = 'phone\n923001234567\n923331234567\n971501234567';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'broadcast_phone_numbers_template.csv';
    link.click();
    URL.revokeObjectURL(url);
    message.info('Template downloaded! Fill in your phone numbers and upload it.');
  };

  // ── Handle CSV Upload ──
  const handleCsvUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length === 0) {
        message.warning('The CSV file is empty.');
        return;
      }

      const extractedNumbers = [];

      // Detect if first line is a header row
      const firstLine = lines[0].trim().toLowerCase();
      const headerWords = ['phone', 'number', 'mobile', 'whatsapp', 'name', 'email', 'contact'];
      const isHeader = headerWords.some(w => firstLine.includes(w));

      // Try to find the phone column index from header
      let phoneColIndex = -1;
      if (isHeader) {
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const phoneLabels = ['phone', 'phone_number', 'phone number', 'mobile', 'whatsapp', 'number', 'contact'];
        phoneColIndex = headers.findIndex(h => phoneLabels.includes(h));
      }

      const dataLines = isHeader ? lines.slice(1) : lines;

      dataLines.forEach(line => {
        const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));

        if (phoneColIndex >= 0 && parts[phoneColIndex]) {
          // Extract from the detected phone column
          const digits = parts[phoneColIndex].replace(/[^0-9]/g, '');
          if (digits.length >= 8 && digits.length <= 15) {
            extractedNumbers.push(digits);
          }
        } else {
          // Fallback: scan all columns for phone-like numbers
          parts.forEach(p => {
            const digits = p.replace(/[^0-9]/g, '');
            if (digits.length >= 8 && digits.length <= 15) {
              extractedNumbers.push(digits);
            }
          });
        }
      });

      if (extractedNumbers.length > 0) {
        const uniqueNumbers = [...new Set(extractedNumbers)];
        const currentNumbers = manualNumbers.split(',').map(n => n.trim()).filter(n => n);
        const combined = [...new Set([...currentNumbers, ...uniqueNumbers])].join(', ');
        setManualNumbers(combined);
        message.success(`Extracted ${uniqueNumbers.length} phone numbers from CSV${isHeader ? ' (header detected)' : ''}.`);
      } else {
        message.warning('No valid phone numbers found in the CSV file. Make sure numbers are 8-15 digits with country code.');
      }
    };
    reader.readAsText(file);
    return false; // Prevent automatic upload
  };

  // ── Launch broadcast ──
  const handleBroadcast = async () => {
    if (!selectedTemplate) return message.warning('Please select a template first.');

    // Validate variable mapping
    if (templateVars.length > 0) {
      const mapErr = validateMapping();
      if (mapErr) return message.error(mapErr);
    }

    // Collect all recipients
    let finalNumbers = [];
    if (manualNumbers.trim()) {
      const parsed = manualNumbers.split(',')
        .map(n => n.replace(/[^0-9]/g, ''))
        .filter(n => n.length > 7);
      finalNumbers = [...finalNumbers, ...parsed];
    }
    if (selectedLeadPhones.length > 0) {
      finalNumbers = [...finalNumbers, ...selectedLeadPhones];
    }
    finalNumbers = [...new Set(finalNumbers)];

    if (finalNumbers.length === 0) {
      return message.warning('Please provide at least one valid phone number.');
    }

    // Build body text for history
    const bodyComp = selectedTplObj?.components?.find(c => c.type === 'BODY');
    const templateBodyText = bodyComp?.text || '';

    try {
      setBroadcasting(true);
      const payload = {
        templateName: selectedTemplate,
        language: broadcastLanguage,
        templateBodyText,
        recipients: finalNumbers,
        ...(templateVars.length > 0 && { variableMapping }),
      };

      const res = await axiosConfig.post('/chatbot/broadcast', payload);
      if (res.data.successCount > 0 && res.data.failedCount === 0) {
        message.success(res.data.message || 'All broadcast messages sent successfully!');
        setManualNumbers('');
        setSelectedLeadPhones([]);
      } else if (res.data.successCount > 0 && res.data.failedCount > 0) {
        message.warning(res.data.message);
      } else {
        message.error(res.data.message || 'Broadcast failed.');
      }
      fetchData(); // refresh history table
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Broadcast failed. Please try again.';
      message.error(errMsg);
    } finally {
      setBroadcasting(false);
    }
  };

  // ── Leads table columns ──
  const leadColumns = [
    { title: 'Name',   dataIndex: 'name',   key: 'name',   render: t => <Text strong>{t}</Text> },
    { title: 'Phone',  dataIndex: 'phone',  key: 'phone' },
    { title: 'Email',  dataIndex: 'email',  key: 'email',  render: t => t || <Text type="secondary">—</Text> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color="blue">{s}</Tag> },
  ];

  // ── History table columns ──
  const historyColumns = [
    { title: 'Template',   dataIndex: 'templateName', key: 'templateName', render: t => <Text strong>{t}</Text> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: s => {
        const colorMap = { COMPLETED: 'green', PARTIAL_SUCCESS: 'orange', FAILED: 'red' };
        return <Tag color={colorMap[s] || 'default'}>{s}</Tag>;
      }
    },
    {
      title: 'Sent / Total', key: 'sent',
      render: (_, r) => `${r.successCount} / ${r.totalRecipients}`
    },
    { title: 'Failed', dataIndex: 'failedCount', key: 'failedCount', render: n => <Text type={n > 0 ? 'danger' : 'secondary'}>{n}</Text> },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: d => new Date(d).toLocaleString() },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" tip="Loading broadcast data..." /></div>;

  const bodyComp = selectedTplObj?.components?.find(c => c.type === 'BODY');
  const bodyText = bodyComp?.text || '';
  const preview  = buildPreview();

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <NotificationOutlined style={{ fontSize: 24, color: '#eb2f96' }} />
        <Title level={3} style={{ margin: 0 }}>WhatsApp Broadcast Campaigns</Title>
      </div>

      {/* ── Main Card ── */}
      <Card style={{ borderRadius: 16, marginBottom: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <Alert
          message="⚠️ Meta Pricing Notice"
          description="Broadcasting Marketing Templates will initiate Marketing Conversations. Meta charges a fee per 24-hour Marketing Conversation block based on your recipient's country code. Ensure you have sufficient balance in your Meta Business Account. Please check Meta's official pricing for exact rates."
          type="warning"
          showIcon
          style={{ marginBottom: 28, background: '#fff3cd', borderColor: '#ffeeba', color: '#856404' }}
        />

        {/* ── Step 1: Select Template ── */}
        <div style={{ marginBottom: 28 }}>
          <Text strong style={{ fontSize: 14 }}>Step 1 — Select Approved Template</Text>
          <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'flex-start' }}>
            <Select
              style={{ flex: 1 }}
              size="large"
              placeholder="Choose an approved template..."
              value={selectedTemplate}
              onChange={handleTemplateChange}
              options={templates.map(t => ({
                label: `${t.name}  (${t.category})`,
                value: t.name,
              }))}
            />
            <div style={{ flexShrink: 0 }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Language</Text>
              <Select
                size="large"
                style={{ width: 180 }}
                value={broadcastLanguage}
                onChange={val => setBroadcastLanguage(val)}
              >
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
            </div>
          </div>
          {/* Body text preview (raw) */}
          {bodyText && (
            <div style={{
              marginTop: 10, padding: '10px 14px',
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 8, fontSize: 13, color: '#475569'
            }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Template body:</Text>
              {bodyText}
            </div>
          )}
        </div>

        {/* ── Step 2: Variable Mapping (only shown when template has vars) ── */}
        {templateVars.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <Divider style={{ margin: '0 0 16px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Text strong style={{ fontSize: 14 }}>Step 2 — Map Variable Values</Text>
              <Tooltip title="For each {{N}} placeholder in your template body, choose where the value comes from — a lead field (auto-filled per recipient) or a fixed text (same for everyone).">
                <InfoCircleOutlined style={{ color: '#94a3b8' }} />
              </Tooltip>
            </div>

            {templateVars.map(n => {
              const src = variableMapping[String(n)] || '';
              const isFixed = src.startsWith('fixed:') || (!Object.keys(LEAD_FIELD_LABELS).includes(src) && src !== '');
              const selectedLeadField = Object.keys(LEAD_FIELD_LABELS).includes(src) ? src : null;

              return (
                <div
                  key={n}
                  style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 10, padding: '14px 16px', marginBottom: 10
                  }}
                >
                  {/* Variable badge */}
                  <div style={{
                    minWidth: 44, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg,#667eea,#764ba2)',
                    color: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 13, fontWeight: 700,
                    flexShrink: 0, marginTop: 2
                  }}>
                    {`{{${n}}}`}
                  </div>

                  <div style={{ flex: 1 }}>
                    {/* Source type toggle */}
                    <Radio.Group
                      size="small"
                      value={isFixed ? 'fixed' : (src ? 'lead' : '')}
                      onChange={e => {
                        if (e.target.value === 'lead') updateMapping(n, 'lead_name');
                        else updateMapping(n, 'fixed:');
                      }}
                      style={{ marginBottom: 10 }}
                    >
                      <Radio.Button value="lead">📋 From Lead</Radio.Button>
                      <Radio.Button value="fixed">✏️ Fixed Text</Radio.Button>
                    </Radio.Group>

                    {/* Lead field dropdown */}
                    {!isFixed && (
                      <Select
                        size="middle"
                        style={{ width: '100%' }}
                        placeholder="Choose lead field..."
                        value={selectedLeadField}
                        onChange={v => updateMapping(n, v)}
                        options={Object.entries(LEAD_FIELD_LABELS).map(([val, label]) => ({
                          value: val, label
                        }))}
                      />
                    )}

                    {/* Fixed value input */}
                    {isFixed && (
                      <Input
                        placeholder={`Fixed value for {{${n}}} — same for every recipient`}
                        value={getFixedText(n)}
                        onChange={e => updateFixedValue(n, e.target.value)}
                        size="middle"
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Live preview */}
            {preview && preview !== bodyText && (
              <div style={{
                marginTop: 4, padding: '10px 14px',
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: 8, fontSize: 13
              }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                  Preview (sample — first recipient with lead data):
                </Text>
                <Text style={{ color: '#166534' }}>{preview}</Text>
              </div>
            )}
            <Divider style={{ margin: '20px 0 0' }} />
          </div>
        )}

        {/* ── Step 3: Manual Numbers ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Text strong style={{ fontSize: 14 }}>
                {templateVars.length > 0 ? 'Step 3' : 'Step 2'} — Phone Numbers
              </Text>
              <Text type="secondary" style={{ display: 'block', fontSize: 12, margin: '6px 0 8px' }}>
                Enter numbers with country code, no + sign (e.g. 923001234567, 923331234567), or import from CSV.
              </Text>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <Button size="small" onClick={downloadCsvTemplate} style={{ fontSize: 12 }}>
                📥 Download Template
              </Button>
              <Upload accept=".csv" beforeUpload={handleCsvUpload} showUploadList={false}>
                <Button icon={<UploadOutlined />} size="small" style={{ fontSize: 12 }}>Extract from CSV</Button>
              </Upload>
            </div>
          </div>
          <div style={{ 
            padding: '8px 12px', background: '#f0f9ff', border: '1px solid #bae6fd', 
            borderRadius: 6, marginBottom: 10, fontSize: 12, color: '#0369a1' 
          }}>
            <strong>CSV Format:</strong> Upload a CSV file with a <code style={{ background: '#e0f2fe', padding: '1px 4px', borderRadius: 3 }}>phone</code> column. 
            One number per row with country code (e.g. <code style={{ background: '#e0f2fe', padding: '1px 4px', borderRadius: 3 }}>923001234567</code>). 
            The system will auto-detect the phone column from headers like: phone, mobile, whatsapp, number, contact.
          </div>
          <TextArea
            rows={3}
            placeholder="923001234567, 923331234567..."
            value={manualNumbers}
            onChange={e => setManualNumbers(e.target.value)}
          />
        </div>

        {/* ── Step 4: Select from Leads ── */}
        <div style={{ marginBottom: 28 }}>
          <Text strong style={{ fontSize: 14 }}>
            {templateVars.length > 0 ? 'Step 4' : 'Step 3'} — Select from Captured Leads
          </Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 12, margin: '6px 0 8px' }}>
            {templateVars.length > 0
              ? 'When "From Lead" is selected for a variable, the lead\'s field will be used automatically per recipient.'
              : 'Select leads to include in this broadcast.'}
          </Text>
          <Table
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: leads.filter(l => selectedLeadPhones.includes(l.phone)).map(l => l._id),
              onChange: (_, rows) => setSelectedLeadPhones(rows.map(r => r.phone)),
            }}
            dataSource={leads.map(l => ({ ...l, key: l._id }))}
            columns={leadColumns}
            pagination={{ pageSize: 5 }}
            size="small"
            style={{ marginTop: 8 }}
          />
        </div>

        {/* ── Launch Button ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid #f0f0f0', paddingTop: 20
        }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {[
              manualNumbers.trim()
                ? `${manualNumbers.split(',').filter(n => n.replace(/[^0-9]/g, '').length > 7).length} manual number(s)`
                : null,
              selectedLeadPhones.length > 0
                ? `${selectedLeadPhones.length} lead(s) selected`
                : null,
            ].filter(Boolean).join(' + ') || 'No recipients selected yet'}
          </Text>
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={handleBroadcast}
            loading={broadcasting}
            disabled={!selectedTemplate}
            style={{ background: '#eb2f96', borderColor: '#eb2f96', borderRadius: 8 }}
          >
            Launch Campaign
          </Button>
        </div>
      </Card>

      {/* ── Broadcast History ── */}
      <div style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>Past Campaigns</Title>
        <Text type="secondary" style={{ fontSize: 12 }}>Last 50 broadcasts</Text>
      </div>
      <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <Table
          dataSource={broadcastHistory.map(b => ({ ...b, key: b._id }))}
          columns={historyColumns}
          pagination={{ pageSize: 10 }}
          size="small"
          locale={{ emptyText: 'No campaigns yet. Launch your first broadcast above.' }}
        />
      </Card>
    </div>
  );
};

export default BroadcastManager;
