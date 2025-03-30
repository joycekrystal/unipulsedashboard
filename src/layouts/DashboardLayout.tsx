import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import {
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  CalendarOutlined,
  MessageOutlined,
  ToolOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import BRAND_LOGO from "@/assets/brand-logo.png";

const { Header, Sider, Content } = Layout;

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    console.log("Signing out...");
  };

  const menuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: "Dashboard Overview",
      onClick: () => navigate("/admin/home"),
    },
    {
      key: "2",
      icon: <BellOutlined />,
      label: "Announcements",
      onClick: () => navigate("/admin/announcements"),
    },
    {
      key: "3",
      icon: <CalendarOutlined />,
      label: "Events",
      onClick: () => navigate("/admin/events"),
    },
    {
      key: "4",
      icon: <MessageOutlined />,
      label: "Forums",
      onClick: () => navigate("/admin/forums"),
    },
    {
      key: "5",
      icon: <ToolOutlined />,
      label: "Digital Toolkits",
      onClick: () => navigate("/admin/toolkits"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="admin-sidebar"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="p-4 flex items-center justify-center">
          <img
            src={BRAND_LOGO}
            alt="Brand Logo"
            className={`transition-all duration-200 ${
              collapsed ? "w-8 h-8" : "w-12 h-12"
            }`}
          />
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          className="admin-sidebar border-none"
          style={{ background: "transparent" }}
          items={menuItems}
        />
      </Sider>
      <Layout
        style={{ marginLeft: collapsed ? 80 : 200, transition: "all 0.2s" }}
      >
        <Header
          style={{
            padding: 0,
            background: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 1,
            width: "100%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-center justify-between px-4 h-full">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </Button>
          </div>
        </Header>
        <Content className="p-6">
          <div className="bg-white p-6 rounded-lg min-h-[280px]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
