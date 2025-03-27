import { UserAddOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Space, Typography } from "antd";
import styles from "./Register.module.css";
import { Link, useNavigate } from "react-router-dom";

const { Title } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const nav = useNavigate();

  const onFinish = async (values) => {
    const { username, password, nickname } = values;

    try {
      const res = await fetch("http://localhost:5001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, nickname })
      });

      const data = await res.json();

      if (res.ok) {
        console.log(" Registered successfully:", data);
        nav("/login"); //  redirect to login page
      } else {
        console.error(" Register failed:", data.message || data.error);
      }
    } catch (err) {
      console.error(" Error during register:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <Space>
          <Title level={2}>
            <UserAddOutlined />
          </Title>
          <Title level={2}>register</Title>
        </Space>
      </div>
      <div>
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
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
              { pattern: /^\w+$/, message: "only letters and underscore" },
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
          <Form.Item
            label="confirm"
            name="confirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: "please input password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("unmatched password"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item label="nickname" name="nickname">
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 6, span: 20 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                register
              </Button>
              <Link to={"/login"}>already has an account? please login</Link>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Register;
