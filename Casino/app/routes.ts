import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("bombdrop", "routes/crash.tsx"),
  route("mines", "mines/pigmines.tsx"), 
  route("findthe", "routes/findthe.tsx"),
  route("statistics", "routes/statistics.tsx"),
] satisfies RouteConfig;