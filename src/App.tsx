import { ConfigProvider } from "antd";
import { antdTheme } from "@/styles/antd-theme";
import { AppRouter } from "@/router";

export function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <AppRouter />
    </ConfigProvider>
  );
}
