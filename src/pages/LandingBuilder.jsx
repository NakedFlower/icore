import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import { builderApi } from "../api/client";
import "./LandingBuilder.css";

const TEMPLATE_SAMPLE_COPY = {
  "clean-campaign": {
    title: "성과로 이어지는 실무형 교육",
    subtitle: "현업에서 바로 적용하는 커리큘럼",
    body: "핵심 이론부터 실습까지 한 번에 정리하고, 실제 업무에 맞춘 결과물을 완성해 보세요.",
    cta_text: "지금 신청하기",
  },
  "dark-product": {
    title: "팀의 생산성을 바꾸는 솔루션",
    subtitle: "기술 중심 조직을 위한 도입 가이드",
    body: "복잡한 프로세스를 자동화하고, 운영 효율을 높이는 실전 방법을 한 화면에서 확인하세요.",
    cta_text: "데모 요청하기",
  },
  "event-highlight": {
    title: "2026 스페셜 프로그램 오픈",
    subtitle: "정원 제한 · 얼리버드 혜택 제공",
    body: "선착순 신청자에게는 전용 자료와 사전 세션 참여 혜택이 제공됩니다. 일정 확인 후 바로 등록하세요.",
    cta_text: "참가 등록하기",
  },
};

const DEPLOY_RETENTION_OPTIONS = [
  { label: "7일", value: 7 },
  { label: "30일", value: 30 },
  { label: "90일", value: 90 },
  { label: "365일", value: 365 },
];

