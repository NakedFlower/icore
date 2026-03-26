import { Card, Typography } from "antd";

function FutureModules() {
  return (
    <Card title="추가 기능 확장 공간">
      <Typography.Paragraph>
        이 메뉴는 향후 기능 확장을 위해 비워둔 영역입니다.
      </Typography.Paragraph>
      <Typography.Paragraph type="secondary">
        차기 개발자가 신규 모듈을 붙일 수 있도록 메뉴 위치만 유지합니다.
      </Typography.Paragraph>
    </Card>
  );
}

export default FutureModules;
