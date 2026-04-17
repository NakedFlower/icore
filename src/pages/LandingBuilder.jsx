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
      features: [],
      curriculum: [],
      target_audience: [],
      stats: [],
      infos: [],
      faqs: [],
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
        features: detail.features || [],
        curriculum: detail.curriculum || [],
        target_audience: detail.target_audience || [],
        stats: detail.stats || [],
        infos: detail.infos || [],
        faqs: detail.faqs || [],
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
          features: values.features || [],
          curriculum: values.curriculum || [],
          target_audience: values.target_audience || [],
          stats: values.stats || [],
          infos: values.infos || [],
          faqs: values.faqs || [],
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

                      <div className="landing-dynamic-lists">
                        <Typography.Title level={5}>추천 대상 설정</Typography.Title>
                        <Form.List name="target_audience">
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'description']}
                                    rules={[{ required: true, message: '대상을 입력하세요' }]}
                                  >
                                    <Input placeholder="예: 비전공자 기초 코딩 입문자" style={{ width: 300 }} />
                                  </Form.Item>
                                  <Button onClick={() => remove(name)} danger size="small">삭제</Button>
                                </Space>
                              ))}
                              <Form.Item>
                                <Button type="dashed" onClick={() => add()} block>
                                  + 추천 대상 추가
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>

                        <Divider style={{ margin: '16px 0' }} />

                        <Typography.Title level={5}>과정 특징 설정</Typography.Title>
                        <Form.List name="features">
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, ...restField }) => (
                                <div key={key} style={{ background: '#f8fafc', padding: 16, marginBottom: 16, borderRadius: 8, position: 'relative', border: '1px solid #e2e8f0' }}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'title']}
                                    label="특징 요약"
                                    rules={[{ required: true, message: '특징 제목을 입력하세요' }]}
                                  >
                                    <Input placeholder="예: 현직자 밀착 코칭" />
                                  </Form.Item>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'description']}
                                    label="상세 설명"
                                    rules={[{ required: true, message: '상세 설명을 입력하세요' }]}
                                  >
                                    <Input.TextArea placeholder="특징에 대한 상세한 설명을 적어주세요." rows={2} />
                                  </Form.Item>
                                  <Form.Item label="특징 이미지 (선택)">
                                    <Upload
                                      maxCount={1}
                                      accept="image/*"
                                      showUploadList={false}
                                      beforeUpload={async (file) => {
                                        const dataUrl = await toBase64(file);
                                        const current = form.getFieldValue('features') || [];
                                        current[name] = { ...current[name], image_base64: dataUrl };
                                        form.setFieldsValue({ features: [...current] });
                                        return false;
                                      }}
                                    >
                                      <Button size="small">📷 이미지 선택</Button>
                                    </Upload>
                                    {values.features?.[name]?.image_base64 && (
                                      <img src={values.features[name].image_base64} alt="특징 미리보기" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, marginTop: 6, border: '1px solid #e2e8f0' }} />
                                    )}
                                  </Form.Item>
                                  <Button style={{ position: 'absolute', top: 16, right: 16 }} onClick={() => remove(name)} danger size="small">삭제</Button>
                                </div>
                              ))}
                              <Form.Item>
                                <Button type="dashed" onClick={() => add()} block>
                                  + 과정 특징 추가
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>

                        <Divider style={{ margin: '16px 0' }} />

                        <Typography.Title level={5}>커리큘럼 설정</Typography.Title>
                        <Form.List name="curriculum">
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, ...restField }) => (
                                <div key={key} style={{ background: '#f8fafc', padding: 16, marginBottom: 16, borderRadius: 8, position: 'relative', border: '1px solid #e2e8f0' }}>
                                  <Row gutter={8}>
                                    <Col span={8}>
                                      <Form.Item
                                        {...restField}
                                        name={[name, 'step']}
                                        label="진행 단계"
                                        rules={[{ required: true, message: '단계를 입력하세요' }]}
                                      >
                                        <Input placeholder="예: STEP 1" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={16}>
                                      <Form.Item
                                        {...restField}
                                        name={[name, 'title']}
                                        label="단계별 목표"
                                        rules={[{ required: true, message: '목표를 입력하세요' }]}
                                      >
                                        <Input placeholder="예: 파이썬 기초 마스터" />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'description']}
                                    label="상세 내용 (줄바꿈으로 항목 구분)"
                                    rules={[{ required: true, message: '상세 내용을 입력하세요' }]}
                                  >
                                    <Input.TextArea placeholder="항목별로 줄바꿈해주세요.&#10;예: HTML, CSS 핵심 원리 마스터&#10;객체지향 프로그래밍 입문" rows={3} />
                                  </Form.Item>
                                  <Form.Item label="커리큘럼 이미지 (선택)">
                                    <Upload
                                      maxCount={1}
                                      accept="image/*"
                                      showUploadList={false}
                                      beforeUpload={async (file) => {
                                        const dataUrl = await toBase64(file);
                                        const current = form.getFieldValue('curriculum') || [];
                                        current[name] = { ...current[name], image_base64: dataUrl };
                                        form.setFieldsValue({ curriculum: [...current] });
                                        return false;
                                      }}
                                    >
                                      <Button size="small">📷 이미지 선택</Button>
                                    </Upload>
                                    {values.curriculum?.[name]?.image_base64 && (
                                      <img src={values.curriculum[name].image_base64} alt="커리큘럼 미리보기" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, marginTop: 6, border: '1px solid #e2e8f0' }} />
                                    )}
                                  </Form.Item>
                                  <Button style={{ position: 'absolute', top: 16, right: 16 }} onClick={() => remove(name)} danger size="small">삭제</Button>
                                </div>
                              ))}
                              <Form.Item>
                                <Button type="dashed" onClick={() => add()} block>
                                  + 커리큘럼 추가
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>

                        <Divider style={{ margin: '16px 0' }} />

                        <Typography.Title level={5}>📊 통계 패널 (Stats)</Typography.Title>
                        <Form.List name="stats">
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'value']}
                                    rules={[{ required: true, message: '수치를 입력하세요' }]}
                                  >
                                    <Input placeholder="예: 92%" style={{ width: 120 }} />
                                  </Form.Item>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'title']}
                                    rules={[{ required: true, message: '항목명을 입력하세요' }]}
                                  >
                                    <Input placeholder="예: 취업률" style={{ width: 200 }} />
                                  </Form.Item>
                                  <Button onClick={() => remove(name)} danger size="small">삭제</Button>
                                </Space>
                              ))}
                              <Form.Item>
                                <Button type="dashed" onClick={() => add()} block>
                                  + 통계 항목 추가
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>

                        <Divider style={{ margin: '16px 0' }} />

                        <Typography.Title level={5}>📋 모집 정보 (Info Cards)</Typography.Title>
                        <Form.List name="infos">
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'label']}
                                    rules={[{ required: true, message: '라벨을 입력하세요' }]}
                                  >
                                    <Input placeholder="예: 모집 인원" style={{ width: 140 }} />
                                  </Form.Item>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'val']}
                                    rules={[{ required: true, message: '값을 입력하세요' }]}
                                  >
                                    <Input placeholder="예: 40명 내외 선발" style={{ width: 220 }} />
                                  </Form.Item>
                                  <Button onClick={() => remove(name)} danger size="small">삭제</Button>
                                </Space>
                              ))}
                              <Form.Item>
                                <Button type="dashed" onClick={() => add()} block>
                                  + 모집 정보 추가
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>

                        <Divider style={{ margin: '16px 0' }} />

                        <Typography.Title level={5}>❓ 자주 묻는 질문 (FAQ)</Typography.Title>
                        <Form.List name="faqs">
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, ...restField }) => (
                                <div key={key} style={{ background: '#f8fafc', padding: 16, marginBottom: 16, borderRadius: 8, position: 'relative', border: '1px solid #e2e8f0' }}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'q']}
                                    label="질문"
                                    rules={[{ required: true, message: '질문을 입력하세요' }]}
                                  >
                                    <Input placeholder="예: 비전공자도 따라갈 수 있나요?" />
                                  </Form.Item>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'a']}
                                    label="답변"
                                    rules={[{ required: true, message: '답변을 입력하세요' }]}
                                  >
                                    <Input.TextArea placeholder="자세한 답변을 작성해주세요." rows={3} />
                                  </Form.Item>
                                  <Button style={{ position: 'absolute', top: 16, right: 16 }} onClick={() => remove(name)} danger size="small">삭제</Button>
                                </div>
                              ))}
                              <Form.Item>
                                <Button type="dashed" onClick={() => add()} block>
                                  + FAQ 추가
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </div>
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

                        <div className="preview-rich-content">
                          {(values.target_audience && values.target_audience.length > 0) && (
                            <div className="preview-target-audience">
                              <h3>추천 대상</h3>
                              <ul>
                                {values.target_audience.map((t, idx) => (
                                  <li key={idx}><span className="chk">✓</span> {t?.description || '대상'}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {(values.features && values.features.length > 0) && (
                            <div className="preview-features-grid">
                              <h3>과정 특징</h3>
                              <div className="grid">
                                {values.features.map((f, idx) => (
                                  <article key={idx}>
                                    <h4>{f?.title || '특징'}</h4>
                                    <p>{f?.description || '설명'}</p>
                                  </article>
                                ))}
                              </div>
                            </div>
                          )}

                          {(values.curriculum && values.curriculum.length > 0) && (
                            <div className="preview-curriculum">
                              <h3>커리큘럼</h3>
                              <div className="timeline">
                                {values.curriculum.map((c, idx) => (
                                  <div key={idx} className="step">
                                    <div className="marker" />
                                    <div className="content">
                                      <h4>{c?.step ? `${c.step}: ` : ''}{c?.title || '목표'}</h4>
                                      <p>{c?.description || '내용'}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(values.stats && values.stats.length > 0) && (
                            <div className="preview-stats-grid">
                              <h3>📊 통계</h3>
                              <div className="grid">
                                {values.stats.map((s, idx) => (
                                  <div key={idx} className="stat-card">
                                    <strong>{s?.value || '-'}</strong>
                                    <span>{s?.title || '항목'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(values.infos && values.infos.length > 0) && (
                            <div className="preview-infos">
                              <h3>📋 모집 정보</h3>
                              <div className="info-list">
                                {values.infos.map((info, idx) => (
                                  <div key={idx} className="info-card">
                                    <span className="label">{info?.label || '라벨'}</span>
                                    <span className="val">{info?.val || '값'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(values.faqs && values.faqs.length > 0) && (
                            <div className="preview-faqs">
                              <h3>❓ FAQ</h3>
                              <div className="faq-list">
                                {values.faqs.map((faq, idx) => (
                                  <details key={idx} className="faq-item">
                                    <summary>{faq?.q || '질문'}</summary>
                                    <div className="ans">{faq?.a || '답변'}</div>
                                  </details>
                                ))}
                              </div>
                            </div>
                          )}
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
