
import { useCallback } from "react";
import Particles from "react-particles";
import type { Container, Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import { useTheme } from "@/contexts/ThemeContext";

export default function ParticleBackground() {
  const { theme } = useTheme();
  
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    // Container loaded
  }, []);
  
  const isDark = theme === 'dark';

  return (
    <Particles
      id="tsparticles"
      className="fixed inset-0 -z-50 pointer-events-none"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        fullScreen: false,
        fpsLimit: 60,
        particles: {
          color: {
            value: isDark ? "#6366f1" : "#8b5cf6",
          },
          links: {
            color: isDark ? "#6366f1" : "#8b5cf6",
            distance: 180,
            enable: true,
            opacity: isDark ? 0.1 : 0.2,
            width: 1,
          },
          collisions: {
            enable: false,
          },
          move: {
            enable: true,
            outModes: {
              default: "out",
            },
            random: true,
            speed: 0.4,
            direction: "none",
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 1200,
            },
            value: 30,
          },
          opacity: {
            value: isDark ? 0.2 : 0.3,
            animation: {
              enable: true,
              speed: 0.2,
              minimumValue: 0.1,
            },
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 3 },
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.5,
              sync: false
            }
          },
        },
        detectRetina: true,
        backgroundMask: {
          enable: false,
        },
        background: {
          color: "transparent",
        },
      }}
    />
  );
}
