import React, { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Button, Typography, message, Spin, Switch, Select, Alert, Modal, Table, Popconfirm, Row, Col, Space, Divider, Tag, Statistic, Progress } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined, SettingOutlined, LinkOutlined, DisconnectOutlined, SafetyCertificateOutlined, CodeOutlined, DashboardOutlined, DollarOutlined, RobotOutlined } from '@ant-design/icons';
import axiosConfig from '../../utils/axiosConfig';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DiscordSettings = ({ clientId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [discordState, setDiscordState] = useState(null); // guildId, guildName, botMode
  const [discordChannelsList, setDiscordChannelsList] = useState([]);
  const [discordRolesList, setDiscordRolesList] = useState([]); // if possible to fetch, else let it be just string inputs
  const [stats, setStats] = useState(null);
  
  // Custom Bot Modal
  const [isCustomBotModalOpen, setIsCustomBotModalOpen] = useState(false);
  const [customBotForm] = Form.useForm();
  const [customBotLoading, setCustomBotLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [clientId]);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const res = await axiosConfig.get('/discord/settings');
      if (res.data.success) {
        const d = res.data.discord || {};
        const c = res.data.channels || {};
        
        setDiscordState({
          guildId: d.guildId,
          guildName: d.guildName,
          botMode: d.botMode,
          connected: c.discord === true && !!d.guildId
        });

        form.setFieldsValue({
          enabled: c.discord === true,
          allowedChannelIds: d.allowedChannelIds || [],
          modLogChannelId: d.modLogChannelId || '',
          moderatorPrompt: d.moderatorPrompt || '',
          policy: {
            privacyPolicy: d.policy?.privacyPolicy || '',
            terms: d.policy?.terms || '',
          },
          rules: d.rules || [],
          moderation: {
            enabled: d.moderation?.enabled !== false,
            dryRun: d.moderation?.dryRun === true,
            aiMode: d.moderation?.aiMode || (d.moderation?.aiClassify ? 'smart' : 'off'),
            trustedRoleIds: d.moderation?.trustedRoleIds || [],
            exemptChannelIds: d.moderation?.exemptChannelIds || [],
            scanOnlyNewMembers: d.moderation?.scanOnlyNewMembers === true,
            newMemberDays: d.moderation?.newMemberDays || 7,
            aiChecksPerMinute: d.moderation?.aiChecksPerMinute || 30,
            spamLimit: d.moderation?.spamLimit || 5,
            actions: {
              delete: d.moderation?.actions?.delete !== false,
              warn: d.moderation?.actions?.warn !== false,
              timeout: d.moderation?.actions?.timeout !== false,
              kick: d.moderation?.actions?.kick !== false,
              ban: d.moderation?.actions?.ban === true,
            },
            escalation: {
              strikeLimit: d.moderation?.escalation?.strikeLimit || 3,
              windowDays: d.moderation?.escalation?.windowDays || 7,
              action: d.moderation?.escalation?.action || 'kick',
              timeoutMinutes: d.moderation?.escalation?.timeoutMinutes || 60,
            }
          }
        });

        // Only fetch discord channels/stats if connected
        if (c.discord && d.guildId) {
          fetchDiscordChannels();
          fetchStats();
        }
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to load Discord settings");
    } finally {
      setFetching(false);
    }
  };

  const fetchDiscordChannels = async () => {
    try {
      const res = await axiosConfig.get('/discord/channels');
      if (res.data.success) {
        setDiscordChannelsList(res.data.channels || []);
      }
    } catch (err) {
      console.warn("Failed to fetch discord channels", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axiosConfig.get('/discord/stats?days=7');
      if (res.data.success) setStats(res.data.summary);
    } catch (err) {
      console.warn("Failed to fetch moderation stats", err);
    }
  };

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      const res = await axiosConfig.put('/discord/settings', values);
      if (res.data.success) {
        message.success('Discord settings updated successfully!');
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to update Discord settings");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await axiosConfig.get('/discord/connect-url');
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      message.error("Failed to get connect URL");
    }
  };

  const handleDisconnect = async () => {
    try {
      const res = await axiosConfig.post('/discord/disconnect');
      if (res.data.success) {
        message.success("Disconnected from Discord");
        fetchSettings();
      }
    } catch (err) {
      message.error("Failed to disconnect");
    }
  };

  const handleCustomBotSubmit = async (values) => {
    try {
      setCustomBotLoading(true);
      const res = await axiosConfig.post('/discord/custom-bot', values);
      if (res.data.success) {
        message.success("Custom bot connected!");
        setIsCustomBotModalOpen(false);
        customBotForm.resetFields();
        fetchSettings();
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to connect custom bot");
    } finally {
      setCustomBotLoading(false);
    }
  };

  if (fetching) return <div style={{ textAlign: 'center', padding: 50 }}><Spin /></div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <SettingOutlined style={{ fontSize: 24, color: '#5865F2' }} />
        <Title level={3} style={{ margin: 0 }}>Discord Integration & AI Moderation</Title>
      </div>

      {/* ── CONNECTION STATUS ── */}
      <Card style={{ borderRadius: 12, marginBottom: 24, borderColor: discordState?.connected ? '#bbf7d0' : '#e2e8f0', background: discordState?.connected ? '#f0fdf4' : '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>👾</span>
              <Title level={4} style={{ margin: 0, color: discordState?.connected ? '#166534' : '#334155' }}>
                {discordState?.connected ? `Connected to: ${discordState.guildName}` : 'Discord Not Connected'}
              </Title>
              {discordState?.connected && (
                <Tag color={discordState.botMode === 'custom' ? 'purple' : 'blue'}>
                  {discordState.botMode === 'custom' ? 'Custom Bot' : 'Shared Bot'}
                </Tag>
              )}
            </div>
            <Text type="secondary">
              {discordState?.connected 
                ? 'Your AI moderator is active on your Discord server. Configure rules below.'
                : 'Connect your Discord server to enable AI-powered moderation, auto-replies, and community management.'}
            </Text>
          </div>
          <div>
            {discordState?.connected ? (
              <Popconfirm title="Are you sure you want to disconnect Discord? The bot will leave your server." onConfirm={handleDisconnect} okText="Disconnect" okButtonProps={{ danger: true }}>
                <Button danger icon={<DisconnectOutlined />}>Disconnect</Button>
              </Popconfirm>
            ) : (
              <Space>
                <Button onClick={() => setIsCustomBotModalOpen(true)}>Use Custom Bot Token</Button>
                <Button type="primary" style={{ background: '#5865F2', borderColor: '#5865F2' }} icon={<LinkOutlined />} onClick={handleConnect}>
                  Connect to Discord
                </Button>
              </Space>
            )}
          </div>
        </div>
      </Card>

      {/* ── AI EFFICIENCY DASHBOARD ── */}
      {discordState?.connected && stats && (
        <Card title={<><DashboardOutlined /> AI Efficiency (Last 7 Days)</>} style={{ borderRadius: 12, marginBottom: 24, background: '#f8fafc' }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="Messages Scanned" value={stats.messagesSeen} prefix={<RobotOutlined />} />
            </Col>
            <Col span={6}>
              <Statistic title="Handled For Free" value={stats.percentHandledFree} suffix="%" valueStyle={{ color: '#166534' }} />
              <Progress percent={stats.percentHandledFree} size="small" showInfo={false} strokeColor="#166534" />
            </Col>
            <Col span={6}>
              <Statistic title="GPT Calls" value={stats.gptCalls} />
              <Text type="secondary" style={{ fontSize: '12px' }}>Cost: ~${stats.estimatedGptCost.toFixed(3)}</Text>
            </Col>
            <Col span={6}>
              <Statistic title="Estimated Savings" value={stats.estimatedSavings} precision={2} prefix={<DollarOutlined />} valueStyle={{ color: '#16a34a' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>By skipping GPT when possible</Text>
            </Col>
          </Row>
          <Divider style={{ margin: '16px 0' }} />
          <Row gutter={16}>
            <Col span={24}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Breakdown: <b>{stats.decidedByRules}</b> stopped by rules | <b>{stats.skippedPreFilter}</b> skipped (pre-filter) | <b>{stats.cacheHits}</b> cached | <b>{stats.moderationApiCalls}</b> OpenAI Mod API. | <b>{stats.violations}</b> total violations caught.
              </Text>
            </Col>
          </Row>
        </Card>
      )}

      <Form form={form} layout="vertical" onFinish={handleFinish} disabled={!discordState?.connected}>
        <Row gutter={24}>
          <Col span={24}>
            {/* ── GENERAL SETTINGS ── */}
            <Card title={<><SettingOutlined /> General Configuration</>} style={{ borderRadius: 12, marginBottom: 24 }}>
              <Form.Item name="enabled" valuePropName="checked">
                <Switch checkedChildren="Integration Enabled" unCheckedChildren="Integration Disabled" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="allowedChannelIds" label="Allowed Channels (Listen In)" extra="Leave empty to listen to all text channels.">
                    <Select mode="multiple" placeholder="Select channels" style={{ width: '100%' }}>
                      {discordChannelsList.map(ch => (
                        <Option key={ch.id} value={ch.id}>#{ch.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="modLogChannelId" label="Moderation Log Channel" extra="Where the bot reports strikes, kicks, and bans.">
                    <Select placeholder="Select a channel" allowClear style={{ width: '100%' }}>
                      {discordChannelsList.map(ch => (
                        <Option key={ch.id} value={ch.id}>#{ch.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="moderatorPrompt" label="AI Moderator Prompt (Custom Instructions)">
                <TextArea rows={4} placeholder="e.g. You are a strict moderator. Answer user questions based on the terms." />
              </Form.Item>
            </Card>

            {/* ── MODERATION SETTINGS ── */}
            <Card title={<><SafetyCertificateOutlined /> AI Moderation Engine</>} style={{ borderRadius: 12, marginBottom: 24 }}>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item name={['moderation', 'enabled']} valuePropName="checked">
                    <Switch checkedChildren="Moderation ON" unCheckedChildren="Moderation OFF" />
                  </Form.Item>
                  <Form.Item name={['moderation', 'dryRun']} valuePropName="checked" extra="If ON, the bot will log violations but won't delete or punish.">
                    <Switch checkedChildren="Dry Run (Test Mode) ON" unCheckedChildren="Dry Run OFF" />
                  </Form.Item>
                  <Form.Item name={['moderation', 'aiMode']} label="AI Scan Mode">
                    <Select>
                      <Option value="smart">Smart (Recommended) - Fast, cheap, layered filtering</Option>
                      <Option value="strict">Strict - Uses GPT heavily (higher cost)</Option>
                      <Option value="off">Off - Only use keyword rules</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name={['moderation', 'spamLimit']} label="Spam Limit (Messages / 10s)">
                    <InputNumber style={{ width: '100%' }} min={2} max={30} />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Text strong>Allowed Actions (Bot Permissions)</Text>
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Form.Item name={['moderation', 'actions', 'delete']} valuePropName="checked" noStyle>
                      <Switch size="small" />
                    </Form.Item>
                    <Text style={{ marginLeft: 8 }}>Delete Messages</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Form.Item name={['moderation', 'actions', 'warn']} valuePropName="checked" noStyle>
                      <Switch size="small" />
                    </Form.Item>
                    <Text style={{ marginLeft: 8 }}>Warn Users</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Form.Item name={['moderation', 'actions', 'timeout']} valuePropName="checked" noStyle>
                      <Switch size="small" />
                    </Form.Item>
                    <Text style={{ marginLeft: 8 }}>Timeout (Mute)</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Form.Item name={['moderation', 'actions', 'kick']} valuePropName="checked" noStyle>
                      <Switch size="small" />
                    </Form.Item>
                    <Text style={{ marginLeft: 8 }}>Kick</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <Form.Item name={['moderation', 'actions', 'ban']} valuePropName="checked" noStyle>
                      <Switch size="small" />
                    </Form.Item>
                    <Text style={{ marginLeft: 8 }}>Ban (Dangerous)</Text>
                  </div>
                </Col>
              </Row>

              <Divider />
              <Title level={5}>Cost & Performance</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Optimize your AI spending by skipping trusted members and trivial messages.
              </Text>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={['moderation', 'trustedRoleIds']} label="Trusted Roles (Skip AI)" extra="Users with these roles are never scanned by AI.">
                    <Select mode="tags" placeholder="Enter Role IDs (e.g. 123456789)" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={['moderation', 'exemptChannelIds']} label="Exempt Channels" extra="Messages in these channels are ignored by AI.">
                    <Select mode="multiple" placeholder="Select channels" style={{ width: '100%' }}>
                      {discordChannelsList.map(ch => (
                        <Option key={ch.id} value={ch.id}>#{ch.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={['moderation', 'scanOnlyNewMembers']} valuePropName="checked" label="Scan Only New Members">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={['moderation', 'newMemberDays']} label="New Member Window (Days)">
                    <InputNumber style={{ width: '100%' }} min={1} max={365} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={['moderation', 'aiChecksPerMinute']} label="Max GPT Calls / Min">
                    <InputNumber style={{ width: '100%' }} min={1} max={300} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider />
              <Title level={5}>Strike Escalation Policy</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                What happens when a user accumulates multiple warnings?
              </Text>
              
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name={['moderation', 'escalation', 'strikeLimit']} label="Strikes to Trigger">
                    <InputNumber style={{ width: '100%' }} min={1} max={10} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['moderation', 'escalation', 'windowDays']} label="Time Window (Days)">
                    <InputNumber style={{ width: '100%' }} min={1} max={30} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['moderation', 'escalation', 'action']} label="Action to Apply">
                    <Select>
                      <Option value="none">None</Option>
                      <Option value="timeout">Timeout</Option>
                      <Option value="kick">Kick</Option>
                      <Option value="ban">Ban</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={['moderation', 'escalation', 'timeoutMinutes']} label="Timeout Duration (Mins)">
                    <InputNumber style={{ width: '100%' }} min={1} max={40320} />
                  </Form.Item>
                </Col>
              </Row>

            </Card>

            {/* ── RULES ── */}
            <Card title={<><CodeOutlined /> Dynamic Rules</>} style={{ borderRadius: 12, marginBottom: 24 }}>
              <Alert 
                message="Custom Rules" 
                description="Define rules for your community. The AI engine will evaluate messages against these rules to issue warnings." 
                type="info" showIcon style={{ marginBottom: 16 }} 
              />
              
              <Form.List name="rules">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card size="small" key={key} style={{ marginBottom: 16, background: '#f8fafc' }}
                        extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />}
                      >
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item {...restField} name={[name, 'name']} label="Rule Name" rules={[{ required: true }]}>
                              <Input placeholder="e.g. No Self-Promotion" />
                            </Form.Item>
                          </Col>
                          <Col span={10}>
                            <Form.Item {...restField} name={[name, 'description']} label="Description (AI Context)">
                              <Input placeholder="Explain the rule so the AI can interpret it." />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item {...restField} name={[name, 'action']} label="Action">
                              <Select>
                                <Option value="warn">Warn (Strike)</Option>
                                <Option value="delete">Delete</Option>
                                <Option value="timeout">Timeout</Option>
                                <Option value="kick">Kick</Option>
                                <Option value="ban">Ban</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item {...restField} name={[name, 'keywords']} label="Trigger Keywords (Hit Enter to add)" style={{ marginBottom: 0 }}>
                          <Select mode="tags" placeholder="Exact words or phrases to block (Optional if AI is enabled)" />
                        </Form.Item>
                      </Card>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Rule
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>

            {/* ── POLICY ── */}
            <Card title="Community Terms & Privacy Policy" style={{ borderRadius: 12, marginBottom: 24 }}>
              <Form.Item name={['policy', 'terms']} label="Terms and Conditions" extra="These terms dictate community guidelines.">
                <TextArea rows={6} placeholder="Paste your community terms here..." />
              </Form.Item>
              <Form.Item name={['policy', 'privacyPolicy']} label="Privacy Policy" extra="Data usage and privacy guidelines.">
                <TextArea rows={4} placeholder="Paste your privacy policy here..." />
              </Form.Item>
            </Card>

          </Col>
        </Row>

        <Form.Item style={{ textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={loading}>
            Save Discord Settings
          </Button>
        </Form.Item>
      </Form>

      {/* Custom Bot Modal */}
      <Modal
        title="Connect Custom Bot Token"
        open={isCustomBotModalOpen}
        onCancel={() => setIsCustomBotModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={customBotForm} layout="vertical" onFinish={handleCustomBotSubmit}>
          <Alert message="Advanced Feature" description="Use your own bot application. Make sure you have invited the bot to your server with the required permissions." type="warning" showIcon style={{ marginBottom: 16 }} />
          <Form.Item name="guildId" label="Server (Guild) ID" rules={[{ required: true }]}>
            <Input placeholder="e.g. 1556534621271756820" />
          </Form.Item>
          <Form.Item name="token" label="Bot Token" rules={[{ required: true }]}>
            <Input.Password placeholder="Enter Discord Bot Token" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setIsCustomBotModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={customBotLoading}>Connect Bot</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DiscordSettings;
