import { useEffect, useState } from "react";
import { Button, Card, Form, Input, Space, Switch, TimePicker, message } from "antd";
import dayjs from "dayjs";
import { scraperApi } from "../api/client";
import "./ScraperControl.css";

function ScraperControl() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await scraperApi.getConfig();
      const config = response.data;
      form.setFieldsValue({
        enabled: config.enabled,
        notify_time: dayjs(`2000-01-01T${config.notify_time}`),
        receiver_email: config.receiver_email,
        keywords: config.keywords.join(", "),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (values) => {
    const payload = {
      enabled: values.enabled,
      notify_time: values.notify_time.format("HH:mm:ss"),
      receiver_email: values.receiver_email,
      keywords: values.keywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    const response = await scraperApi.updateConfig(payload);
    message.success(response.data.message);
  };

  const handleRunNow = async () => {
    const response = await scraperApi.trigger({ run_now: true, reason: "tool_ui_manual_run" });
    message.success(response.data.message);
  };

  return (
    <div className="scraper-control-page">
      <Card
        title="G2B 나라장터 수집기 제어"
        extra={
          <Button onClick={loadConfig} loading={loading}>
            설정 불러오기
          </Button>
        }
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item name="enabled" label="스크래퍼 활성화" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="notify_time" label="알림 시간" rules={[{ required: true }]}>
            <TimePicker format="HH:mm:ss" />
          </Form.Item>
          <Form.Item name="receiver_email" label="수신 메일" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="keywords" label="키워드 (콤마 구분)" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              설정 저장
            </Button>
            <Button onClick={handleRunNow}>즉시 실행</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}

export default ScraperControl;