function LandingBuilder() {
  const [templates, setTemplates] = useState([]);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [form] = Form.useForm();
  const values = Form.useWatch([], form) || {};

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsTemplateLoading(true);
      try {
        const response = await builderApi.listTemplates();
        setTemplates(response.data);
      } catch (error) {
        message.error("템플릿 목록을 불러오지 못했습니다.");
      } finally {
        setIsTemplateLoading(false);
      }
    };

    fetchTemplates();
    form.setFieldsValue({
      title: "",
      subtitle: "",
      body: "",
      cta_text: "",
      cta_url: "",
      hero_image_url: "",
      title_color: "#0f172a",
      subtitle_color: "#2563eb",
      body_color: "#334155",
      cta_text_color: "#ffffff",
      cta_bg_color: "#2563eb",
      background_color: "#f8fafc",
      business_topic: "",
      business_name: "",
      slug: "",
      custom_domain: "",
      retention_days: 30,
      publish_scope: "public",
    });
  }, [form]);

  const buildPreviewCopy = (templateId) => {
    const sampleCopy = TEMPLATE_SAMPLE_COPY[templateId] || TEMPLATE_SAMPLE_COPY["clean-campaign"];
    return {
      title: values.title || sampleCopy.title,
      subtitle: values.subtitle || sampleCopy.subtitle,
      body: values.body || sampleCopy.body,
      cta_text: values.cta_text || sampleCopy.cta_text,
    };
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);
    setDeployResult(null);
  };

  const openDeployModal = async () => {
    try {
      await form.validateFields([
        "title",
        "subtitle",
        "body",
        "cta_text",
        "cta_url",
        "title_color",
        "subtitle_color",
        "body_color",
        "cta_text_color",
        "cta_bg_color",
        "background_color",
      ]);
      if (!selectedTemplateId) {
        message.warning("먼저 템플릿을 선택하세요.");
        return;
      }
      setIsDeployModalOpen(true);
    } catch (error) {
      message.warning("필수 문구를 먼저 입력해주세요.");
    }
  };

  const handleConfirmDeploy = async () => {
    try {
      await form.validateFields(["business_topic", "business_name", "slug"]);
      form.submit();
    } catch (error) {
      message.warning("배포 조건을 확인해주세요.");
    }
  };

  const handleDeploy = async (values) => {
    setIsDeploying(true);
    try {
      const payload = {
        template_id: selectedTemplateId,
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
          hero_image_url: values.hero_image_url || null,
          primary_color: values.cta_bg_color,
          secondary_color: values.title_color,
          background_color: values.background_color,
        },
      };
      const response = await builderApi.deploy(payload);
      setDeployResult(response.data);
      setIsDeployModalOpen(false);
      setIsResultModalOpen(true);
      message.success("배포가 완료되었습니다.");
    } catch (error) {
      message.error(error?.response?.data?.detail || "배포 요청에 실패했습니다.");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="landing-builder-page">
      <Form layout="vertical" form={form} onFinish={handleDeploy}>
        {!selectedTemplate ? (
          <Card
            title="1단계 · 템플릿 선택"
            extra={<Typography.Text type="secondary">원하는 화면 디자인을 먼저 선택하세요.</Typography.Text>}
            loading={isTemplateLoading}
          >
            <Row gutter={[16, 16]}>
              {templates.map((template) => {
                const previewCopy = buildPreviewCopy(template.id);
                return (
                  <Col xs={24} lg={8} key={template.id}>
                    <Card className="template-option-card" bodyStyle={{ padding: 14 }}>
                      <div
                        className="template-mini-preview"
                        style={{ backgroundColor: values.background_color || "#f8fafc" }}
                      >
                        <h4 style={{ color: values.title_color || "#0f172a" }}>{previewCopy.title}</h4>
                        <p style={{ color: values.subtitle_color || "#2563eb" }}>{previewCopy.subtitle}</p>
                        <small style={{ color: values.body_color || "#334155" }}>{previewCopy.body}</small>
                      </div>
                      <Typography.Title level={5} className="template-option-title">
                        {template.name}
                      </Typography.Title>
                      <Typography.Paragraph type="secondary" className="template-option-description">
                        {template.description}
                      </Typography.Paragraph>
                      <Button type="primary" block onClick={() => handleTemplateSelect(template.id)}>
                        이 템플릿으로 시작
                      </Button>
                    </Card>
                  </Col>
                );
              })}
            </Row>
            {!templates.length && !isTemplateLoading && <Empty description="등록된 템플릿이 없습니다." />}
          </Card>
        ) : (
          <Space direction="vertical" size={16} className="landing-builder-full">
            <Card>
              <div className="landing-builder-toolbar">
                <div>
                  <Typography.Text strong>선택 템플릿</Typography.Text>
                  <Typography.Paragraph type="secondary" className="landing-builder-template-description">
                    {selectedTemplate.name} · {selectedTemplate.description}
                  </Typography.Paragraph>
                </div>
                <Space>
                  <Button onClick={() => setSelectedTemplateId(null)}>템플릿 다시 고르기</Button>
                  <Button type="primary" onClick={openDeployModal}>
                    배포하기
                  </Button>
                </Space>
              </div>
            </Card>

            <Card title="2단계 · 화면 문구 입력">
              <div
                className="landing-live-preview"
                style={{ backgroundColor: values.background_color || "#f8fafc" }}
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={15}>
                    <div className="landing-copy-editor">
                      <div className="landing-inline-field">
                        <Form.Item
                          name="title"
                          label="메인 타이틀"
                          rules={[{ required: true, message: "메인 타이틀을 입력하세요." }]}
                        >
                          <Input
                            placeholder="문구를 입력하세요."
                            style={{
                              color: values.title_color || "#0f172a",
                              fontSize: 36,
                              fontWeight: 700,
                              height: 56,
                            }}
                          />
                        </Form.Item>
                        <Form.Item name="title_color" label="타이틀 색상" rules={[{ required: true }]}>
                          <Input type="color" className="landing-builder-color" />
                        </Form.Item>
                      </div>

                      <div className="landing-inline-field">
                        <Form.Item
                          name="subtitle"
                          label="서브 타이틀"
                          rules={[{ required: true, message: "서브 타이틀을 입력하세요." }]}
                        >
                          <Input
                            placeholder="문구를 입력하세요."
                            style={{
                              color: values.subtitle_color || "#2563eb",
                              fontSize: 22,
                              fontWeight: 600,
                              height: 46,
                            }}
                          />
                        </Form.Item>
                        <Form.Item name="subtitle_color" label="서브 타이틀 색상" rules={[{ required: true }]}>
                          <Input type="color" className="landing-builder-color" />
                        </Form.Item>
                      </div>

                      <div className="landing-inline-field">
                        <Form.Item
                          name="body"
                          label="설명 문구"
                          rules={[{ required: true, message: "설명 문구를 입력하세요." }]}
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="문구를 입력하세요."
                            style={{ color: values.body_color || "#334155", fontSize: 17, lineHeight: 1.8 }}
                          />
                        </Form.Item>
                        <Form.Item name="body_color" label="설명 문구 색상" rules={[{ required: true }]}>
                          <Input type="color" className="landing-builder-color" />
                        </Form.Item>
                      </div>

                      <Form.Item name="hero_image_url" label="대표 이미지 URL(선택)">
                        <Input placeholder="https://..." />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="cta_text"
                            label="버튼 문구"
                            rules={[{ required: true, message: "버튼 문구를 입력하세요." }]}
                          >
                            <Input placeholder="문구를 입력하세요." />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="cta_url"
                            label="버튼 링크"
                            rules={[{ required: true, message: "버튼 링크를 입력하세요." }]}
                          >
                            <Input placeholder="https://..." />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} lg={8}>
                          <Form.Item name="cta_text_color" label="버튼 글자 색상" rules={[{ required: true }]}>
                            <Input type="color" className="landing-builder-color" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={8}>
                          <Form.Item name="cta_bg_color" label="버튼 배경 색상" rules={[{ required: true }]}>
                            <Input type="color" className="landing-builder-color" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={8}>
                          <Form.Item name="background_color" label="화면 배경 색상" rules={[{ required: true }]}>
                            <Input type="color" className="landing-builder-color" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  </Col>

                  <Col xs={24} lg={9}>
                    <div className="landing-visual-pane">
                      {values.hero_image_url ? (
                        <img src={values.hero_image_url} alt="랜딩 대표" className="landing-visual-image" />
                      ) : (
                        <div className="landing-visual-placeholder">이미지 URL을 입력하면 여기에 표시됩니다.</div>
                      )}
                      <Button
                        className="landing-live-cta"
                        style={{
                          backgroundColor: values.cta_bg_color || "#2563eb",
                          color: values.cta_text_color || "#ffffff",
                        }}
                      >
                        {values.cta_text || "문구를 입력하세요."}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Space>
        )}
      {deployResult && (
        <Alert
          className="landing-builder-result"
          type="success"
          showIcon
          message={`배포 완료: ${deployResult.public_url}`}
          description={`${deployResult.message} (Landing ID: ${deployResult.landing_page_id})`}
        />
      )}

      <Modal
        open={isDeployModalOpen}
        title="3단계 · 배포 조건 설정"
        onCancel={() => setIsDeployModalOpen(false)}
        onOk={handleConfirmDeploy}
        okText="최종 배포하기"
        confirmLoading={isDeploying}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="business_topic"
              label="화면 분류"
              rules={[{ required: true, message: "화면 분류를 입력하세요." }]}
            >
              <Input placeholder="예: 교육 프로그램 / 이벤트 / 제품 소개" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="business_name"
              label="화면 이름"
              rules={[{ required: true, message: "화면 이름을 입력하세요." }]}
            >
              <Input placeholder="예: 2026 AI 실무 과정" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="slug"
              label="최종 링크 슬러그"
              rules={[
                { required: true, message: "슬러그를 입력하세요." },
                { pattern: /^[a-z0-9-]+$/, message: "영문 소문자/숫자/하이픈만 사용 가능합니다." },
              ]}
            >
              <Input placeholder="ai-course-2026" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="custom_domain" label="커스텀 도메인(선택)">
              <Input placeholder="academy.icore.co.kr" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="retention_days" label="화면 유지 기간(일)">
              <Select options={DEPLOY_RETENTION_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="publish_scope" label="배포 범위">
          <Input placeholder="예: public / internal" />
        </Form.Item>

        <Typography.Paragraph type="secondary" className="deploy-helper-text">
          유지 기간과 배포 범위는 운영 정책 확인용 값이며, 실제 페이지 배포는 링크 생성과 동시에 완료됩니다.
        </Typography.Paragraph>
      </Modal>

      <Modal
        open={isResultModalOpen}
        title="배포 완료"
        footer={[
          <Button key="close" type="primary" onClick={() => setIsResultModalOpen(false)}>
            확인
          </Button>,
        ]}
        onCancel={() => setIsResultModalOpen(false)}
      >
        {deployResult ? (
          <Space direction="vertical" size={4}>
            <Typography.Text strong>최종 링크</Typography.Text>
            <Typography.Link href={deployResult.public_url} target="_blank">
              {deployResult.public_url}
            </Typography.Link>
            <Typography.Text type="secondary">{deployResult.message}</Typography.Text>
          </Space>
        ) : null}
      </Modal>
      </Form>
    </div>
  );
}

export default LandingBuilder;
