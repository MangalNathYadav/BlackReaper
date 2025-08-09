// Kagune animation and visualization system

// Canvas settings
let canvas;
let ctx;
let kagune;
let animationFrame;
let kagneActive = false;

// Kagune types and their properties
const kaguneTypes = {
    rinkaku: {
        color: '#ff3333',
        tentacleCount: 4,
        speed: 2,
        size: 15,
        spread: 180,
        update: updateRinkaku
    },
    ukaku: {
        color: '#ff66ff',
        wingSpan: 300,
        speed: 3,
        size: 10,
        spread: 120,
        update: updateUkaku
    },
    koukaku: {
        color: '#3333ff',
        segments: 5,
        speed: 1,
        size: 20,
        spread: 90,
        update: updateKoukaku
    },
    bikaku: {
        color: '#33cc33',
        length: 400,
        speed: 2.5,
        size: 12,
        segments: 12,
        update: updateBikaku
    }
};

// Initialize kagune animation
function initKagune() {
    // Create canvas if it doesn't exist
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'kagune-canvas';
        canvas.className = 'kagune-animation';
        document.body.appendChild(canvas);
    }
    
    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Get drawing context
    ctx = canvas.getContext('2d');
    
    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Show kagune animation
function showKagune(type = 'rinkaku') {
    // Initialize if not already done
    if (!canvas) {
        initKagune();
    }
    
    // Show canvas
    canvas.style.display = 'block';
    canvas.style.opacity = '1';
    
    // Set kagune type
    const kaguneType = kaguneTypes[type] || kaguneTypes.rinkaku;
    
    // Initialize kagune properties
    kagune = {
        type: type,
        ...kaguneType,
        centerX: canvas.width / 2,
        centerY: canvas.height / 2,
        angle: 0,
        particles: [],
        // Add type-specific properties
        tentacles: [],
        wings: [],
        armor: [],
        tail: []
    };
    
    // Initialize particles based on type
    initializeKaguneParticles();
    
    // Start animation
    if (!kagneActive) {
        kagneActive = true;
        animateKagune();
    }
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        hideKagune();
    }, 4000);
}

// Initialize kagune particles based on type
function initializeKaguneParticles() {
    switch (kagune.type) {
        case 'rinkaku':
            initRinkaku();
            break;
        case 'ukaku':
            initUkaku();
            break;
        case 'koukaku':
            initKoukaku();
            break;
        case 'bikaku':
            initBikaku();
            break;
    }
}

// Initialize Rinkaku (tentacles)
function initRinkaku() {
    kagune.tentacles = [];
    
    for (let i = 0; i < kagune.tentacleCount; i++) {
        const angle = (i / kagune.tentacleCount) * kagune.spread * (Math.PI / 180);
        const tentacle = {
            segments: [],
            baseAngle: angle,
            currentAngle: angle,
            length: 150 + Math.random() * 100
        };
        
        // Create segments for each tentacle
        for (let j = 0; j < 20; j++) {
            tentacle.segments.push({
                x: kagune.centerX,
                y: kagune.centerY,
                size: kagune.size * (1 - j / 25)
            });
        }
        
        kagune.tentacles.push(tentacle);
    }
}

// Initialize Ukaku (wings)
function initUkaku() {
    kagune.wings = [];
    
    // Create left and right wings
    for (let side = -1; side <= 1; side += 2) {
        if (side === 0) continue; // Skip center
        
        const wing = {
            side: side, // -1 for left, 1 for right
            particles: [],
            baseAngle: side === -1 ? Math.PI / 6 : Math.PI - Math.PI / 6,
            spread: kagune.spread * (Math.PI / 180)
        };
        
        // Add particles for each wing
        for (let i = 0; i < 60; i++) {
            const distance = Math.random() * kagune.wingSpan;
            const angleVariation = (Math.random() - 0.5) * wing.spread;
            const angle = wing.baseAngle + angleVariation;
            
            wing.particles.push({
                x: kagune.centerX + Math.cos(angle) * distance * side,
                y: kagune.centerY + Math.sin(angle) * distance,
                size: kagune.size * (Math.random() * 0.8 + 0.2),
                angle: angle,
                speed: kagune.speed * (Math.random() * 0.5 + 0.8),
                alpha: Math.random() * 0.7 + 0.3
            });
        }
        
        kagune.wings.push(wing);
    }
}

