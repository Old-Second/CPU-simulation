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
  const heartbeatInterval = useRef<number | null>(null)
  
  const onSubmit = async (values: { username: string; userId: string; }) => {
    console.log(values);
    setUser({
      username: values.username,
      userId: values.userId,
    });
    try {
      await axios.post('/api/login', {
        username: values.username,
        userId: values.userId,
      });
      setIsLoggedIn(true);
      console.log('登录时间已记录');
      closeLogin();
    } catch (error) {
      console.error('记录登录时间时出错:', error);
    }
  };
  
  const sendHeartbeat = useCallback(async () => {
    try {
      await axios.post('/api/heartbeat', {
        userId: user.userId,
      });
      console.log('心跳信号已更新');
    } catch (error) {
      console.error('心跳检测时出错:', error);
      // setIsLoggedIn(false);
      // clearInterval(heartbeatInterval.current as number);
    }
  }, [user.userId]);
  
  useEffect(() => {
    if (isLoggedIn) {
      heartbeatInterval.current = setInterval(sendHeartbeat, 30000);
    }
    
    return () => {
      clearInterval(heartbeatInterval.current as number);
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