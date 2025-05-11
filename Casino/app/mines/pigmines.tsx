import React, { useEffect } from "react";
import { mines } from "../scripts/mines";

export default function PigMines() {
  useEffect(() => {
    mines(5); // Example: call with 5 bombs
  }, []);

  return (
    <div className="text-white">
      PigMines game coming soon!
    </div>
  );
}