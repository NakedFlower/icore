import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import { builderApi } from "../api/client";
import "./LandingBuilder.css";

const DEPLOY_RETENTION_OPTIONS = [
  { label: "7일", value: 7 },
  { label: "30일", value: 30 },
  { label: "90일", value: 90 },
  { label: "365일", value: 365 },
];

const MAJOR_CATEGORY_OPTIONS = [
  { label: "업체별", value: "업체별" },
  { label: "CSP", value: "CSP" },
  { label: "지역별", value: "지역별" },
];

const MINOR_CATEGORY_BY_MAJOR = {
  업체별: ["제조", "유통", "교육", "공공", "금융", "스타트업"],
  CSP: ["AWS", "Google Cloud", "Azure", "Naver Cloud", "KT Cloud"],
  지역별: ["울산", "서울", "부산", "대전", "광주", "제주"],
};

const COLOR_PRESETS = [
  {
    key: "calm-lab",
    name: "Calm Lab",
    cta_bg_color: "#0ea5e9",
    title_color: "#0f172a",
    subtitle_color: "#0369a1",
    body_color: "#334155",
    cta_text_color: "#ffffff",
    background_color: "#f0f9ff",
  },
  {
    key: "sunset-growth",
    name: "Sunset Growth",
    cta_bg_color: "#f97316",
    title_color: "#7c2d12",
    subtitle_color: "#c2410c",
    body_color: "#9a3412",
    cta_text_color: "#fff7ed",
    background_color: "#fff7ed",
  },
  {
    key: "forest-ops",
    name: "Forest Ops",
    cta_bg_color: "#15803d",
    title_color: "#14532d",
    subtitle_color: "#166534",
    body_color: "#365314",
    cta_text_color: "#f7fee7",
    background_color: "#f7fee7",
  },
  {
    key: "midnight-wave",
    name: "Midnight Wave",
    cta_bg_color: "#3b82f6",
    title_color: "#e2e8f0",
    subtitle_color: "#a5b4fc",
    body_color: "#cbd5e1",
    cta_text_color: "#ffffff",
    background_color: "#020617",
  },
];

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

