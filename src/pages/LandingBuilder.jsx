import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Input, Row, Select, Space, message } from "antd";
import { builderApi } from "../api/client";
import "./LandingBuilder.css";

function LandingBuilder() {
  const [templates, setTemplates] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    builderApi.listTemplates().then((response) => setTemplates(response.data));
  }, []);

  const handleDeploy = async (values) => {
    setIsDeploying(true);
    try {
      const payload = {
        template_id: values.template_id,
        business_topic: values.business_topic,
        business_name: values.business_name,
        slug: values.slug,
        custom_domain: values.custom_domain || null,
        content: {
          title: values.title,
          subtitle: values.subtitle,
          body: values.body,
          cta_text: values.cta_text,
          cta_url: values.cta_url,
        },
      };
      const response = await builderApi.deploy(payload);
      setDeployResult(response.data);
      message.success("배포 요청이 생성되었습니다.");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="landing-builder-page">
      <Card title="랜딩 템플릿 기반 배포 도구">
        <Form layout="vertical" form={form} onFinish={handleDeploy}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="template_id" label="템플릿" rules={[{ required: true }]}>
                <Select
                  options={templates.map((template) => ({
                    label: `${template.name} - ${template.description}`,
                    value: template.id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="business_topic" label="대주제" rules={[{ required: true }]}>
                <Input placeholder="예: Google 교육" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="business_name" label="세부 사업명" rules={[{ required: true }]}>
                <Input placeholder="예: 생성형 AI 실무 과정" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="slug" label="배포 슬러그" rules={[{ required: true }]}>
                <Input placeholder="google-ai-2026" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="custom_domain" label="커스텀 도메인(선택)">
            <Input placeholder="academy.icore.co.kr" />
          </Form.Item>
          <Form.Item name="title" label="메인 타이틀" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="subtitle" label="서브 타이틀" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="body" label="설명 문구" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cta_text" label="CTA 문구" rules={[{ required: true }]}>
                <Input placeholder="신청하기" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cta_url" label="CTA 링크" rules={[{ required: true }]}>
                <Input placeholder="https://..." />
              </Form.Item>
            </Col>
          </Row>
          <Space>
            <Button type="primary" htmlType="submit" loading={isDeploying}>
              Cloud Storage(CDN)로 배포
            </Button>
            <Button htmlType="button" onClick={() => form.resetFields()}>
              초기화
            </Button>
          </Space>
        </Form>
      </Card>

      {deployResult && (
        <Alert
          className="landing-builder-result"
          type="success"
          showIcon
          message={`배포 완료: ${deployResult.public_url}`}
          description={deployResult.message}
        />
      )}
    </div>
  );
}

export default LandingBuilder;
