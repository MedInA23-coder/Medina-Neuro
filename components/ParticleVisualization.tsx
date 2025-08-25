
import React, { useRef, useEffect } from 'react';
import type { Prediction } from '../types';

interface ParticleVisualizationProps {
    predictions: Prediction[];
    isProcessing: boolean;
    promptText: string;
    activePrediction: Prediction | null;
    onPredictionSelect: (prediction: Prediction) => void;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    word: string;
    confidence: number;
    analysis: string;
}

export const ParticleVisualization: React.FC<ParticleVisualizationProps> = ({ predictions, isProcessing, promptText, activePrediction, onPredictionSelect }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const parent = canvas.parentElement;
        if (!parent) return;

        let canvasWidth = 0;
        let canvasHeight = 0;

        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = parent.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            canvasWidth = rect.width;
            canvasHeight = rect.height;
        };

        resizeCanvas();

        particlesRef.current = predictions.map((p) => ({
            x: canvasWidth / 2 + (Math.random() - 0.5) * 200,
            y: canvasHeight / 2 + (Math.random() - 0.5) * 200,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: 8,
            word: p.word,
            confidence: p.confidence,
            analysis: p.analysis,
        }));
        
        const runInteractionLogic = (clientX: number, clientY: number) => {
            const canvasBounds = canvas.getBoundingClientRect();
            if (!canvasBounds) return;

            const interactionX = clientX - canvasBounds.left;
            const interactionY = clientY - canvasBounds.top;
            
            for (const particle of particlesRef.current) {
                const distance = Math.sqrt(Math.pow(particle.x - interactionX, 2) + Math.pow(particle.y - interactionY, 2));
                if (distance < particle.radius + 20) { // Increased buffer for touch
                    const newSelection = predictions.find(p => p.word === particle.word);
                    if(newSelection) {
                       onPredictionSelect(newSelection);
                    }
                    break; 
                }
            }
        };

        const handleMouseClick = (event: MouseEvent) => {
            runInteractionLogic(event.clientX, event.clientY);
        };

        const handleTouchEnd = (event: TouchEvent) => {
            // Prevent the browser from firing a "ghost" click event after the touch.
            event.preventDefault(); 
            if (event.changedTouches.length > 0) {
                runInteractionLogic(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
            }
        };

        canvas.addEventListener('click', handleMouseClick);
        canvas.addEventListener('touchend', handleTouchEnd);


        const animate = () => {
            const centerX = canvasWidth / 2;
            const centerY = canvasHeight / 2;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            
            // Draw central prompt
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '16px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(promptText, centerX, centerY);

            if (isProcessing) {
                const pulse = Math.abs(Math.sin(Date.now() * 0.002));
                ctx.strokeStyle = `rgba(217, 70, 239, ${pulse * 0.8})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, 40 + pulse * 10, 0, Math.PI * 2);
                ctx.stroke();
            }

            particlesRef.current.forEach((p, i) => {
                const isActive = p.word === activePrediction?.word;
                p.radius = isActive ? 12 : 8;

                // Physics
                const dx = centerX - p.x;
                const dy = centerY - p.y;
                
                p.vx += dx * 0.0005;
                p.vy += dy * 0.0005;
                
                particlesRef.current.forEach((other, j) => {
                    if (i === j) return;
                    const rdx = p.x - other.x;
                    const rdy = p.y - other.y;
                    const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
                    if (rdist > 0 && rdist < 80) {
                        p.vx += rdx / rdist * 0.1;
                        p.vy += rdy / rdist * 0.1;
                    }
                });

                p.vx *= 0.95;
                p.vy *= 0.95;

                p.x += p.vx;
                p.y += p.vy;

                // Draw line from center
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = isActive ? 'rgba(217, 70, 239, 0.5)' : 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = isActive ? 2 : 1;
                ctx.stroke();

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = isActive ? '#d946ef' : '#ffffff';
                if (isActive) {
                    ctx.shadowColor = '#d946ef';
                    ctx.shadowBlur = 15;
                }
                ctx.fill();
                ctx.shadowBlur = 0;

                // Draw word
                ctx.fillStyle = isActive ? '#ffffff' : '#a1a1aa';
                ctx.font = isActive ? 'bold 14px "Courier New", monospace' : '12px "Courier New", monospace';
                ctx.fillText(p.word, p.x, p.y + p.radius + 15);
            });

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if(animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            canvas.removeEventListener('click', handleMouseClick);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    }, [predictions, isProcessing, promptText, activePrediction, onPredictionSelect]);

    return <canvas ref={canvasRef} style={{ cursor: 'pointer' }} />;
};
