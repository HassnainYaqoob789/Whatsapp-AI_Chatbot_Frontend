import React, { useContext, useEffect, useState } from 'react';
import { Layout, Menu, Button, Table, Modal, Form, Input, message, Popconfirm, Switch, Tag, Space, Typography, Dropdown, Card, Row, Col, Progress, Tooltip } from 'antd';
import { LogoutOutlined, TeamOutlined, UserAddOutlined, EditOutlined, DeleteOutlined, PauseCircleOutlined, CheckCircleOutlined, BarChartOutlined, MessageOutlined, FireOutlined, RobotOutlined, UserOutlined, SettingOutlined, DownOutlined } from '@ant-design/icons';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/axiosConfig';
import { NaracordLogo, NaracordIcon } from '../../components/NaracordLogo';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const SuperAdminDashboard = () => {
  const { logout, user } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('clients');
  const [globalStats, setGlobalStats] = useState(null);
  const [quotaReport, setQuotaReport] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Add Client Modal
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();

  // Edit Client Modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [editingClient, setEditingClient] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/clients');
      setClients(response.data.clients);
    } catch (error) {
      message.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    try {
      const res = await api.get('/clients/analytics/global');
      if (res.data.success) {
        setGlobalStats(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load global stats");
    }
  };

  const fetchQuotaReport = async () => {
    try {
      const res = await api.get('/chatbot/quota/usage-report');
      if (res.data.success) {
        setQuotaReport(res.data);
      }
    } catch (error) {
      console.error("Failed to load quota report");
    }
  };

  useEffect(() => {
    if (activeTab === 'quota') fetchQuotaReport();
  }, [activeTab]);

  // ────── ADD CLIENT ──────
  const handleAddClient = async (values) => {
    try {
      // 1. Create the Client Configuration
      const clientRes = await api.post('/clients', {
        businessName: values.businessName,
        systemPrompt: values.systemPrompt,
        leadNotificationEmail: values.leadNotificationEmail
      });

      const clientId = clientRes.data.client._id;

      // 2. Create the User Login for this client
      await api.post('/auth/create-client-admin', {
        email: values.adminEmail,
        password: values.adminPassword,
        clientId: clientId
      });

      message.success(`"${values.businessName}" created with admin login!`);
      setIsAddModalVisible(false);
      addForm.resetFields();
      fetchClients();

    } catch (error) {
      message.error(error.response?.data?.message || "Failed to create client");
    }
  };

  // ────── EDIT CLIENT ──────
  const openEditModal = (client) => {
    setEditingClient(client);
    editForm.setFieldsValue({
      businessName: client.businessName,
      systemPrompt: client.systemPrompt,
      leadNotificationEmail: client.leadNotificationEmail
    });
    setIsEditModalVisible(true);
  };

  const handleEditClient = async (values) => {
    try {
      await api.put(`/clients/${editingClient._id}`, values);
      message.success("Client updated successfully!");
      setIsEditModalVisible(false);
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      message.error("Failed to update client");
    }
  };

  // ────── DELETE CLIENT ──────
  const handleDeleteClient = async (id) => {
    try {
      await api.delete(`/clients/${id}`);
      message.success("Client deleted.");
      fetchClients();
    } catch (error) {
      message.error("Failed to delete client");
    }
  };

  // ────── TOGGLE ACTIVE ──────
  const handleToggleActive = async (clientId, currentStatus) => {
    try {
      await api.put(`/clients/${clientId}`, { isActive: !currentStatus });
      message.success(`Client ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchClients();
    } catch (error) {
      message.error("Failed to toggle status");
    }
  };

  // ────── TABLE COLUMNS ──────
  const columns = [
    { title: 'Business Name', dataIndex: 'businessName', key: 'businessName', render: (text) => <Text strong>{text}</Text> },
    { title: 'Phone Number ID', dataIndex: 'phoneNumberId', key: 'phoneNumberId', render: (text) => <Text copyable style={{ fontSize: 12 }}>{text}</Text> },
    { title: 'WABA ID', dataIndex: 'wabaId', key: 'wabaId', render: (text) => <Text copyable style={{ fontSize: 12 }}>{text || 'N/A'}</Text> },
    {
      title: 'Origin',
      dataIndex: 'origin',
      key: 'origin',
      render: (origin) => (
        <Tag color={origin === 'PLUGIN' ? 'blue' : 'purple'}>
          {origin === 'PLUGIN' ? 'Plugin' : 'Direct'}
        </Tag>
      ),
      filters: [
        { text: 'Plugin', value: 'PLUGIN' },
        { text: 'Direct', value: 'DIRECT' },
      ],
      onFilter: (value, record) => record.origin === value,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record._id, isActive)}
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<PauseCircleOutlined />}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)}>Edit</Button>
          <Popconfirm title="Delete this client?" onConfirm={() => handleDeleteClient(record._id)} okText="Delete" okButtonProps={{ danger: true }}>
            <Button danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ────── CLIENT FORM ──────
  const ClientFormFields = ({ isEditMode }) => (
    <>
      <Form.Item name="businessName" label="Business Name" rules={[{ required: true }]}>
        <Input placeholder="e.g. Al-Rehan Real Estate" />
      </Form.Item>

      <div style={{ padding: '10px 14px', background: '#f0fdf4', borderLeft: '4px solid #22c55e', borderRadius: '4px', marginBottom: '20px' }}>
        <Text style={{ color: '#166534', fontSize: '13px' }}>
          <strong>📱 WhatsApp Connection:</strong> You no longer need to enter Meta API keys here. 
          The client will connect their WhatsApp securely via the "Connect with Meta" popup when they log in to their dashboard.
        </Text>
      </div>

      <Form.Item name="systemPrompt" label="AI System Prompt (Personality & Knowledge Base)" rules={[{ required: true }]}>
        <Input.TextArea rows={6} placeholder="You are an AI assistant for [Business Name]. You help customers with..." />
      </Form.Item>

      <Form.Item name="leadNotificationEmail" label="Sales/Lead Notification Email">
        <Input placeholder="sales@business.com" />
      </Form.Item>

      {!isEditMode && (
        <>
          <div style={{ borderTop: '1px solid #f0f0f0', margin: '16px 0', paddingTop: 16 }}>
            <Title level={5}>Create Dashboard Login for Client</Title>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item name="adminEmail" label="Admin Email" style={{ flex: 1 }} rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="admin@business.com" />
            </Form.Item>
            <Form.Item name="adminPassword" label="Admin Password" style={{ flex: 1 }} rules={[{ required: true, min: 6 }]}>
              <Input.Password placeholder="Min 6 characters" />
            </Form.Item>
          </div>
        </>
      )}

      <Form.Item style={{ textAlign: 'right', marginTop: 16, marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" size="large">
          {isEditMode ? 'Save Changes' : 'Create Client & Admin'}
        </Button>
      </Form.Item>
    </>
  );

  // ════════════════════════
  //  PROFILE DROPDOWN ITEMS
  // ════════════════════════

  const profileMenuItems = [
    {
      key: 'email',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.email}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Super Admin</div>
        </div>
      ),
      disabled: true
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

  // ════════════════════════
  //  RENDER ANALYTICS
  // ════════════════════════

  const cardStyle = {
    borderRadius: 16,
    background: '#fff',
    border: '1px solid #f0f0f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
  };

  const renderGlobalAnalytics = () => {
    if (!globalStats) return <div style={{ textAlign: 'center', padding: 80 }}>Loading analytics...</div>;

    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>🌍 Global Platform Analytics</Title>
          <Text type="secondary">Overview of all businesses on Naracord AI platform</Text>
        </div>

        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card style={{ ...cardStyle, borderTop: '3px solid #1890ff' }} bodyStyle={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TeamOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <Text type="secondary" style={{ fontWeight: 500 }}>Total Clients</Text>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#262626' }}>{globalStats.totalClients}</div>
              <Tag color="green" style={{ marginTop: 8 }}>{globalStats.activeClients} Active</Tag>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ ...cardStyle, borderTop: '3px solid #52c41a' }} bodyStyle={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <Text type="secondary" style={{ fontWeight: 500 }}>Total Chats</Text>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#262626' }}>{globalStats.totalChats}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>Across all businesses</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ ...cardStyle, borderTop: '3px solid #eb2f96' }} bodyStyle={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eb2f96', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FireOutlined style={{ color: '#fff', fontSize: 18 }} />
                </div>
                <Text type="secondary" style={{ fontWeight: 500 }}>Total Leads</Text>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#262626' }}>{globalStats.totalLeads}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>Captured by AI</Text>
            </Card>
          </Col>
        </Row>

        <Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>Token Usage & Distribution (by Origin)</Title>
        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12}>
            <Card style={{ ...cardStyle, borderLeft: '4px solid #13c2c2' }} bodyStyle={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text type="secondary" style={{ fontWeight: 500, fontSize: 16 }}>WordPress Plugin Clients</Text>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#262626', marginTop: 8 }}>
                    {globalStats.pluginClients} <Text type="secondary" style={{ fontSize: 14, fontWeight: 400 }}>clients</Text>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Total Tokens Consumed</Text>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#13c2c2' }}>
                    {(globalStats.pluginTokens || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12}>
            <Card style={{ ...cardStyle, borderLeft: '4px solid #722ed1' }} bodyStyle={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text type="secondary" style={{ fontWeight: 500, fontSize: 16 }}>Direct SaaS Clients</Text>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#262626', marginTop: 8 }}>
                    {globalStats.directClients} <Text type="secondary" style={{ fontSize: 14, fontWeight: 400 }}>clients</Text>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Total Tokens Consumed</Text>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#722ed1' }}>
                    {(globalStats.directTokens || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        <Card style={cardStyle} bodyStyle={{ padding: 24 }}>
          <Title level={5} style={{ marginBottom: 16 }}>🏆 Top Performing Clients (By Leads)</Title>
          <Table
            dataSource={globalStats.topClients}
            rowKey="_id"
            pagination={false}
            columns={[
              { title: 'Business Name', dataIndex: 'businessName', key: 'businessName', render: t => <Text strong>{t}</Text> },
              { title: 'Leads Generated', dataIndex: 'leadsCount', key: 'leadsCount', render: val => <Tag color="pink">{val} Leads</Tag> }
            ]}
          />
        </Card>
      </div>
    );
  };

  // ════════════════════════
  //  RENDER QUOTA USAGE
  // ════════════════════════
  const [isQuotaModalVisible, setIsQuotaModalVisible] = useState(false);
  const [quotaForm] = Form.useForm();
  const [editingQuotaClient, setEditingQuotaClient] = useState(null);

  const openQuotaModal = (client) => {
    setEditingQuotaClient(client);
    quotaForm.setFieldsValue({
      monthlyTokenLimit: client.monthlyQuota?.limit || 100000,
      dailyTokenLimit: client.dailyQuota?.limit || 10000
    });
    setIsQuotaModalVisible(true);
  };

  const handleUpdateQuota = async (values) => {
    try {
      await api.put('/chatbot/quota/limits', {
        clientId: editingQuotaClient._id,
        monthlyTokenLimit: values.monthlyTokenLimit,
        dailyTokenLimit: values.dailyTokenLimit
      });
      message.success("Quota limits updated");
      setIsQuotaModalVisible(false);
      fetchQuotaReport();
    } catch (error) {
      message.error("Failed to update quota limits");
    }
  };

  const renderQuotaReport = () => {
    if (!quotaReport) return <div style={{ textAlign: 'center', padding: 80 }}>Loading quota...</div>;

    const quotaColumns = [
      { 
        title: 'Business Name', 
        dataIndex: 'businessName', 
        key: 'businessName', 
        render: t => <Text strong style={{ color: '#0F172A' }}>{t}</Text> 
      },
      { 
        title: 'AI Model', 
        dataIndex: 'aiModel', 
        key: 'aiModel', 
        render: t => <Tag color={t === 'free' ? 'default' : 'purple'}>{t || 'gemini-1.5-flash'}</Tag> 
      },
      {
        title: 'Daily Token Usage',
        key: 'dailyUsage',
        render: (_, record) => {
          const isManaged = record.useNaracordQuota !== false;
          if (!isManaged) {
            return <Tag color="cyan">Unlimited (BYOK)</Tag>;
          }
          const used = record.dailyQuota?.used || 0;
          const limit = record.dailyQuota?.limit || 15000;
          const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
          const stroke = pct > 90 ? '#ef4444' : pct > 70 ? '#f97316' : '#5850ec';

          return (
            <div style={{ minWidth: 160 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <Text strong>{used.toLocaleString()}</Text>
                <Text type="secondary">/ {limit.toLocaleString()} tokens</Text>
              </div>
              <Progress percent={pct} size="small" strokeColor={stroke} showInfo={false} />
            </div>
          );
        }
      },
      {
        title: 'Monthly Token Usage',
        key: 'monthlyUsage',
        render: (_, record) => {
          const isManaged = record.useNaracordQuota !== false;
          if (!isManaged) {
            return <Tag color="cyan">Unlimited (BYOK)</Tag>;
          }
          const used = record.monthlyQuota?.used || 0;
          const limit = record.monthlyQuota?.limit || 500000;
          const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
          const stroke = pct > 90 ? '#ef4444' : pct > 70 ? '#f97316' : '#5850ec';

          return (
            <div style={{ minWidth: 160 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <Text strong>{used.toLocaleString()}</Text>
                <Text type="secondary">/ {limit.toLocaleString()} tokens</Text>
              </div>
              <Progress percent={pct} size="small" strokeColor={stroke} showInfo={false} />
            </div>
          );
        }
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Button size="small" type="primary" ghost onClick={() => openQuotaModal(record)}>
            Update Limits
          </Button>
        )
      }
    ];

    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>⚡ AI Quota & Token Billing</Title>
          <Text type="secondary">
            Monitor real-time AI token consumption (prompt + response) processed by WhatsApp chatbot for each client.
          </Text>
        </div>
        <Card style={cardStyle} bodyStyle={{ padding: 24 }}>
          <Table
            dataSource={quotaReport.clients}
            columns={quotaColumns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    );
  };

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
          <NaracordLogo size="sm" badge="SUPER ADMIN" theme="dark" />
        </div>

        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={(e) => { setActiveTab(e.key); setSidebarOpen(false); }}
        >
          <Menu.Item key="clients" icon={<TeamOutlined />}>Manage Clients</Menu.Item>
          <Menu.Item key="analytics" icon={<BarChartOutlined />}>Global Analytics</Menu.Item>
          <Menu.Item key="quota" icon={<FireOutlined />}>AI Quota & Billing</Menu.Item>
        </Menu>

        {/* Sidebar bottom profile */}
        <div className="sidebar-bottom">
          <Dropdown menu={{ items: profileMenuItems }} trigger={['click']} placement="topRight">
            <div className="sidebar-profile">
              <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                <UserOutlined />
              </div>
              <div className="sidebar-user-info">
                <span className="user-name">{user?.email?.split('@')[0]}</span>
                <span className="user-role">Super Admin</span>
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
            {activeTab === 'clients' ? 'Client Management' : activeTab === 'analytics' ? 'Global Analytics' : 'AI Quota & Billing'}
          </div>

          <div className="header-right">
            <Dropdown menu={{ items: profileMenuItems }} trigger={['click']}>
              <div className="profile-trigger">
                <div className="profile-info">
                  <span className="profile-name">{user?.email?.split('@')[0]}</span>
                  <span className="profile-role">Super Admin</span>
                </div>
                <div className="profile-avatar" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                  <UserOutlined />
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ padding: '24px', background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
          {activeTab === 'clients' && (
            <Card style={cardStyle} bodyStyle={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <Title level={4} style={{ margin: 0 }}>Registered Businesses</Title>
                  <Text type="secondary">{clients.length} client(s) on the platform</Text>
                </div>
                <Button type="primary" size="large" icon={<UserAddOutlined />} onClick={() => setIsAddModalVisible(true)} style={{ borderRadius: 10, background: 'var(--gradient-primary)', border: 'none' }}>
                  Onboard New Client
                </Button>
              </div>

              <Table
                dataSource={clients}
                columns={columns}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            </Card>
          )}

          {activeTab === 'analytics' && renderGlobalAnalytics()}
          {activeTab === 'quota' && renderQuotaReport()}
        </Content>

        {/* ────── ADD CLIENT MODAL ────── */}
        <Modal title="Onboard New Business Client" open={isAddModalVisible} onCancel={() => { setIsAddModalVisible(false); addForm.resetFields(); }} footer={null} width={700} destroyOnClose>
          <Form form={addForm} layout="vertical" onFinish={handleAddClient}>
            <ClientFormFields isEditMode={false} />
          </Form>
        </Modal>

        {/* ────── EDIT CLIENT MODAL ────── */}
        <Modal title={`Edit: ${editingClient?.businessName || ''}`} open={isEditModalVisible} onCancel={() => { setIsEditModalVisible(false); setEditingClient(null); }} footer={null} width={700} destroyOnClose>
          <Form form={editForm} layout="vertical" onFinish={handleEditClient}>
            <ClientFormFields isEditMode={true} />
          </Form>
        </Modal>

        {/* ────── QUOTA UPDATE MODAL ────── */}
        <Modal title={`Update Quota: ${editingQuotaClient?.businessName || ''}`} open={isQuotaModalVisible} onCancel={() => { setIsQuotaModalVisible(false); setEditingQuotaClient(null); }} footer={null} destroyOnClose>
          <Form form={quotaForm} layout="vertical" onFinish={handleUpdateQuota}>
            <Form.Item name="dailyTokenLimit" label="Daily Token Limit" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="monthlyTokenLimit" label="Monthly Token Limit" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Button type="primary" htmlType="submit">Update Limits</Button>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </Layout>
  );
};

export default SuperAdminDashboard;
