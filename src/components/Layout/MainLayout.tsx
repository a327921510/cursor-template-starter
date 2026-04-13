import { Outlet } from "react-router-dom";
import { Layout } from "antd";

const { Header, Content } = Layout;

export function MainLayout() {
  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center px-6">
        <h1 className="m-0 text-lg font-semibold text-white">
          {import.meta.env.VITE_APP_TITLE}
        </h1>
      </Header>
      <Content className="p-6">
        <Outlet />
      </Content>
    </Layout>
  );
}
