import React, { useRef, useEffect } from "react";

const OceanWaves = () => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const colors = ["#0a1f3c", "#0c294e", "#103b69", "#13466f", "#1a5b86"];
    const waveCount = 6;

    // Wave class for managing wave behaviors
    class Wave {
      constructor(index, color, totalWaves, prevWave) {
        this.amplitude = Math.random() * 8 + 12; // Random amplitude for each wave
        this.frequency = Math.random() * 0.008 + 0.008 + (Math.random() * 0.002 - 0.001); // Slightly vary frequency
        this.baseSpeed = 1.5; // Base speed
        this.speed = this.baseSpeed;
        this.color = color;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.phase = Math.random() * Math.PI * 2; // Initial random phase for smooth animation

        // Set initial offsetY based on the index
        const previousOffsetY = prevWave ? prevWave.offsetY : 0;
        const waveSpacing = 150; // Minimum space between waves

        // Ensure the current wave starts only after the previous wave has moved far enough
        this.offsetY = previousOffsetY + waveSpacing;

        // Make sure the first wave starts correctly
        if (this.offsetY >= this.height) {
          this.offsetY = this.height - this.amplitude; // Ensure no overlap at the top
        }
      }

      update() {
        // Gradually reduce speed before fade-out begins (75% of height)
        const slowDownStart = this.height * 0.75;
        const slowDownFactor =
          this.offsetY >= slowDownStart
            ? Math.max(0.1, 1 - (this.offsetY - slowDownStart) / (this.height - slowDownStart))
            : 1;

        this.speed = this.baseSpeed * slowDownFactor;

        this.offsetY += this.speed;

        // Smooth wrapping around with no gap or break
        if (this.offsetY > this.height) {
          this.offsetY = -this.amplitude; // Place wave just off-screen to regenerate smoothly
        }

        // Animate the sine wave's phase over time to simulate motion
        this.phase += 0.02; // Increase phase over time to animate the wave
      }

      draw(ctx) {
        const points = [];

        // Generate points for the wave based on the sine function
        for (let x = 0; x < this.width; x += 3) {
          const y =
            this.offsetY +
            Math.sin(x * this.frequency + this.phase) * this.amplitude; // Pure sine wave with evolving phase

          points.push({ x, y });
        }

        // Compute fade factor only near bottom 1/4 of screen
        const fadeStart = this.height * 0.75;
        const fade =
          this.offsetY < fadeStart
            ? 1
            : 1 - Math.min((this.offsetY - fadeStart) / (this.height - fadeStart), 1);

        ctx.strokeStyle = this.applyAlpha(this.color, fade); // Apply fade effect on the wave
        ctx.lineWidth = 3; // Set a standard line width for the wave
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        // Use cubic Bézier curves for smooth transitions
        for (let i = 1; i < points.length - 2; i++) {
          const cp1x = (points[i].x + points[i + 1].x) / 2;
          const cp1y = (points[i].y + points[i + 1].y) / 2;
          const cp2x = (points[i + 1].x + points[i + 2].x) / 2;
          const cp2y = (points[i + 1].y + points[i + 2].y) / 2;
          ctx.bezierCurveTo(points[i].x, points[i].y, cp1x, cp1y, cp2x, cp2y);
        }

        ctx.stroke();
      }

      // Function to apply transparency to the color
      applyAlpha(hex, alpha) {
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);
        return `rgba(${r},${g},${b},${alpha})`;
      }
    }

    // Create waves in sequence, ensuring no overlap between them
    let prevWave = null;
    const waves = Array.from({ length: waveCount }, (_, i) => {
      const color = colors[i % colors.length];
      const wave = new Wave(i, color, waveCount, prevWave);
      prevWave = wave; // Set the current wave as the previous wave for the next iteration
      return wave;
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      waves.forEach((wave) => {
        wave.update();
        wave.draw(ctx);
      });
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,               // <-- Behind everything    
        width: "100vw",
        height: "100vh",
        display: "block",
        backgroundColor: "#01030f",
      }}
    />
  );
};

export default OceanWaves;