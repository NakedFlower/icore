import { useEffect, useState } from "react";
import { Button, Card, Form, InputNumber, Radio, Select, Space, Switch, TimePicker, message } from "antd";
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
        schedule_mode: config.schedule_mode,
        notify_time: dayjs(`2000-01-01T${config.notify_time}`),
        interval_minutes: config.interval_minutes,
        dedup_mode: config.dedup_mode,
        dedup_retention_hours: config.dedup_retention_hours,
        receiver_emails: config.receiver_emails,
        keywords: config.keywords,
      });
    } catch (error) {
      message.error(error?.response?.data?.detail || "설정 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (values) => {
    try {
      const payload = {
        enabled: values.enabled,
        schedule_mode: values.schedule_mode,
        notify_time: values.notify_time.format("HH:mm:ss"),
        interval_minutes: values.interval_minutes,
        dedup_mode: values.dedup_mode,
        dedup_retention_hours: values.dedup_retention_hours,
        receiver_emails: values.receiver_emails,
        keywords: values.keywords,
      };
      const response = await scraperApi.updateConfig(payload);
      message.success(response.data.message);
    } catch (error) {
      message.error(error?.response?.data?.detail || "설정 저장에 실패했습니다.");
    }
  };

  const handleRunNow = async () => {
    try {
      const response = await scraperApi.trigger({ run_now: true, reason: "tool_ui_manual_run" });
      message.success(response.data.message);
    } catch (error) {
      message.error(error?.response?.data?.detail || "즉시 실행 요청에 실패했습니다.");
    }
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
          <Form.Item name="schedule_mode" label="실행 방식" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio.Button value="daily">매일 고정 시간</Radio.Button>
              <Radio.Button value="interval">분 단위 반복</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="notify_time" label="알림 시간" rules={[{ required: true }]}>
            <TimePicker format="HH:mm:ss" />
          </Form.Item>
          <Form.Item name="interval_minutes" label="반복 간격(분)" rules={[{ required: true }]}>
            <InputNumber min={5} max={1440} style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="dedup_mode" label="중복 판정 기준" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "공고 ID 기준", value: "notice_id" },
                { label: "공고 ID + 제목 기준", value: "notice_id_and_title" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="dedup_retention_hours"
            label="중복 보관 시간(시간)"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={720} style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="receiver_emails" label="수신 메일 목록" rules={[{ required: true }]}>
            <Select mode="tags" tokenSeparators={[",", " "]} placeholder="mail1@company.com" />
          </Form.Item>
          <Form.Item name="keywords" label="키워드 목록" rules={[{ required: true }]}>
            <Select mode="tags" tokenSeparators={[",", " "]} placeholder="AI, 클라우드" />
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
