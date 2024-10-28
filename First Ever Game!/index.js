// Set up canvas
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

// HTML Elements
const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const gameOverEl = document.querySelector('#gameOverEl');
const bigScoreEl = document.querySelector('#bigScoreEl');


// Classes
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

const friction = 0.98;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

// Game variables
const x = canvas.width / 2;
const y = canvas.height / 2;
let player = new Player(x, y, 10, 'white');
let projectiles = [];
let enemies = [];
let particles = [];
let animationId;
let score = 0;

// Initialize game
function init() {
    player = new Player(x, y, 10, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}

let playingGame = false;
let enemyInt
let speedFactor
let baseSpeed
let speedRandom

function getEnemySpeed(score){
    baseSpeed = 1
    if(score > 50000){
        baseSpeed *= Math.random() < 0.4 ? 5 : 3
    }
    else if (score > 40000){
        baseSpeed *= Math.random() < 0.4 ? 5 : 2.5
    }
    else if (score > 30000){
        baseSpeed *= Math.random() < 0.2 ? 5 : 2.5
    }
    else if (score > 15000){
        baseSpeed *= Math.random() < 0.6 ? 2.5 : 1
    }
    else if(score > 8000){
        baseSpeed *= Math.random() < 0.4 ? 2 : 1
    }
    else if(score > 3000){
        baseSpeed *= Math.random() < 0.2 ? 2 : 1
    }
    return baseSpeed


}


// Spawn enemies
function spawnEnemies() {
    if (playingGame == true) {
        

        enemyInt = setInterval(() => {
            const radius = Math.random() * (30 - 4) + 4;
            let x, y;
            let velocity
            let fastSpeed
            //let velocity

            if (Math.random() > 0.5) {
                x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
                y = Math.random() * canvas.height;
            } else {
                y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
                x = Math.random() * canvas.width;
            }

            const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
            const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
            
            speedFactor = getEnemySpeed(score)
            velocity = {
                x: Math.cos(angle) * speedFactor,
                y: Math.sin(angle) * speedFactor
            }
            
            enemies.push(new Enemy(x, y, radius, color, velocity));
            //console.log("Enemy Created")
            //console.log(speedFactor)
            console.log(speedFactor)
        }, 1000);
    }

}

// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            clearInterval(enemyInt)
            playingGame = true
        }
        else if (playingGame == true && gameOver == false) {
            spawnEnemies()
            playingGame = false
        }
    })



    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();

        // Remove projectiles that are off-screen
        if (
            projectile.x + projectile.radius < 0 ||
            projectile.y + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y - projectile.radius > canvas.height
        ) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
    });

    let gameOver = true

    enemies.forEach((enemy, index) => {
        enemy.update();

        // End game if enemy collides with player
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1) {
            clearInterval(enemyInt)
            cancelAnimationFrame(animationId);
            bigScoreEl.innerHTML = score;
            gameOverEl.style.display = 'flex';
            gameOver = true
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            // Projectile hits enemy
            if (dist - enemy.radius - projectile.radius < 1) {
                // Spawn particles
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(
                        new Particle(
                            projectile.x,
                            projectile.y,
                            Math.random() * 2,
                            enemy.color,
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 8),
                                y: (Math.random() - 0.5) * (Math.random() * 8)
                            }
                        )
                    );
                }

                // Shrink enemy or remove it
                if (enemy.radius > 20) {
                    score += 100;
                    scoreEl.innerHTML = score;
                    gsap.to(enemy, { radius: enemy.radius - 10 });
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                } else {
                    score += 250;
                    scoreEl.innerHTML = score;
                    setTimeout(() => {
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }
            }
        });
    });
}

// Fire projectiles on click
addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - y, event.clientX - x);
    const velocity = {
        x: Math.cos(angle) * 8,
        y: Math.sin(angle) * 8
    };
    projectiles.push(new Projectile(x, y, 5, 'white', velocity));
});

// Start game
startGameBtn.addEventListener('click', () => {
    playingGame = true
    init()
    animate()
    spawnEnemies()
    gameOverEl.style.display = 'none'
    gameOver = false;
});