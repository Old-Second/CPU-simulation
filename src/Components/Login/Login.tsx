import {Form, Input, message, Modal} from "antd";
import {useCallback, useEffect, useRef, useState} from "react";
import axios from "axios";

const Login = () => {
  const [open, setOpen] = useState(true);
  const closeLogin = () => setOpen(false);
  
  const [form] = Form.useForm();
  
  const handleOk = () => {
    form
      .validateFields()
      .then(onSubmit)
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };
  
  const handleCancel = () => {
    void message.warning('请先登录');
  };
  
  const [user, setUser] = useState({
    username: '',
    userId: '',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const heartbeatInterval = useRef<number | null>(null);
  const heartbeatRetryCount = useRef<number>(0);
  const MAX_RETRY_COUNT = 3;
  const HEARTBEAT_INTERVAL = 30000; // 30秒
  const RETRY_DELAY = 5000; // 5秒
  
  const onSubmit = async (values: { username: string; userId: string; }) => {
    setUser({
      username: values.username,
      userId: values.userId,
    });
    try {
      await axios.post(import.meta.env.VITE_API_BASE_URL + '/api/login', {
        username: values.username,
        userId: values.userId,
      });
      setIsLoggedIn(true);
      console.log('登录时间已记录');
      closeLogin();
    } catch (error) {
      console.error('记录登录时间时出错:', error);
      void message.error('登录失败，请重试');
    }
  };
  
  const sendHeartbeat = useCallback(async () => {
    try {
      await axios.post(import.meta.env.VITE_API_BASE_URL + '/api/heartbeat', {
        userId: user.userId,
      });
      console.log('心跳信号已更新');
      heartbeatRetryCount.current = 0; // 重置重试计数
    } catch (error) {
      console.error('心跳检测时出错:', error);
      heartbeatRetryCount.current += 1;
      
      if (heartbeatRetryCount.current >= MAX_RETRY_COUNT) {
        console.error('心跳检测失败次数过多，停止心跳检测');
        setIsLoggedIn(false);
        if (heartbeatInterval.current) {
          clearInterval(heartbeatInterval.current);
          heartbeatInterval.current = null;
        }
        void message.error('连接已断开，请重新登录');
        return;
      }
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      void sendHeartbeat();
    }
  }, [user.userId]);
  
  useEffect(() => {
    if (isLoggedIn) {
      // 立即发送第一次心跳
      void sendHeartbeat();
      // 设置定期心跳
      heartbeatInterval.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    }
    
    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
    };
  }, [isLoggedIn, sendHeartbeat]);
  
  return (
    <Modal
      open={open}
      title={'登录'}
      okText="确定"
      cancelText="取消"
      onCancel={handleCancel}
      onOk={handleOk}
    >
      <Form form={form} name="login">
        <Form.Item
          name="username" label="姓名"
          rules={[{required: true, message: '请输入姓名!'}]}
        >
          <Input/>
        </Form.Item>
        <Form.Item
          name="userId" label="学号"
          rules={[{required: true, message: '请输入学号!'}, {
            pattern: /^20\d{8}$/,
            message: '学号格式错误!',
            validateTrigger: 'onSubmit'
          }, {max: 10, message: '学号长度不能超过10位!'}]}
          validateTrigger={['onChange', 'onSubmit']}
        >
          <Input/>
        </Form.Item>
      </Form>
    </Modal>
  )
};

export default Login;