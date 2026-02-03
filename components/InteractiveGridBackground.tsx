import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface GridPoint {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  vx: number;
  vy: number;
}

interface MousePosition {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isActive: boolean;
}

const InteractiveGridBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const mouseRef = useRef<MousePosition>({ 
    x: 0, y: 0, 
    targetX: 0, targetY: 0, 
    isActive: false 
  });
  
  const gridPointsRef = useRef<GridPoint[][]>([]);

  // CONFIGURATION: Continuous Fluid Animation 🌊
  const config = {
    gridSize: 35,           // Larger grid for smoother flow
    strength: 1.0,          // Gentle movement strength
    
    // Physics
    friction: 0.92,         // Smooth gliding
    ease: 0.06,             // Responsive spring
    
    lineColor: 'rgba(22, 155, 82, 0.1)', // Softer green
    lineWidth: 0.8,         // Slightly thicker for visibility
  };

  // Helper: Linear Interpolation
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const initializeGrid = useCallback((width: number, height: number) => {
    // Add extra padding to prevent edges from showing
    const cols = Math.ceil(width / config.gridSize) + 4;
    const rows = Math.ceil(height / config.gridSize) + 4;
    const grid: GridPoint[][] = [];

    for (let i = 0; i < rows; i++) {
      grid[i] = [];
      for (let j = 0; j < cols; j++) {
        // Center the grid and add bleed
        const x = j * config.gridSize - (config.gridSize * 2);
        const y = i * config.gridSize - (config.gridSize * 2);
        
        grid[i][j] = {
          x,
          y,
          originalX: x,
          originalY: y,
          vx: 0,
          vy: 0
        };
      }
    }
    gridPointsRef.current = grid;
  }, [config.gridSize]);

  // Handle mouse movement (disabled for continuous animation)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Mouse interaction disabled - continuous fluid animation only
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Mouse interaction disabled
  }, []);

  const updateAndDraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grid = gridPointsRef.current;
    const { width, height } = canvas;
    const time = Date.now() * 0.001; // Convert to seconds

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000000'; 
    ctx.fillRect(0, 0, width, height);

    // 2. CONTINUOUS FLUID ANIMATION
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const point = grid[i][j];

        // Continuous fluid motion using multiple sine waves
        const wave1 = Math.sin(time * 0.3 + i * 0.1) * 15;
        const wave2 = Math.cos(time * 0.2 + j * 0.15) * 12;
        const wave3 = Math.sin(time * 0.4 + (i + j) * 0.05) * 8;
        
        // Create flowing motion patterns
        const flowX = wave1 + wave3;
        const flowY = wave2 + Math.sin(time * 0.25 + i * 0.08) * 10;
        
        // Add subtle rotation effect
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = point.originalX - centerX;
        const dy = point.originalY - centerY;
        const rotation = Math.sin(time * 0.1) * 0.02;
        
        const rotatedX = centerX + dx * Math.cos(rotation) - dy * Math.sin(rotation);
        const rotatedY = centerY + dx * Math.sin(rotation) + dy * Math.cos(rotation);

        let targetX = rotatedX + flowX;
        let targetY = rotatedY + flowY;

        // Spring Physics for smooth motion
        const ax = (targetX - point.x) * config.ease;
        const ay = (targetY - point.y) * config.ease;

        point.vx = (point.vx + ax) * config.friction;
        point.vy = (point.vy + ay) * config.friction;

        point.x += point.vx;
        point.y += point.vy;
      }
    }

    // 3. DRAW CURVES
    ctx.strokeStyle = config.lineColor;
    ctx.lineWidth = config.lineWidth;
    
    ctx.beginPath();
    
    // Horizontal
    grid.forEach(row => {
      if (row.length > 0) ctx.moveTo(row[0].x, row[0].y);
      for (let j = 0; j < row.length - 1; j++) {
        const curr = row[j];
        const next = row[j + 1];
        const mx = (curr.x + next.x) / 2;
        const my = (curr.y + next.y) / 2;
        ctx.quadraticCurveTo(curr.x, curr.y, mx, my);
      }
      if (row.length > 0) {
        const last = row[row.length - 1];
        ctx.lineTo(last.x, last.y);
      }
    });

    // Vertical
    const widthLen = grid[0]?.length || 0;
    for (let j = 0; j < widthLen; j++) {
      if (grid.length > 0) ctx.moveTo(grid[0][j].x, grid[0][j].y);
      for (let i = 0; i < grid.length - 1; i++) {
        const curr = grid[i][j];
        const next = grid[i + 1][j];
        const mx = (curr.x + next.x) / 2;
        const my = (curr.y + next.y) / 2;
        ctx.quadraticCurveTo(curr.x, curr.y, mx, my);
      }
      if (grid.length > 0) {
        const last = grid[grid.length - 1][j];
        ctx.lineTo(last.x, last.y);
      }
    }
    
    ctx.stroke();

  }, [config]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeGrid(canvas.width, canvas.height);
    }
  }, [initializeGrid]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const ticker = gsap.ticker.add(updateAndDraw);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      gsap.ticker.remove(ticker);
    };
  }, [handleResize, handleMouseMove, handleMouseLeave, updateAndDraw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: '#000000' }}
    />
  );
};

export default InteractiveGridBackground;