import { ConfigProvider, App as AntdApp } from "antd";
import { antdTheme } from "@/styles/antd-theme";
import { AppRouter } from "@/router";

export function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp>
        <AppRouter />
      </AntdApp>
    </ConfigProvider>
  );
}
