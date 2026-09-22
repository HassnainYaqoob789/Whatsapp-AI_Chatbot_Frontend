import React, { useEffect, useState, useContext } from 'react';
import { Card, Typography, Button, Spin, message, Row, Col, Result, Steps, Divider } from 'antd';
import { FacebookOutlined, WhatsAppOutlined, CheckCircleOutlined, ApiOutlined, InfoCircleOutlined } from '@ant-design/icons';
import api from '../../utils/axiosConfig';
import { AuthContext } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

const MetaConnect = () => {
  const { user } = useContext(AuthContext);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // You will replace these with actual environment variables or configuration if preferred
  // Since frontend needs to know App ID, we can fetch it or hardcode if we know it.
  // We can fetch it via an API endpoint, or we can just hardcode for now.
  const META_APP_ID = '27708587325471275'; // Naracord AI App ID
  const META_CONFIG_ID = '2071329197076315'; // Naracord Embedded Login Config ID

  useEffect(() => {
    // 1. Check if already connected
    const checkStatus = async () => {
      try {
        const res = await api.get('/meta/connection-status');
        setIsConnected(res.data.metaConnected);
      } catch (error) {
        console.error("Failed to fetch connection status", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();

    // 2. Load Facebook SDK dynamically
    if (!window.FB) {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId            : META_APP_ID,
          autoLogAppEvents : true,
          xfbml            : true,
          version          : 'v20.0'
        });
        setIsSdkLoaded(true);
      };

      const script = document.createElement('script');
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    } else {
      setIsSdkLoaded(true);
    }
  }, []);

  const handleConnectWithMeta = () => {
    if (!window.FB) {
      message.error("Facebook SDK is not loaded yet. Please wait a moment.");
      return;
    }

    setIsConnecting(true);

    window.FB.login(
      (response) => {
        setIsConnecting(false);
        if (response.authResponse && response.authResponse.code) {
          // Success! Exchange code via backend
          exchangeCodeForToken(response.authResponse);
        } else {
          message.warning("Connection cancelled or failed.");
          console.log("Meta Login Response:", response);
        }
      },
      {
        config_id: META_CONFIG_ID, // Use Configuration ID
        response_type: 'code',    // We need 'code' instead of token for server-side exchange
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: '',
          sessionInfoVersion: '3',
        }
      }
    );
  };

  const exchangeCodeForToken = async (authResponse) => {
    setIsLoading(true);
    try {
      // The authResponse from Embedded Signup usually contains extension_metadata or setup details if we need them,
      // but standard is to send the code to backend. However, we also need wabaId and phoneNumberId.
      // Wait, standard FB.login for Embedded Signup returns the 'code'. The server exchanges it for a token,
      // then uses the token to fetch the WABA ID and Phone Number ID, OR they are passed in the response.
      // Wait! In v20 Embedded signup, FB.login doesn't return wabaId in authResponse directly if response_type=code.
      // It just returns 'code'. 
      // We will send 'code' to our backend, and backend will fetch the rest.
      
      // Let's call our backend endpoint
      // Note: We need wabaId and phoneNumberId. If FB doesn't provide it in authResponse, 
      // the backend must fetch it using the exchanged access token.
      
      // For now, let's just pass code. We will need to update backend to fetch WABA if missing from body.
      const res = await api.post('/meta/oauth/exchange', {
        code: authResponse.code,
        // We will update backend to automatically detect these via Meta API using the token
      });

      if (res.data.success) {
        message.success("Successfully connected to Meta!");
        setIsConnected(true);
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Failed to finalize connection with server.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <Spin size="large" tip="Loading Meta Connection..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 800, width: '100%' }}>
        
        {isConnected ? (
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#10b981' }} />}
            title="WhatsApp Business Connected Successfully!"
            subTitle="Your WhatsApp account is now linked to Naracord AI. You can start sending and receiving messages."
            extra={[
              <Button type="primary" key="console" onClick={() => window.location.href = '/client'}>
                Go to Inbox
              </Button>
            ]}
          />
        ) : (
          <Card 
            bordered={false} 
            style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <WhatsAppOutlined style={{ fontSize: 64, color: '#25D366', marginBottom: 16 }} />
              <Title level={2} style={{ margin: 0 }}>Connect your WhatsApp</Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Link your business number to start managing chats and automations.
              </Text>
            </div>

            <Row gutter={[32, 32]}>
              <Col xs={24} md={12}>
                <div style={{ background: '#f0f5ff', padding: 24, borderRadius: 12, height: '100%', borderLeft: '4px solid #1890ff' }}>
                  <Title level={5} style={{ color: '#092b72' }}><InfoCircleOutlined /> Before You Start</Title>
                  <Paragraph style={{ color: '#595959', fontSize: 13, marginBottom: 8 }}>
                    To ensure a smooth setup, please make sure you have:
                  </Paragraph>
                  <ul style={{ paddingLeft: 20, color: '#595959', fontSize: 13, marginBottom: 16 }}>
                    <li>An active <strong>Facebook Account</strong> with Admin access to your Business Page.</li>
                    <li>A <strong>Phone Number</strong> that can receive SMS/Calls for OTP verification.</li>
                    <li><Text type="danger"><strong>CRITICAL:</strong></Text> The phone number must <strong>NOT</strong> be actively registered on the standard WhatsApp or WhatsApp Business mobile app. (You must delete the WhatsApp account on that phone first).</li>
                  </ul>
                  
                  <Divider style={{ margin: '12px 0' }} />

                  <Title level={5} style={{ fontSize: 14 }}><ApiOutlined /> The 3-Step Process</Title>
                  <Steps
                    direction="vertical"
                    size="small"
                    current={0}
                    items={[
                      { title: 'Log in to Facebook' },
                      { title: 'Create or select a WhatsApp Business Account' },
                      { title: 'Verify your phone number via OTP' },
                    ]}
                  />
                </div>
              </Col>
              
              <Col xs={24} md={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<FacebookOutlined />}
                  onClick={handleConnectWithMeta}
                  loading={isConnecting}
                  disabled={!isSdkLoaded}
                  style={{
                    background: '#1877F2',
                    border: 'none',
                    height: 56,
                    padding: '0 32px',
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 28,
                    width: '100%',
                    boxShadow: '0 4px 14px rgba(24, 119, 242, 0.4)'
                  }}
                >
                  Connect with Meta
                </Button>
                
                {!isSdkLoaded && (
                  <Text type="secondary" style={{ marginTop: 12, fontSize: 12 }}>
                    Loading secure connection module...
                  </Text>
                )}
                <Paragraph style={{ marginTop: 24, textAlign: 'center', color: '#8c8c8c', fontSize: 12 }}>
                  By proceeding, you agree to the Meta Business Terms of Service and WhatsApp Business Policies.
                </Paragraph>
              </Col>
            </Row>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MetaConnect;
