import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface AbacusRef {
  reset: () => void;
  setValue: (val: number) => void;
}

interface AbacusCanvasProps {
  numberOfRods: number;
  soundEnabled: boolean;
  onUpdate: (value: number) => void;
}

const AbacusCanvas = forwardRef<AbacusRef, AbacusCanvasProps>(({ numberOfRods, soundEnabled, onUpdate }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // We hold the engine logic in a ref so it doesn't re-instantiate on every render
  const engineRef = useRef<any>({
    abacus: null,
    reset: () => {},
    setValue: (v: number) => {}
  });

  useImperativeHandle(ref, () => ({
    reset: () => engineRef.current.reset(),
    setValue: (val: number) => engineRef.current.setValue(val)
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    // --- Dynamic Sizing ---
    const isMobile = window.innerWidth < 640;
    
    // Layout Constants
    const TOP_MARGIN = 60;
    const LEFT_MARGIN = isMobile ? 15 : 30;
    const ROD_SPACING = isMobile ? 45 : 65;
    
    // Bead Dimensions
    const BEAD_WIDTH = isMobile ? 40 : 52;
    const BEAD_HEIGHT = isMobile ? 24 : 32;
    
    // Frame Dimensions
    const FRAME_THICKNESS = 12;
    const BEAM_THICKNESS = 12;
    const MOVE_GAP = BEAD_HEIGHT; 

    // Calculated Heights
    const HEAVEN_SECTION_HEIGHT = BEAD_HEIGHT + MOVE_GAP;
    const EARTH_SECTION_HEIGHT = (4 * BEAD_HEIGHT) + MOVE_GAP;
    
    const TOTAL_FRAME_HEIGHT = FRAME_THICKNESS + HEAVEN_SECTION_HEIGHT + BEAM_THICKNESS + EARTH_SECTION_HEIGHT + FRAME_THICKNESS;
    
    // Y Coordinates for structure
    const Y_FRAME_TOP = TOP_MARGIN;
    const Y_BEAM = Y_FRAME_TOP + FRAME_THICKNESS + HEAVEN_SECTION_HEIGHT;
    const Y_FRAME_BOTTOM = Y_BEAM + BEAM_THICKNESS + EARTH_SECTION_HEIGHT;

    // Colors
    const COLOR_FRAME_OUTER = '#2d1b0e'; 
    const COLOR_FRAME_INNER = '#fefce8'; 
    const COLOR_BEAM = '#451a03';
    const COLOR_ROD = 'rgba(0,0,0,0.3)';
    const COLOR_BEAD_INACTIVE = '#fef3c7'; 
    const COLOR_BEAD_ACTIVE = '#d97706';   
    const COLOR_BEAD_STROKE = '#78350f';   
    const COLOR_DOT = 'rgba(0, 0, 0, 0.8)';

    // --- Classes Definition (Scoped inside Effect) ---

    class Bead {
        rod: Rod;
        heaven: boolean;
        order: number;
        active: boolean;
        x: number = 0;
        y: number = 0;

        constructor(rod: Rod, heaven: boolean, order: number, active: boolean) {
            this.rod = rod;
            this.heaven = heaven;
            this.order = order;
            this.active = active;
        }

        calculatePosition() {
            const rodX = LEFT_MARGIN + this.rod.position * ROD_SPACING;
            this.x = rodX;

            if (this.heaven) {
                const inactiveY = Y_FRAME_TOP + FRAME_THICKNESS + (BEAD_HEIGHT / 2);
                const activeY = Y_BEAM - (BEAD_HEIGHT / 2);
                this.y = this.active ? activeY : inactiveY;
            } else {
                const baseYInactive = Y_FRAME_BOTTOM - FRAME_THICKNESS;
                const baseYActive = Y_BEAM + BEAM_THICKNESS;

                if (this.active) {
                    this.y = baseYActive + ((this.order - 1) * BEAD_HEIGHT) + (BEAD_HEIGHT / 2);
                } else {
                    this.y = baseYInactive - ((4 - this.order) * BEAD_HEIGHT) - (BEAD_HEIGHT / 2);
                }
            }
        }

        draw(ctx: CanvasRenderingContext2D) {
            this.calculatePosition();
            const { x, y } = this;
            const w = BEAD_WIDTH;
            const h = BEAD_HEIGHT;

            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 4;
            
            ctx.fillStyle = this.active ? COLOR_BEAD_ACTIVE : COLOR_BEAD_INACTIVE;
            ctx.strokeStyle = COLOR_BEAD_STROKE;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(x - w / 2, y);
            ctx.lineTo(x + w / 2, y);
            ctx.lineTo(x + w / 6, y - h / 2);
            ctx.lineTo(x - w / 6, y - h / 2);
            ctx.lineTo(x - w / 2, y);
            ctx.lineTo(x - w / 6, y + h / 2);
            ctx.lineTo(x + w / 6, y + h / 2);
            ctx.lineTo(x + w / 2, y);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // Highlight Dot
            ctx.save();
            ctx.beginPath();
            ctx.arc(x - (isMobile ? 6 : 10), y - (isMobile ? 3 : 5), isMobile ? 2 : 4, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.fill();
            ctx.restore();
        }
        
        contains(tx: number, ty: number) {
            return (
                tx >= this.x - BEAD_WIDTH / 2 &&
                tx <= this.x + BEAD_WIDTH / 2 &&
                ty >= this.y - BEAD_HEIGHT / 2 &&
                ty <= this.y + BEAD_HEIGHT / 2
            );
        }
    }

    class Rod {
        position: number;
        beads: Bead[];
        value: number;

        constructor(position: number, beads: Bead[]) {
            this.position = position;
            this.beads = beads;
            this.value = 0;
        }

        reset() {
            this.beads.forEach(b => b.active = false);
            this.value = 0;
        }

        setDigit(digit: number) {
            this.reset();
            let remainder = digit;
            
            if (remainder >= 5) {
                this.beads[0].active = true;
                remainder -= 5;
            }

            for (let i = 1; i <= remainder; i++) {
                this.beads[i].active = true;
            }
            this.value = digit;
        }

        draw(ctx: CanvasRenderingContext2D) {
            const x = LEFT_MARGIN + this.position * ROD_SPACING;
            
            // Draw Rod Line
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, Y_FRAME_TOP + FRAME_THICKNESS);
            ctx.lineTo(x, Y_FRAME_BOTTOM - FRAME_THICKNESS);
            ctx.lineWidth = 4;
            ctx.strokeStyle = COLOR_ROD;
            ctx.stroke();
            ctx.restore();

            // Draw Value
            ctx.save();
            ctx.font = "bold 20px Vazirmatn, sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = '#333';
            ctx.fillText(this.value.toString(), x, TOP_MARGIN - 15);
            ctx.restore();

            this.beads.forEach(b => b.draw(ctx));
        }
    }

    class Abacus {
        numberOfRods: number;
        rods: Rod[];
        onUpdateCallback: (val: number) => void;
        width: number;

        constructor(rodCount: number, onUpdateCallback: (val: number) => void) {
            this.numberOfRods = rodCount;
            this.onUpdateCallback = onUpdateCallback;
            this.rods = [];
            this.width = (LEFT_MARGIN * 2) + ((rodCount - 1) * ROD_SPACING); 
            
            for (let i = 0; i < rodCount; i++) {
                const beads: Bead[] = [];
                const rod = new Rod(i, beads);
                // Heaven Bead (Order 0)
                beads.push(new Bead(rod, true, 0, false));
                // Earth Beads (Order 1-4)
                for (let j = 1; j <= 4; j++) {
                    beads.push(new Bead(rod, false, j, false));
                }
                this.rods.push(rod);
            }
        }

        calculateTotal() {
            let total = 0;
            for (let i = 0; i < this.numberOfRods; i++) {
                const power = this.numberOfRods - 1 - i;
                total += this.rods[i].value * Math.pow(10, power);
            }
            return total;
        }

        setValue(value: number) {
            let tempVal = value;
            for (let i = this.numberOfRods - 1; i >= 0; i--) {
                const digit = tempVal % 10;
                tempVal = Math.floor(tempVal / 10);
                this.rods[i].setDigit(digit);
            }
            this.onUpdateCallback(this.calculateTotal());
        }

        drawFrame(ctx: CanvasRenderingContext2D) {
            // Inner Background
            ctx.fillStyle = COLOR_FRAME_INNER;
            ctx.fillRect(LEFT_MARGIN - 20, Y_FRAME_TOP, this.width - (LEFT_MARGIN * 2) + 40, TOTAL_FRAME_HEIGHT);

            // Outer Frame
            ctx.lineWidth = FRAME_THICKNESS;
            ctx.strokeStyle = COLOR_FRAME_OUTER;
            ctx.strokeRect(LEFT_MARGIN - 20, Y_FRAME_TOP + FRAME_THICKNESS/2, this.width - (LEFT_MARGIN * 2) + 40, TOTAL_FRAME_HEIGHT - FRAME_THICKNESS);

            // Beam
            ctx.fillStyle = COLOR_BEAM;
            ctx.fillRect(LEFT_MARGIN - 20, Y_BEAM, this.width - (LEFT_MARGIN * 2) + 40, BEAM_THICKNESS);

            // Unit markers
            ctx.fillStyle = COLOR_DOT;
            for (let i = 0; i < this.numberOfRods; i++) {
                const fromRight = this.numberOfRods - 1 - i;
                if (fromRight % 3 === 0) {
                     const x = LEFT_MARGIN + i * ROD_SPACING;
                     ctx.beginPath();
                     ctx.arc(x, Y_BEAM + BEAM_THICKNESS / 2, 3, 0, Math.PI * 2);
                     ctx.fill();
                }
            }
        }

        draw(ctx: CanvasRenderingContext2D, cvs: HTMLCanvasElement) {
            const totalWidth = this.width + 40; 
            const totalHeight = Y_FRAME_BOTTOM + 40;
            
            if (cvs.width !== totalWidth || cvs.height !== totalHeight) {
                cvs.width = totalWidth;
                cvs.height = totalHeight;
            }

            ctx.clearRect(0, 0, cvs.width, cvs.height);
            this.drawFrame(ctx);
            this.rods.forEach(r => r.draw(ctx));
            
            this.onUpdateCallback(this.calculateTotal());
        }

        reset() {
            this.rods.forEach(r => r.reset());
        }
    }

    // --- Interaction Logic ---
    function getBeadAt(x: number, y: number, abacus: Abacus) {
        for (const rod of abacus.rods) {
            for (const bead of rod.beads) {
                if (bead.contains(x, y)) {
                    return bead;
                }
            }
        }
        return null;
    }

    function toggleBead(bead: Bead, abacus: Abacus) {
        if (bead.heaven) {
            if (bead.active) {
                bead.active = false;
                bead.rod.value -= 5;
            } else {
                bead.active = true;
                bead.rod.value += 5;
            }
        } else {
            if (bead.active) {
                bead.active = false;
                bead.rod.value--;
                for (let i = bead.order + 1; i <= 4; i++) {
                     const nextBead = bead.rod.beads.find(b => !b.heaven && b.order === i);
                     if (nextBead && nextBead.active) {
                         nextBead.active = false;
                         nextBead.rod.value--;
                     }
                }
            } else {
                bead.active = true;
                bead.rod.value++;
                for (let i = 1; i < bead.order; i++) {
                     const prevBead = bead.rod.beads.find(b => !b.heaven && b.order === i);
                     if (prevBead && !prevBead.active) {
                         prevBead.active = true;
                         prevBead.rod.value++;
                     }
                }
            }
        }
        
        if (soundEnabled && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
        }
        
        abacus.draw(context, canvas);
    }

    // --- Init ---
    const abacusInstance = new Abacus(numberOfRods, (val) => onUpdate(val));
    
    // Bind ref methods
    engineRef.current.abacus = abacusInstance;
    engineRef.current.reset = () => {
        abacusInstance.reset();
        abacusInstance.draw(context, canvas);
    };
    engineRef.current.setValue = (val: number) => {
        abacusInstance.setValue(val);
        abacusInstance.draw(context, canvas);
    };
    
    // Initial Draw
    abacusInstance.draw(context, canvas);

    // --- Event Listeners ---
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    const handleStart = (e: MouseEvent | TouchEvent) => {
        isDragging = false;
        if ('touches' in e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = (e as MouseEvent).clientX;
            startY = (e as MouseEvent).clientY;
        }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
        let cx, cy;
        if ('touches' in e) {
            cx = e.touches[0].clientX;
            cy = e.touches[0].clientY;
        } else {
            cx = (e as MouseEvent).clientX;
            cy = (e as MouseEvent).clientY;
        }
        if (Math.abs(cx - startX) > 10 || Math.abs(cy - startY) > 10) {
            isDragging = true;
        }
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
        if (isDragging) return; 

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        
        if (e instanceof MouseEvent) {
             clientX = e.clientX;
             clientY = e.clientY;
        } else {
             clientX = startX; 
             clientY = startY;
        }

        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);

        const bead = getBeadAt(x, y, abacusInstance);
        if (bead) {
            if (e.cancelable) e.preventDefault();
            toggleBead(bead, abacusInstance);
        }
    };

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd);

    return () => {
        canvas.removeEventListener('mousedown', handleStart);
        canvas.removeEventListener('mousemove', handleMove);
        canvas.removeEventListener('mouseup', handleEnd);
        canvas.removeEventListener('touchstart', handleStart);
        canvas.removeEventListener('touchmove', handleMove);
        canvas.removeEventListener('touchend', handleEnd);
    };

  }, [numberOfRods, soundEnabled, onUpdate]);

  return (
    <div 
        ref={containerRef} 
        className="w-full overflow-x-auto pb-4 custom-scrollbar bg-white/40 dark:bg-black/20 rounded-2xl border border-gray-200 dark:border-gray-700 min-h-[300px]"
        style={{ touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}
    >
        <audio ref={audioRef} id="beadSound" src="https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3" preload="auto"></audio>
        <canvas 
            ref={canvasRef} 
            className="cursor-pointer select-none max-w-none shadow-sm rounded-lg mx-auto block"
            style={{ touchAction: 'none' }} 
        />
    </div>
  );
});

export default AbacusCanvas;