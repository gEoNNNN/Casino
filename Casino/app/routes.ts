import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("bombdrop", "routes/crash.tsx"), 
] satisfies RouteConfig;
