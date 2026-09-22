import React, { useState, useContext } from 'react';
import { Form, Input, Button, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { NaracordIcon } from '../components/NaracordLogo';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const loggedInUser = await login(values.email, values.password);
      message.success('Login successful!');
      if (loggedInUser.role === 'SUPER_ADMIN') {
        navigate('/superadmin');
      } else {
        navigate('/client');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Floating particles */}
      <div className="login-particles">
        <div className="particle p1" />
        <div className="particle p2" />
        <div className="particle p3" />
        <div className="particle p4" />
        <div className="particle p5" />
        <div className="particle p6" />
      </div>

      {/* Glassmorphism Login Card */}
      <div className="login-card">
        <div className="login-logo">
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <NaracordIcon size={76} variant="bubble" glow={true} />
          </div>
          <h1 style={{ 
            color: '#FFFFFF', 
            fontSize: '32px', 
            fontWeight: 800, 
            letterSpacing: '0.08em',
            margin: 0,
            fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
            textTransform: 'uppercase'
          }}>
            NARACORD<span style={{ color: '#5850EC', marginLeft: '4px' }}>.AI</span>
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '14px', marginTop: '8px', fontWeight: 500, letterSpacing: '0.01em' }}>
            Intelligent WhatsApp AI & Automation Platform
          </p>
        </div>

        <Form
          name="naracord_login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email address" 
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password" 
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16, marginTop: 8 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              className="login-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
            <Link to="/privacy-policy" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textDecoration: 'none' }}>Privacy Policy</Link>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <Link to="/terms" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textDecoration: 'none' }}>Terms</Link>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <Link to="/data-deletion" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textDecoration: 'none' }}>Data Deletion</Link>
          </div>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
            Engineered by <strong style={{color: 'rgba(255,255,255,0.6)'}}>Alisons Technology</strong>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Login;
