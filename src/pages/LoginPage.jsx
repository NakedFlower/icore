import { Button, Card, Form, Input, Typography, message } from "antd";
import { authApi, AUTH_TOKEN_KEY } from "../api/client";
import "./LoginPage.css";

function LoginPage({ onSuccess }) {
  const [form] = Form.useForm();

  const handleLogin = async (values) => {
    try {
      const response = await authApi.login(values);
      window.localStorage.setItem(AUTH_TOKEN_KEY, response.data.access_token);
      onSuccess({ username: response.data.username, role: response.data.role });
      message.success("로그인되었습니다.");
    } catch (error) {
      message.error(error?.response?.data?.detail || "로그인에 실패했습니다.");
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card" bordered={false}>
        <Typography.Title level={3}>iCore 관리자 로그인</Typography.Title>
        <Typography.Paragraph type="secondary">
          관리자 계정으로 로그인한 뒤 랜딩 페이지를 생성/배포할 수 있습니다.
        </Typography.Paragraph>
        <Form layout="vertical" form={form} onFinish={handleLogin}>
          <Form.Item name="username" label="아이디" rules={[{ required: true, message: "아이디를 입력하세요." }]}>
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="비밀번호" rules={[{ required: true, message: "비밀번호를 입력하세요." }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            로그인
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;
