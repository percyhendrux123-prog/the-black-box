import { useState } from "react";
import type { Mode } from "./types";
import Frame from "./components/Frame";
import Lights from "./components/Lights";
import Grain from "./components/Grain";
import Grid from "./components/Grid";
import Marquee from "./components/Marquee";
import BrandBug from "./components/BrandBug";
import ModeToggle from "./components/ModeToggle";
import SessionMark from "./components/SessionMark";
import OutputCard from "./components/OutputCard";
import TimecodeRail from "./components/TimecodeRail";
import CommandBar from "./components/CommandBar";
import CornerHUD from "./components/CornerHUD";

/**
 * THE BLACK BOX — v1.0
 * Brand-finding-instrument carousel generator.
 *
 * Mode is held at the top and threaded through the layers. Most styling
 * adapts via CSS attribute selectors on `<Frame data-mode={mode}>` so the
 * 0.4–0.5s ease transitions stay buttery without React re-renders.
 */
export default function App() {
  const [mode, setMode] = useState<Mode>("sohne");

  return (
    <Frame mode={mode}>
      <Lights />
      <Grain />
      <Grid />
      <Marquee />

      <BrandBug scene={4} total={9} />
      <ModeToggle mode={mode} onChange={setMode} />
      <SessionMark />

      <OutputCard mode={mode} />
      <TimecodeRail active={4} />

      <CommandBar />
      <CornerHUD mode={mode} />
    </Frame>
  );
}
