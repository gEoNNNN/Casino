import type { Route } from "./+types/home";
import BombDrop from "../bombdrop/bombdrop";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Crash() {
  return <BombDrop />;
}
