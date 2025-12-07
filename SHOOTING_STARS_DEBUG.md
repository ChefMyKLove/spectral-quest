# Shooting Stars Animation - Debug Synopsis

## Problem
A shooting stars animation (twinkling stars + shooting stars) was added to `index.html` but is not visible. The console shows no error messages related to the stars script, and none of the expected console.log messages appear (like "⭐ Stars canvas found" or "⭐ Shooting stars animation started").

## Expected Behavior
- 180 twinkling white stars that fade in/out
- Random shooting stars that streak across the screen every 5 seconds
- Stars should appear over the animated background images (rainbow cycling backgrounds)
- Stars should be visible on both splash page (BootScene) and start page (MainMenu)

## Current Implementation

### HTML Structure (index.html)
```html
<!-- Shooting stars overlay -->
<canvas id="stars-canvas"></canvas>

<!-- Game canvas wrapper -->
<div id="game-wrapper">
  <div id="game"></div>
</div>
```

### CSS (index.html, lines ~60-68)
```css
/* Shooting stars overlay - sits above game, below menu */
#stars-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 11;
  pointer-events: none;
  background: transparent;
  display: block;
}

/* Game container sits on top */
#game-wrapper {
  position: relative;
  z-index: 10;
}
```

### JavaScript (index.html, lines ~908-1025)
```javascript
<!-- Shooting Stars Animation -->
<script>
  // Initialize stars animation - try multiple times to ensure it runs
  function initStarsAnimation() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) {
      console.error('⭐ Stars canvas not found!');
      return false;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('⭐ Could not get 2d context!');
      return false;
    }
    
    console.log('⭐ Stars canvas found, initializing animation...');
    
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    }
    
    const stars = [];
    const shootingStars = [];
    
    function initStars() {
      stars.length = 0;
      for (let i = 0; i < 180; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5 + 0.5,
          opacity: Math.random(),
          twinkleSpeed: Math.random() * 0.02 + 0.005
        });
      }
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw twinkling stars
      stars.forEach(s => {
        s.opacity += s.twinkleSpeed;
        if (s.opacity > 1 || s.opacity < 0.2) s.twinkleSpeed *= -1;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life--;
        
        if (s.life <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }
        
        const opacity = s.life / s.maxLife;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'white';
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 10, s.y - s.vy * 10);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.restore();
      }
      
      requestAnimationFrame(draw);
    }
    
    // Random shooting star generation
    setInterval(() => {
      if (Math.random() < 0.25) {
        shootingStars.push({
          x: Math.random() * canvas.width * 0.4,
          y: Math.random() * canvas.height * 0.4,
          vx: Math.random() * 8 + 6,
          vy: Math.random() * 8 + 6,
          life: 50 + Math.random() * 30,
          maxLife: 60
        });
      }
    }, 5000);
    
    console.log('⭐ Shooting stars animation started');
    draw();
    return true;
  }
  
  // Try to initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (!initStarsAnimation()) {
        setTimeout(initStarsAnimation, 100);
      }
    });
  } else {
    if (!initStarsAnimation()) {
      setTimeout(initStarsAnimation, 100);
    }
  }
</script>
```

## Issues to Investigate

1. **Script Not Executing**: No console logs appear, suggesting the script may not be running at all
2. **Canvas Not Found**: The canvas element might not exist when the script runs
3. **Z-Index Conflict**: Phaser game canvas might be covering the stars (game is z-index 10, stars are 11)
4. **Timing Issue**: Script might run before DOM is ready
5. **Phaser Canvas Overlay**: Phaser creates its own canvas which might be covering everything

## Debugging Steps

1. Check if canvas element exists in DOM:
   ```javascript
   console.log('Canvas element:', document.getElementById('stars-canvas'));
   ```

2. Check z-index stacking:
   - Background container: z-index 0
   - Stars canvas: z-index 11
   - Game wrapper: z-index 10
   - Menu overlay: z-index 1000

3. Verify script execution:
   - Add `console.log('Script loaded');` at the very top of the script
   - Check if any console errors appear

4. Test canvas visibility:
   - Temporarily set `background: rgba(255,0,0,0.5)` on `#stars-canvas` to see if it's positioned correctly

5. Check Phaser canvas:
   - Phaser creates a canvas inside `#game` div
   - This canvas might have its own z-index or be covering everything

## Potential Solutions

### Solution 1: Move script to end of body
Place the script tag right before `</body>` to ensure DOM is ready.

### Solution 2: Use window.onload
```javascript
window.addEventListener('load', initStarsAnimation);
```

### Solution 3: Increase z-index further
Try z-index 999 (below menu at 1000) to ensure it's above Phaser.

### Solution 4: Make Phaser canvas transparent
Check if Phaser config has `backgroundColor` that needs to be transparent.

### Solution 5: Integrate into Phaser
Instead of HTML canvas, create stars as Phaser game objects in BootScene and MainMenu.

## Console Output (Current)
- No "⭐" messages appear
- No errors related to stars script
- Phaser initializes successfully
- Background images load successfully

## Next Steps
1. Verify canvas element exists in DOM inspector
2. Check if script tag is being executed
3. Test with temporary visible background color
4. Consider moving to Phaser implementation if HTML canvas approach fails

