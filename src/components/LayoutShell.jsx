import { Layout, Menu, Typography } from "antd";
import { TOOL_MENUS } from "../config/menuConfig";
import "./LayoutShell.css";

const { Header, Sider, Content } = Layout;

function LayoutShell({ activeKey, onChangeMenu, children }) {
  return (
    <Layout className="layout-shell">
      <Sider width={270} className="layout-shell-sider">
        <div className="layout-shell-brand">iCore 업무 플랫폼</div>
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          onClick={(event) => onChangeMenu(event.key)}
          items={TOOL_MENUS.map((tool) => ({
            key: tool.key,
            label: tool.title,
          }))}
        />
      </Sider>
      <Layout>
        <Header className="layout-shell-header">
          <Typography.Title level={4} className="layout-shell-title">
            {TOOL_MENUS.find((menu) => menu.key === activeKey)?.title}
          </Typography.Title>
        </Header>
        <Content className="layout-shell-content">{children}</Content>
      </Layout>
    </Layout>
  );
}

export default LayoutShell;
