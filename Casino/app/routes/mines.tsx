import type { Route } from "./+types/home";
import PigMines from "../mines/pigmines";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Mines() {
  return <PigMines />;
}