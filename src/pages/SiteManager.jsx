import { useEffect, useState } from "react";
import { Button, Card, Form, Input, Select, Space, Table, Typography, message } from "antd";
import { siteApi } from "../api/client";
import "./SiteManager.css";

function SiteManager() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const loadSites = async () => {
    setLoading(true);
    try {
      const response = await siteApi.listSites();
      setSites(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const handleCreateSite = async (values) => {
    await siteApi.createSite(values);
    message.success("사이트 항목이 등록되었습니다.");
    form.resetFields();
    loadSites();
  };

  return (
    <div className="site-manager-page">
      <Card title="사업 사이트 빠른 등록">
        <Form layout="inline" form={form} onFinish={handleCreateSite}>
          <Form.Item name="topic" rules={[{ required: true }]}>
            <Input placeholder="대주제 (예: AWS 교육)" />
          </Form.Item>
          <Form.Item name="name" rules={[{ required: true }]}>
            <Input placeholder="세부 사업명" />
          </Form.Item>
          <Form.Item name="url" rules={[{ required: true }]}>
            <Input placeholder="사이트 URL" />
          </Form.Item>
          <Form.Item name="status" initialValue="active">
            <Select
              style={{ width: 120 }}
              options={[
                { label: "active", value: "active" },
                { label: "paused", value: "paused" },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">
              추가
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title="사업 리스트"
        extra={<Button onClick={loadSites}>새로고침</Button>}
      >
        <Typography.Paragraph>
          대시보드 대신, 즉시 이동 가능한 링크 중심의 관제 화면입니다.
        </Typography.Paragraph>
        <Table
          loading={loading}
          rowKey="id"
          dataSource={sites}
          columns={[
            { title: "대주제", dataIndex: "topic" },
            { title: "세부 사업", dataIndex: "name" },
            {
              title: "바로가기",
              dataIndex: "url",
              render: (value) => (
                <Space>
                  <a href={value} target="_blank" rel="noreferrer">
                    열기
                  </a>
                </Space>
              ),
            },
            { title: "상태", dataIndex: "status" },
          ]}
          pagination={false}
        />
      </Card>
    </div>
  );
}

export default SiteManager;
