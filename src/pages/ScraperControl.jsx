import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Form,
  InputNumber,
  Radio,
  Input,
  Select,
  Space,
  Switch,
  Table,
  TimePicker,
  Tooltip,
  Tag,
  message,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { scraperApi } from "../api/client";
import "./ScraperControl.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeTags = (items = []) => {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const cleaned = String(item || "").trim();
    if (!cleaned) {
      continue;
    }
    const key = cleaned.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(cleaned);
  }
  return result;
};

function ScraperControl() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [runHistory, setRunHistory] = useState([]);

  const loadRuns = async () => {
    try {
      const response = await scraperApi.listRuns(20);
      setRunHistory(response.data || []);
    } catch {
      setRunHistory([]);
    }
  };

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
        gsheet_id: config.gsheet_id || "",
        receiver_emails: normalizeTags(config.receiver_emails),
        keywords: normalizeTags(config.keywords),
      });
      setSchedulerStatus(config.scheduler_status || null);
      setRunHistory(config.recent_runs || []);
    } catch (error) {
      message.error(error?.response?.data?.detail || "설정 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    loadRuns();
  }, []);

  const handleSave = async (values) => {
    try {
      const receiverEmails = normalizeTags(values.receiver_emails);
      const keywords = normalizeTags(values.keywords);

      const invalidEmail = receiverEmails.find((email) => !EMAIL_REGEX.test(email));
      if (invalidEmail) {
        message.error(`유효하지 않은 이메일 형식: ${invalidEmail}`);
        return;
      }

      const payload = {
        enabled: values.enabled,
        schedule_mode: values.schedule_mode,
        notify_time: values.notify_time.format("HH:mm:ss"),
        interval_minutes: values.interval_minutes,
        dedup_mode: values.dedup_mode,
        dedup_retention_hours: values.dedup_retention_hours,
        gsheet_id: (values.gsheet_id || "").trim() || null,
        receiver_emails: receiverEmails,
        keywords,
      };
      const response = await scraperApi.updateConfig(payload);
      message.success(response.data.message);
      if (response.data.scheduler) {
        setSchedulerStatus(response.data.scheduler);
      }
      if (response.data.config?.recent_runs) {
        setRunHistory(response.data.config.recent_runs);
      }
    } catch (error) {
      message.error(error?.response?.data?.detail || "설정 저장에 실패했습니다.");
    }
  };

  const handleRunNow = async () => {
    try {
      const response = await scraperApi.trigger({ run_now: true, reason: "tool_ui_manual_run" });
      message.success(response.data.message);
      loadRuns();
    } catch (error) {
      message.error(error?.response?.data?.detail || "즉시 실행 요청에 실패했습니다.");
    }
  };

  const runColumns = [
    {
      title: "실행 시각",
      dataIndex: "executed_at",
      key: "executed_at",
      render: (value) => dayjs(value).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (value) => {
        if (value === "success") {
          return <Tag color="green">성공</Tag>;
        }
        if (value === "partial") {
          return <Tag color="gold">부분성공</Tag>;
        }
        return <Tag color="red">실패</Tag>;
      },
    },
    { title: "수집", dataIndex: "notice_count", key: "notice_count" },
    { title: "중복제거", dataIndex: "deduped_count", key: "deduped_count" },
    { title: "메일발송", dataIndex: "email_sent_count", key: "email_sent_count" },
    { title: "시트기록", dataIndex: "sheet_written_count", key: "sheet_written_count" },
    {
      title: "메시지",
      dataIndex: "error_message",
      key: "error_message",
      ellipsis: true,
      render: (value) => value || "-",
    },
  ];

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
        {schedulerStatus && (
          <Alert
            className="scheduler-status-alert"
            type={schedulerStatus.connected ? "success" : "warning"}
            message={schedulerStatus.connected ? "Cloud Scheduler 연결됨" : "Cloud Scheduler 연결 필요"}
            description={schedulerStatus.message}
            showIcon
          />
        )}
        {schedulerStatus && (
          <Descriptions size="small" bordered column={1} className="scheduler-status-grid">
            <Descriptions.Item label="잡 이름">{schedulerStatus.job_name || "(미설정)"}</Descriptions.Item>
            <Descriptions.Item label="스케줄">{schedulerStatus.schedule || "(미설정)"}</Descriptions.Item>
            <Descriptions.Item label="타겟 URL">
              {schedulerStatus.target_url || "(미설정)"}
            </Descriptions.Item>
            <Descriptions.Item label="상태">
              {schedulerStatus.paused ? "일시정지" : "활성"}
            </Descriptions.Item>
          </Descriptions>
        )}

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
          <Form.Item
            name="gsheet_id"
            label={
              <Space size={6}>
                Google Sheet ID
                <Tooltip
                  title="구글시트 URL에서 /d/ 와 /edit 사이 문자열이 Sheet ID입니다. 예: https://docs.google.com/spreadsheets/d/여기가ID/edit"
                >
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
            rules={[{ required: true, message: "Google Sheet ID를 입력하세요." }]}
          >
            <Input placeholder="예: 1AbCdEfGhIjKlMnOpQrStUvWxYz..." />
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

        <div className="scraper-runs-wrapper">
          <div className="scraper-runs-title">최근 실행 이력</div>
          <Table
            size="small"
            rowKey="run_id"
            dataSource={runHistory}
            columns={runColumns}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 900 }}
          />
        </div>
      </Card>
    </div>
  );
}

export default ScraperControl;