function LandingBuilder() {
  const [templates, setTemplates] = useState([]);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [isTemplateDetailLoading, setIsTemplateDetailLoading] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState("");
  const [uploadedImageBase64, setUploadedImageBase64] = useState("");
  const [uploadedImageMimeType, setUploadedImageMimeType] = useState("");
  const [uploadedImageFileName, setUploadedImageFileName] = useState("");
  const [previewViewport, setPreviewViewport] = useState("desktop");
  const [form] = Form.useForm();
  const values = Form.useWatch([], form) || {};

  const selectedMajorCategories = values.major_categories || [];
  const availableMinorOptions = Array.from(
    new Set(selectedMajorCategories.flatMap((major) => MINOR_CATEGORY_BY_MAJOR[major] || []))
  ).map((label) => ({ label, value: label }));

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
      major_categories: [],
      minor_categories: [],
      slug: "",
      custom_domain: "",
      retention_days: 30,
      publish_scope: "public",
    });
  }, [form]);

  const applyColorPreset = (presetKey) => {
    const preset = COLOR_PRESETS.find((item) => item.key === presetKey);
    if (!preset) return;
    form.setFieldsValue({
      cta_bg_color: preset.cta_bg_color,
      title_color: preset.title_color,
      subtitle_color: preset.subtitle_color,
      body_color: preset.body_color,
      cta_text_color: preset.cta_text_color,
      background_color: preset.background_color,
    });
  };

  const handleTemplateSelect = async (templateId) => {
    setPendingTemplateId(templateId);
    setIsTemplateDetailLoading(true);
    try {
      const response = await builderApi.getTemplateDetail(templateId);
      const detail = response.data;

      form.setFieldsValue({
        title: detail.title || "",
        subtitle: detail.subtitle || "",
        body: detail.body || "",
        cta_text: detail.cta_text || "",
        hero_image_url: detail.hero_image_url || "",
        title_color: detail.title_color || "#0f172a",
        subtitle_color: detail.subtitle_color || "#2563eb",
        body_color: detail.body_color || "#334155",
        cta_text_color: detail.cta_text_color || "#ffffff",
        cta_bg_color: detail.cta_bg_color || "#2563eb",
        background_color: detail.background_color || "#f8fafc",
      });

      setSelectedTemplateId(templateId);
      setDeployResult(null);
    } catch (error) {
      message.error(error?.response?.data?.detail || "선택한 템플릿을 GCS에서 불러오지 못했습니다.");
    } finally {
      setIsTemplateDetailLoading(false);
      setPendingTemplateId(null);
    }
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
        major_categories: values.major_categories || [],
        minor_categories: values.minor_categories || [],
        slug: values.slug,
        custom_domain: values.custom_domain || null,
        retention_days: values.retention_days || 30,
        content: {
          title: values.title,
          subtitle: values.subtitle,
          body: values.body,
          cta_text: values.cta_text,
          cta_url: values.cta_url,
          hero_image_url: values.hero_image_url || null,
          hero_image_file_name: uploadedImageFileName || null,
          hero_image_mime_type: uploadedImageMimeType || null,
          hero_image_base64: uploadedImageBase64 || null,
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

  const handleUploadImage = async (file) => {
    setUploadingImage(true);
    try {
      const dataUrl = await toBase64(file);
      const [prefix, rawBase64] = String(dataUrl).split(",", 2);
      const mime = prefix.match(/^data:(.*?);base64$/)?.[1] || file.type || "image/png";
      setUploadedImagePreview(String(dataUrl));
      setUploadedImageBase64(rawBase64 || "");
      setUploadedImageMimeType(mime);
      setUploadedImageFileName(file.name || "hero-image.png");
      form.setFieldValue("hero_image_url", "");
      message.success("이미지 파일이 준비되었습니다. 배포 시 함께 업로드됩니다.");
    } catch (error) {
      message.error("이미지 파일을 읽지 못했습니다.");
    } finally {
      setUploadingImage(false);
    }
    return false;
  };

  return (
    <div className="landing-builder-page">
      <Form layout="vertical" form={form} onFinish={handleDeploy}>
        {!selectedTemplate ? (
          <Card
            title="1단계 · 템플릿 선택"
            extra={<Typography.Text type="secondary">원하는 화면 분위기를 먼저 선택하세요.</Typography.Text>}
            loading={isTemplateLoading}
          >
            <Row gutter={[16, 16]}>
              {templates.map((template) => {
                return (
                  <Col xs={24} lg={8} key={template.id}>
                    <Card className="template-option-card" bodyStyle={{ padding: 16 }}>
                      <div className={`template-mini-preview template-${template.id}`}>
                        <div className="template-micro-nav">
                          <span />
                          <span />
                          <span />
                        </div>
                        <h4>{template.name}</h4>
                        <p>{template.description}</p>
                        <small>선택 시 본문/색상 초기값 자동 로드</small>
                      </div>
                      <Typography.Title level={5} className="template-option-title">
                        {template.name}
                      </Typography.Title>
                      <Typography.Paragraph type="secondary" className="template-option-description">
                        {template.description}
                      </Typography.Paragraph>
                      <Button
                        type="primary"
                        block
                        loading={isTemplateDetailLoading && pendingTemplateId === template.id}
                        disabled={isTemplateDetailLoading}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
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
                  <Space size={8} wrap>
                    <Tag color="blue">실시간 최종본 미리보기</Tag>
                    <Tag color="geekblue">색상 프리셋 제공</Tag>
                    <Tag color="cyan">모바일/데스크톱 전환</Tag>
                  </Space>
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
              <div className="landing-live-layout" style={{ backgroundColor: values.background_color || "#f8fafc" }}>
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={13}>
                    <div className="landing-copy-editor">
                      <div className="landing-inline-field">
                        <Form.Item
                          name="title"
                          label="메인 타이틀"
                          rules={[{ required: true, message: "메인 타이틀을 입력하세요." }]}
                        >
                          <Input
                            placeholder="예시 : 울산의 미래를 코딩하다"
                            style={{
                              color: values.title_color || "#0f172a",
                              fontSize: 26,
                              fontWeight: 700,
                              height: 48,
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
                            placeholder="예시 : 빅테크 AI 인재 양성 프로젝트"
                            style={{
                              color: values.subtitle_color || "#2563eb",
                              fontSize: 18,
                              fontWeight: 600,
                              height: 42,
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
                            rows={5}
                            placeholder="예시 : 울산 데이터센터 시대를 이끌어갈 실무 중심 AI/클라우드 교육 과정을 소개합니다."
                            style={{ color: values.body_color || "#334155", fontSize: 15, lineHeight: 1.8 }}
                          />
                        </Form.Item>
                        <Form.Item name="body_color" label="설명 문구 색상" rules={[{ required: true }]}>
                          <Input type="color" className="landing-builder-color" />
                        </Form.Item>
                      </div>

                      <Form.Item name="hero_image_url" label="대표 이미지 URL(선택)">
                        <Input placeholder="예시 : https://images.unsplash.com/..." />
                      </Form.Item>

                      <Form.Item label="대표 이미지 파일 업로드(선택)">
                        <Space direction="vertical" size={8} style={{ width: "100%" }}>
                          <Upload
                            maxCount={1}
                            accept="image/*"
                            beforeUpload={handleUploadImage}
                            showUploadList={false}
                          >
                            <Button loading={uploadingImage}>
                              로컬에서 이미지 선택
                            </Button>
                          </Upload>
                          {uploadedImageFileName ? (
                            <Typography.Text type="secondary">선택됨: {uploadedImageFileName}</Typography.Text>
                          ) : null}
                        </Space>
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="cta_text"
                            label="버튼 문구"
                            rules={[{ required: true, message: "버튼 문구를 입력하세요." }]}
                          >
                            <Input placeholder="예시 : 지금 신청하기" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={12}>
                          <Form.Item
                            name="cta_url"
                            label="버튼 링크"
                            rules={[{ required: true, message: "버튼 링크를 입력하세요." }]}
                          >
                            <Input placeholder="예시 : https://tool.icore.co.kr/apply" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider className="landing-divider" />

                      <div className="landing-design-tools">
                        <Typography.Text strong>디자인 프리셋</Typography.Text>
                        <div className="landing-preset-list">
                          {COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset.key}
                              type="button"
                              className="landing-preset-chip"
                              onClick={() => applyColorPreset(preset.key)}
                            >
                              <span style={{ background: preset.cta_bg_color }} />
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

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

                  <Col xs={24} lg={11}>
                    <div className="landing-preview-frame">
                      <div className="landing-preview-topbar">
                        <Typography.Text strong>최종본 미리보기</Typography.Text>
                        <Segmented
                          options={[
                            { label: "Desktop", value: "desktop" },
                            { label: "Mobile", value: "mobile" },
                          ]}
                          value={previewViewport}
                          onChange={setPreviewViewport}
                          size="small"
                        />
                      </div>

                      <div
                        className={`landing-visual-pane ${previewViewport === "mobile" ? "is-mobile" : ""}`}
                        style={{ backgroundColor: values.background_color || "#f8fafc" }}
                      >
                        <div className="preview-nav">
                          <strong>{values.business_name || "예시 : iCore AI Education"}</strong>
                          <span>Template · {selectedTemplate.name}</span>
                        </div>

                        <div className="preview-hero">
                          <h2 style={{ color: values.title_color || "#0f172a" }}>
                            {values.title || "예시 : 울산의 미래를 코딩하다"}
                          </h2>
                          <p className="preview-subtitle" style={{ color: values.subtitle_color || "#2563eb" }}>
                            {values.subtitle || "예시 : 빅테크 AI 인재 양성 프로젝트"}
                          </p>
                          <p className="preview-body" style={{ color: values.body_color || "#334155" }}>
                            {values.body ||
                              "예시 : 실무 중심 커리큘럼과 프로젝트 기반 학습으로 성장을 가속화하세요."}
                          </p>
                        </div>

                        {values.hero_image_url ? (
                          <img src={values.hero_image_url} alt="랜딩 대표" className="landing-visual-image" />
                        ) : uploadedImagePreview ? (
                          <img src={uploadedImagePreview} alt="업로드 대표" className="landing-visual-image" />
                        ) : (
                          <div className="landing-visual-placeholder">대표 이미지를 넣으면 최종 랜딩처럼 보여줍니다.</div>
                        )}

                        <div className="preview-feature-grid">
                          <article>현업 중심 커리큘럼</article>
                          <article>전문가 피드백</article>
                          <article>프로젝트 포트폴리오</article>
                        </div>

                        <Button
                          className="landing-live-cta"
                          style={{
                            backgroundColor: values.cta_bg_color || "#2563eb",
                            color: values.cta_text_color || "#ffffff",
                          }}
                        >
                          {values.cta_text || "예시 : 지금 신청하기"}
                        </Button>
                      </div>
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
              <Input placeholder="예시 : 교육 프로그램 / 이벤트 / 제품 소개" />
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
              <Input placeholder="예시 : 2026 AI 실무 과정" />
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
              <Input placeholder="예시 : ai-course-2026" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="major_categories"
              label="대분류(복수 선택)"
              rules={[{ required: true, message: "최소 1개 이상 선택하세요." }]}
            >
              <Select mode="multiple" options={MAJOR_CATEGORY_OPTIONS} placeholder="업체별, CSP, 지역별" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="minor_categories"
              label="소분류(복수 선택)"
              rules={[{ required: true, message: "최소 1개 이상 선택하세요." }]}
            >
              <Select
                mode="multiple"
                options={availableMinorOptions}
                placeholder="대분류를 먼저 선택하세요"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="custom_domain" label="커스텀 도메인(선택)">
              <Input placeholder="예시 : academy.icore.co.kr" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="retention_days" label="화면 유지 기간(일)">
              <Select options={DEPLOY_RETENTION_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="publish_scope" label="배포 범위">
          <Input placeholder="예시 : public / internal" />
        </Form.Item>

        <Typography.Paragraph type="secondary" className="deploy-helper-text">
          유지 기간이 지나면 페이지는 사용자 목록에서 숨김 처리되며, 버킷 객체는 유지됩니다.
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
