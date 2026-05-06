import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { formatApiError, siteApi } from "../api/client";
import "./SiteManager.css";

function SiteManager() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const loadSites = async () => {
    setLoading(true);
    try {
      const response = await siteApi.listSites();
      setSites(response.data);
    } catch (error) {
      message.error(formatApiError(error, "랜딩 페이지 목록 조회에 실패했습니다."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const openEditModal = (site) => {
    setEditingSite(site);
    form.setFieldsValue({
      business_topic: site.business_topic,
      business_name: site.business_name,
      major_categories: site.major_categories || [],
      minor_categories: site.minor_categories || [],
      status: site.status,
    });
  };

  const handleUpdate = async (values) => {
    if (!editingSite) return;
    setSubmitting(true);
    try {
      await siteApi.updateSite(editingSite.id, values);
      message.success("랜딩 페이지 정보가 수정되었습니다.");
      setEditingSite(null);
      form.resetFields();
      loadSites();
    } catch (error) {
      message.error(formatApiError(error, "수정에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (siteId) => {
    try {
      await siteApi.deleteSite(siteId);
      message.success("랜딩 페이지가 삭제되었습니다.");
      loadSites();
    } catch (error) {
      message.error(formatApiError(error, "삭제에 실패했습니다."));
    }
  };

  return (
    <div className="site-manager-page">
      <Card title="랜딩 페이지 관리" extra={<Button onClick={loadSites}>새로고침</Button>}>
        <Typography.Paragraph>
          대주제/소주제, 상태 변경, 삭제를 관리할 수 있습니다.
        </Typography.Paragraph>
        <Table
          loading={loading}
          rowKey="id"
          dataSource={sites}
          columns={[
            { title: "대주제", dataIndex: "business_topic" },
            { title: "소주제", dataIndex: "business_name" },
            {
              title: "대분류",
              dataIndex: "major_categories",
              render: (values) => (values || []).join(", "),
            },
            {
              title: "소분류",
              dataIndex: "minor_categories",
              render: (values) => (values || []).join(", "),
            },
            { title: "슬러그", dataIndex: "slug" },
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
            {
              title: "상태",
              dataIndex: "status",
              render: (value) => {
                if (value === "active") return <Tag color="green">active</Tag>;
                if (value === "paused") return <Tag color="orange">paused</Tag>;
                return <Tag>archived</Tag>;
              },
            },
            {
              title: "작업",
              render: (_, record) => (
                <Space>
                  <Button onClick={() => openEditModal(record)}>수정</Button>
                  <Popconfirm
                    title="정말 삭제할까요?"
                    description="삭제 후에는 복구할 수 없습니다."
                    onConfirm={() => handleDelete(record.id)}
                    okText="삭제"
                    cancelText="취소"
                  >
                    <Button danger>삭제</Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          pagination={false}
        />
      </Card>

      <Modal
        title="랜딩 페이지 수정"
        open={Boolean(editingSite)}
        onCancel={() => setEditingSite(null)}
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" form={form} onFinish={handleUpdate}>
          <Form.Item name="business_topic" label="대주제" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="business_name" label="소주제" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="major_categories" label="대분류(복수 가능)">
            <Select mode="tags" tokenSeparators={[","]} />
          </Form.Item>
          <Form.Item name="minor_categories" label="소분류(복수 가능)">
            <Select mode="tags" tokenSeparators={[","]} />
          </Form.Item>
          <Form.Item name="status" label="상태" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "active", value: "active" },
                { label: "paused", value: "paused" },
                { label: "archived", value: "archived" },
              ]}
            />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              저장
            </Button>
            <Button onClick={() => setEditingSite(null)}>취소</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}

export default SiteManager;