// Initialize Koukaku (armor)
function initKoukaku() {
    kagune.armor = [];
    
    // Create armor plates
    for (let i = 0; i < kagune.segments; i++) {
        const segment = {
            angle: (i / kagune.segments) * kagune.spread * (Math.PI / 180),
            distance: 80 + i * 30,
            width: 100 - i * 10,
            height: 60 - i * 5,
            rotation: i * 0.2
        };
        
        kagune.armor.push(segment);
    }
}

// Initialize Bikaku (tail)
function initBikaku() {
    kagune.tail = [];
    
    // Create tail segments
    for (let i = 0; i < kagune.segments; i++) {
        const segment = {
            x: kagune.centerX,
            y: kagune.centerY + i * (kagune.length / kagune.segments),
            size: kagune.size * (1 - i / kagune.segments * 0.7),
            angle: Math.PI / 2 // Start pointing down
        };
        
        kagune.tail.push(segment);
    }
}

// Animate kagune
function animateKagune() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw kagune
    kagune.update(kagune);
    
    // Continue animation loop if active
    if (kagneActive) {
        animationFrame = requestAnimationFrame(animateKagune);
    }
}

// Update Rinkaku tentacles
function updateRinkaku(kagune) {
    ctx.fillStyle = kagune.color;
    
    // Update each tentacle
    kagune.tentacles.forEach(tentacle => {
        // Update angle with some waviness
        tentacle.currentAngle = tentacle.baseAngle + Math.sin(kagune.angle * 0.8) * 0.3;
        
        // Calculate first segment position
        const firstX = kagune.centerX + Math.cos(tentacle.currentAngle) * 30;
        const firstY = kagune.centerY + Math.sin(tentacle.currentAngle) * 30;
        
        tentacle.segments[0].x = firstX;
        tentacle.segments[0].y = firstY;
        
        // Update remaining segments with delay
        for (let i = 1; i < tentacle.segments.length; i++) {
            const prevSeg = tentacle.segments[i - 1];
            const currSeg = tentacle.segments[i];
            
            // Add some waviness to the tentacle
            const waveX = Math.sin(kagune.angle * 0.5 + i * 0.2) * i * 0.5;
            const waveY = Math.cos(kagune.angle * 0.5 + i * 0.2) * i * 0.5;
            
            // Calculate direction from previous segment
            const dx = prevSeg.x - currSeg.x;
            const dy = prevSeg.y - currSeg.y;
            
            // Normalize and scale by segment spacing
            const dist = Math.sqrt(dx * dx + dy * dy);
            const spacing = 8;
            
            if (dist > 0) {
                currSeg.x = prevSeg.x - (dx / dist) * spacing + waveX;
                currSeg.y = prevSeg.y - (dy / dist) * spacing + waveY;
            }
            
            // Draw segment
            ctx.beginPath();
            ctx.arc(currSeg.x, currSeg.y, currSeg.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Update angle for animation
    kagune.angle += 0.05;
}

// Update Ukaku wings
function updateUkaku(kagune) {
    // Update each wing
    kagune.wings.forEach(wing => {
        wing.particles.forEach(particle => {
            // Add fluttering effect
            particle.angle += (Math.random() - 0.5) * 0.1;
            
            // Update position with some randomness for shimmer effect
            particle.x += Math.cos(particle.angle) * particle.speed * wing.side;
            particle.y += Math.sin(particle.angle) * particle.speed;
            
            // Draw particle
            ctx.fillStyle = `rgba(${parseInt(kagune.color.slice(1, 3), 16)}, 
                              ${parseInt(kagune.color.slice(3, 5), 16)}, 
                              ${parseInt(kagune.color.slice(5, 7), 16)}, 
                              ${particle.alpha})`;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    });
    
    // Update angle for animation
    kagune.angle += 0.03;
}

// Update Koukaku armor
function updateKoukaku(kagune) {
    ctx.fillStyle = kagune.color;
    
    // Update each armor plate
    kagune.armor.forEach((segment, index) => {
        // Calculate position with some movement
        const wobble = Math.sin(kagune.angle + index * 0.5) * 10;
        const x = kagune.centerX + Math.cos(segment.angle) * segment.distance + wobble;
        const y = kagune.centerY + Math.sin(segment.angle) * segment.distance;
        
        // Save context for rotation
        ctx.save();
        
        // Translate and rotate
        ctx.translate(x, y);
        ctx.rotate(segment.angle + segment.rotation + Math.sin(kagune.angle * 0.5) * 0.2);
        
        // Draw plate
        ctx.beginPath();
        ctx.roundRect(-segment.width / 2, -segment.height / 2, segment.width, segment.height, 10);
        ctx.fill();
        
        // Restore context
        ctx.restore();
    });
    
    // Update angle for animation
    kagune.angle += 0.02;
}

// Update Bikaku tail
function updateBikaku(kagune) {
    ctx.fillStyle = kagune.color;
    
    // Update first segment position
    const firstSeg = kagune.tail[0];
    firstSeg.angle = Math.PI / 2 + Math.sin(kagune.angle) * 0.5;
    
    // Update all segments
    for (let i = 0; i < kagune.tail.length; i++) {
        const segment = kagune.tail[i];
        
        if (i === 0) {
            // First segment stays at center
            segment.x = kagune.centerX;
            segment.y = kagune.centerY;
        } else {
            const prevSeg = kagune.tail[i - 1];
            // Wave propagation along tail
            const angleOffset = Math.sin(kagune.angle - i * 0.2) * 0.2;
            segment.angle = prevSeg.angle + angleOffset;
            
            // Calculate position based on previous segment
            const spacing = 15;
            segment.x = prevSeg.x + Math.cos(segment.angle) * spacing;
            segment.y = prevSeg.y + Math.sin(segment.angle) * spacing;
        }
        
        // Draw segment
        ctx.beginPath();
        ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Update angle for animation
    kagune.angle += 0.1;
}

// Hide kagune animation
function hideKagune() {
    if (canvas) {
        canvas.style.opacity = '0';
        
        setTimeout(() => {
            canvas.style.display = 'none';
            kagneActive = false;
            cancelAnimationFrame(animationFrame);
        }, 500);
    }
}

// Trigger kagune animation on specific events
function setupKaguneEvents() {
    // Show Rinkaku when switching to ghoul mode
    document.addEventListener('ghoulModeActivated', () => {
        showKagune('rinkaku');
    });
    
    // Show Ukaku when completing tasks
    document.addEventListener('taskCompleted', () => {
        showKagune('ukaku');
    });
    
    // Show Koukaku when journal is saved
    document.addEventListener('journalSaved', () => {
        showKagune('koukaku');
    });
    
    // Show Bikaku when reaching max RC level
    document.addEventListener('maxRCLevel', () => {
        showKagune('bikaku');
    });
}

// Initialize kagune system
document.addEventListener('DOMContentLoaded', () => {
    initKagune();
    setupKaguneEvents();
    
    // Add CSS for kagune canvas
    const style = document.createElement('style');
    style.textContent = `
        .kagune-animation {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.5s ease;
        }
    `;
    document.head.appendChild(style);
});

// Export functions for use in other scripts
window.KaguneSystem = {
    showKagune,
    hideKagune
};
