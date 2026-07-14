import { useEffect, useRef } from 'react';
import * as Matter from 'matter-js';

export function PhysicsBackground() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    // 1. Setup Engine & World
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0, scale: 0 }, // Zero gravity for floating effect
    });
    engineRef.current = engine;
    const world = engine.world;

    // 2. Setup Render
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: 'transparent',
        wireframes: false,
      },
    });
    renderRef.current = render;

    // 3. Create Particles (colors to match theme)
    const particles: Matter.Body[] = [];
    const colors = ['#222222', '#111111', '#FF3B00'];
    
    for (let i = 0; i < 40; i++) {
      const radius = Math.random() * 8 + 4;
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      
      const particle = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.9,
        friction: 0.1,
        frictionAir: 0.01,
        render: {
          fillStyle: colors[Math.floor(Math.random() * colors.length)],
          opacity: 0.4,
        },
      });

      // Give them a random initial velocity
      Matter.Body.setVelocity(particle, {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
      });

      particles.push(particle);
    }

    // Add boundaries so particles bounce back
    const wallOptions = { isStatic: true, render: { visible: false } };
    const w = window.innerWidth;
    const h = window.innerHeight;
    const wallThickness = 50;

    const topWall = Matter.Bodies.rectangle(w/2, -wallThickness/2, w, wallThickness, wallOptions);
    const bottomWall = Matter.Bodies.rectangle(w/2, h + wallThickness/2, w, wallThickness, wallOptions);
    const leftWall = Matter.Bodies.rectangle(-wallThickness/2, h/2, wallThickness, h, wallOptions);
    const rightWall = Matter.Bodies.rectangle(w + wallThickness/2, h/2, wallThickness, h, wallOptions);

    Matter.World.add(world, [...particles, topWall, bottomWall, leftWall, rightWall]);

    // 4. Run the Engine & Render
    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    // Handle Resize
    const handleResize = () => {
      if (renderRef.current && sceneRef.current) {
        renderRef.current.canvas.width = window.innerWidth;
        renderRef.current.canvas.height = window.innerHeight;
        Matter.Body.setPosition(rightWall, { x: window.innerWidth + wallThickness/2, y: window.innerHeight/2 });
        Matter.Body.setPosition(bottomWall, { x: window.innerWidth/2, y: window.innerHeight + wallThickness/2 });
      }
    };
    window.addEventListener('resize', handleResize);

    // 5. Cleanup Function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
        if (renderRef.current.canvas && sceneRef.current) {
            // safely remove canvas if it exists
            try {
                sceneRef.current.removeChild(renderRef.current.canvas);
            } catch (e) {
                // ignore
            }
        }
      }
      
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
      
      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false);
        Matter.Engine.clear(engineRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={sceneRef} 
      className="fixed inset-0 z-0 pointer-events-none opacity-50"
      aria-hidden="true"
    />
  );
}
