declare module "*.svg?react" {
  import type { FC, SVGProps } from "react";
  const component: FC<SVGProps<SVGSVGElement>>;
  export default component;
}

declare module "*.module.less" {
  const classes: Record<string, string>;
  export default classes;
}
