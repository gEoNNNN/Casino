import type { Route } from "./+types/home";
import FindThe from "../bobritto/findthe";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Find() {
  return <FindThe />;
}
