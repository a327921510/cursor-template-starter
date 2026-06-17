import { Typography } from "antd";

const { Title, Paragraph } = Typography;

export function HomePage() {
  return (
    <div className="mx-auto max-w-3xl py-12 text-center">
      <Title>Welcome</Title>
      <Paragraph type="secondary">
        项目已初始化完成，按四层架构开始开发页面吧。
      </Paragraph>
    </div>
  );
}

export default HomePage;
