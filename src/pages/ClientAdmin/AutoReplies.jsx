import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Switch, Space, Popconfirm, Typography, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import api from '../../utils/axiosConfig';

const { Title, Text } = Typography;
const { Option } = Select;

const AutoReplies = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await api.get('/chatbot/auto-replies');
      setRules(response.data.rules || []);
    } catch (error) {
      message.error("Failed to load auto-reply rules");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRule(null);
    setIsModalVisible(true);
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({ matchType: 'exact', isActive: true });
    }, 0);
  };

  const handleEdit = (record) => {
    setEditingRule(record);
    setIsModalVisible(true);
    setTimeout(() => {
      form.setFieldsValue(record);
    }, 0);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/chatbot/auto-replies/${id}`);
      message.success("Rule deleted successfully");
      fetchRules();
    } catch (error) {
      message.error("Failed to delete rule");
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      await api.put(`/chatbot/auto-replies/${id}`, { isActive });
      message.success(`Rule ${isActive ? 'activated' : 'deactivated'}`);
      fetchRules();
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRule) {
        await api.put(`/chatbot/auto-replies/${editingRule._id}`, values);
        message.success("Rule updated successfully");
      } else {
        await api.post('/chatbot/auto-replies', values);
        message.success("Rule created successfully");
      }
      setIsModalVisible(false);
      fetchRules();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to save rule");
    }
  };

  const columns = [
    {
      title: 'Keyword',
      dataIndex: 'keyword',
      key: 'keyword',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Match Type',
      dataIndex: 'matchType',
      key: 'matchType',
      render: (type) => (
        <Tag color={type === 'exact' ? 'blue' : 'cyan'}>
          {type === 'exact' ? 'Exact Match' : 'Contains'}
        </Tag>
      )
    },
    {
      title: 'Reply Text',
      dataIndex: 'replyText',
      key: 'replyText',
      ellipsis: true,
      width: '40%'
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch 
          checked={isActive} 
          onChange={(checked) => handleToggleStatus(record._id, checked)} 
          checkedChildren="ON" 
          unCheckedChildren="OFF"
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Delete this rule?" onConfirm={() => handleDelete(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            <ThunderboltOutlined style={{ marginRight: 8, color: '#a855f7' }} />
            Auto Replies & Menus
          </Title>
          <Text type="secondary">Create exact keyword matches for instant automated responses.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" style={{ background: 'var(--gradient-primary)' }}>
          Create Rule
        </Button>
      </div>

      <Card bordered={false} className="glass-card" bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns} 
          dataSource={rules} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingRule ? "Edit Auto Reply" : "Create Auto Reply"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            name="keyword" 
            label="Keyword / Menu Option" 
            rules={[{ required: true, message: 'Please enter a keyword' }]}
            tooltip="Example: 'price', 'menu', '1', '2'"
          >
            <Input placeholder="e.g. price" size="large" />
          </Form.Item>

          <Form.Item 
            name="matchType" 
            label="Match Strategy" 
            rules={[{ required: true }]}
          >
            <Select size="large">
              <Option value="exact">Exact Match (User types exactly this word)</Option>
              <Option value="contains">Contains (User's message contains this word)</Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="replyText" 
            label="Reply Message" 
            rules={[{ required: true, message: 'Please enter a reply message' }]}
          >
            <Input.TextArea rows={4} placeholder="Your free automated response..." size="large" />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Paused" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 12 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: 'var(--gradient-primary)' }}>
              {editingRule ? "Update Rule" : "Save Rule"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AutoReplies;
