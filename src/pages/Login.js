import { UserAddOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space, Typography } from "antd";
import { useEffect } from "react";
import styles from "./Login.module.css";
import { Link, useNavigate } from "react-router-dom";
// import { MANAGE_INDEX_PATHNAME } from '../router'
// import { useRequest } from 'ahooks'

const { Title } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const nav = useNavigate();

  useEffect(() => {
    // 可选：如果之前用 localStorage 自动填充表单，这里也可以省略
  }, []);

  // const { run } = useRequest(
  //   async (username, password) => {
  //     const data = await loginService(username, password)
  //     return data
  //   },
  //   {
  //     manual: true,
  //     onSuccess(result) {
  //       const { token = '' } = result
  //       setToken(token)
  //       message.success('login successful')
  //       nav('/home')
  //     },
  //   }
  // )

  const onFinish = async (values) => {
    const { username, password } = values;
  
    try {
      const res = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        console.log(" Login successful:", data);
        localStorage.setItem("user", JSON.stringify(data.user));
        nav("/home");
        window.location.reload(); //  Force route re-check based on updated login state
      } else {
        console.error(" Login failed:", data.message || data.error);
      }
    } catch (err) {
      console.error(" Error during login:", err);
    }
  };
  
  

  return (
    <div className={styles.container}>
      <div>
        <Space>
          <Title level={2}>
            <UserAddOutlined />
          </Title>
          <Title level={2}>login</Title>
        </Space>
      </div>
      <div>
        <Form
          labelCol={{ style: { width: 100 } }}
          wrapperCol={{ style: { width: 230 } }}
          onFinish={onFinish}
          form={form}
        >
          <Form.Item
            label="username"
            name="username"
            rules={[
              { required: true, message: "please input username" },
              {
                type: "string",
                min: 3,
                max: 20,
                message: "length must between 3 - 20 characters",
              },
              {
                pattern: /^\w+$/,
                message: "only letter, number and underscore",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="password"
            name="password"
            rules={[{ required: true, message: "please input password" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Space size={24}>
              <Button type="primary" htmlType="submit">
                login
              </Button>
              <Link to="/register">register</Link>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
