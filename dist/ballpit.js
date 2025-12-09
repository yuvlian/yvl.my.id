(function () {
    const BALL_COLORS = ['#ff7b7b', '#ffd47f', '#7bf0a1', '#7bdcff', '#c9a7ff', '#ffd0f0', '#f6ff7b'];

    const MATTER_LABEL = {
        WALL: 'Wall',
        BIG_BALL: 'BigBall',
        PEG: 'Peg',
        BALL: 'Ball'
    };

    const TEXT = {
        TOGGLE_PAUSE: 'za warudo',
        TOGGLE_RESUME: 'pass time',
        CLEAR: 'clear LeBalls',
        ADD_BIG: 'big ball :tm:',
        RESET_PEGS: 'reset pegs',
        GRAVITY: 'gravity:',
        RESTITUTION: 'restitution:',
        RATE: 'balls per sec:',
        NOTE: 'click 4 ball, hold click 4 drag, big ball kill pegs'
    };

    const CONFIG = {
        MIN_WIDTH: 600,
        MIN_HEIGHT: 400,
        WALL_THICKNESS: 60,
        PEG_ROWS: 8,
        PEG_PADDING: 30,
        PEG_RADIUS: 6,
        PEG_DESIRED_SPACING: 60,
        PEG_SPACING_Y: 50,
        PEG_START_Y: 100,
        PEG_HEALTH: 100,
        PEG_DAMAGE_RESISTANCE: 5,
        RUNNER_DELTA: 1000 / 90,
        ENGINE_POSITION_ITER: 12,
        ENGINE_VELOCITY_ITER: 8,
        ENGINE_CONSTRAINT_ITER: 12,
        MOUSE_TIMER_DELAY: 200
    };

    const { Engine, Render, Runner, World, Bodies, Body, Events, Composite, Mouse, MouseConstraint, Query } = Matter;

    const state = {
        engine: null,
        render: null,
        runner: null,
        walls: [],
        pegs: [],
        mouse: null,
        mouseConstraint: null,
        isDragging: false,
        mouseTimer: null,
        spawnRate: 0,
        lastSpawn: 0,
        currentWidth: 0,
        currentHeight: 0,
        pegSpacingX: 0
    };

    function initializeUI() {
        document.getElementById('toggle').textContent = TEXT.TOGGLE_PAUSE;
        document.getElementById('clear').textContent = TEXT.CLEAR;
        document.getElementById('addBig').textContent = TEXT.ADD_BIG;
        document.getElementById('resetPegs').textContent = TEXT.RESET_PEGS;
        document.getElementById('note').textContent = TEXT.NOTE;
        document.getElementById('label-gravity').insertAdjacentHTML('afterbegin', TEXT.GRAVITY);
        document.getElementById('label-rest').insertAdjacentHTML('afterbegin', TEXT.RESTITUTION);
        document.getElementById('label-rate').insertAdjacentHTML('afterbegin', TEXT.RATE);
    }

    function initializeEngine() {
        state.currentWidth = Math.max(window.innerWidth, CONFIG.MIN_WIDTH);
        state.currentHeight = Math.max(window.innerHeight, CONFIG.MIN_HEIGHT);

        state.engine = Engine.create();
        state.engine.positionIterations = CONFIG.ENGINE_POSITION_ITER;
        state.engine.velocityIterations = CONFIG.ENGINE_VELOCITY_ITER;
        state.engine.constraintIterations = CONFIG.ENGINE_CONSTRAINT_ITER;

        const holder = document.getElementById('canvas-holder');
        state.render = Render.create({
            element: holder,
            engine: state.engine,
            options: {
                width: state.currentWidth,
                height: state.currentHeight,
                wireframes: false,
                background: '#f6fbff'
            }
        });

        Render.run(state.render);
        state.runner = Runner.create();
        state.runner.delta = CONFIG.RUNNER_DELTA;
        Runner.run(state.runner, state.engine);
    }

    function createWalls(w, h) {
        World.remove(state.engine.world, state.walls);
        const thickness = CONFIG.WALL_THICKNESS;
        state.walls = [
            Bodies.rectangle(w / 2, h + thickness / 2, w, thickness, {
                isStatic: true,
                label: MATTER_LABEL.WALL,
                render: { fillStyle: '#7b8ea1' },
                collisionFilter: { group: 0 }
            }),
            Bodies.rectangle(w / 2, -thickness / 2, w, thickness, {
                isStatic: true,
                label: MATTER_LABEL.WALL,
                render: { visible: false },
                collisionFilter: { group: 0 }
            }),
            Bodies.rectangle(-thickness / 2, h / 2, thickness, h, {
                isStatic: true,
                label: MATTER_LABEL.WALL,
                render: { fillStyle: '#7b8ea1' },
                collisionFilter: { group: 0 }
            }),
            Bodies.rectangle(w + thickness / 2, h / 2, thickness, h, {
                isStatic: true,
                label: MATTER_LABEL.WALL,
                render: { fillStyle: '#7b8ea1' },
                collisionFilter: { group: 0 }
            })
        ];
        World.add(state.engine.world, state.walls);
    }

    function createPegs(w, h) {
        World.remove(state.engine.world, state.pegs);
        state.pegs = [];

        const desiredSpacing = CONFIG.PEG_DESIRED_SPACING;
        const innerWidth = w - CONFIG.PEG_PADDING * 2;

        const numCols = Math.floor(innerWidth / desiredSpacing) + 1;

        state.pegSpacingX = innerWidth / (numCols - 1);

        const startX = CONFIG.PEG_PADDING;

        for (let r = 0; r < CONFIG.PEG_ROWS; r++) {
            const isEvenRow = r % 2 === 0;
            const rowOffset = isEvenRow ? 0 : state.pegSpacingX / 2;

            for (let c = 0; c < numCols; c++) {
                const x = startX + c * state.pegSpacingX + rowOffset;
                const y = CONFIG.PEG_START_Y + r * CONFIG.PEG_SPACING_Y;

                if (x < w - CONFIG.PEG_PADDING + CONFIG.PEG_RADIUS && y < h - 100) {
                    const peg = Bodies.circle(x, y, CONFIG.PEG_RADIUS, {
                        isStatic: true,
                        friction: 0.05,
                        label: MATTER_LABEL.PEG,
                        collisionFilter: { group: 0 }
                    });
                    peg.health = CONFIG.PEG_HEALTH;
                    peg.damageResistance = CONFIG.PEG_DAMAGE_RESISTANCE;
                    state.pegs.push(peg);
                }
            }
        }
        World.add(state.engine.world, state.pegs);
    }

    function setupMouse() {
        state.mouse = Mouse.create(state.render.canvas);
        state.mouseConstraint = MouseConstraint.create(state.engine, {
            mouse: state.mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false },
                angularStiffness: 0
            }
        });

        World.add(state.engine.world, state.mouseConstraint);
        state.render.mouse = state.mouse;
    }

    function setupMouseEvents() {
        Events.on(state.mouseConstraint, 'startdrag', function (event) {
            if (event.body) {
                state.isDragging = true;
                clearTimeout(state.mouseTimer);
            }
        });

        Events.on(state.mouseConstraint, 'enddrag', function (event) {
            if (event.body) {
                const body = event.body;
                const speed = Vector.magnitude(body.velocity);

                if (speed > 15) {
                    const limitedVelocity = Vector.mult(Vector.normalise(body.velocity), 15);
                    Body.setVelocity(body, limitedVelocity);
                }

                Body.setAngularVelocity(body, 0);
            }
        });

        state.render.canvas.addEventListener('mousedown', function (e) {
            state.isDragging = false;
            clearTimeout(state.mouseTimer);
            const hitBody = Query.point(Composite.allBodies(state.engine.world), {
                x: e.offsetX,
                y: e.offsetY
            }).find(b => !b.isStatic);

            if (!hitBody) {
                state.mouseTimer = setTimeout(() => {
                    clearTimeout(state.mouseTimer);
                }, CONFIG.MOUSE_TIMER_DELAY);
            }
        });

        state.render.canvas.addEventListener('mouseup', function (e) {
            if (!state.mouseConstraint.body && state.mouseTimer) {
                clearTimeout(state.mouseTimer);
                const rect = state.render.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                createBall(x, y, 12 + Math.random() * 16);
            }
            state.mouseConstraint.body = null;
        });
    }

    function randColor() {
        return BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
    }

    function createBall(x, y, r = 14, options = {}) {
        const ball = Bodies.circle(x, y, r, Object.assign({
            restitution: parseFloat(document.getElementById('rest').value),
            friction: 0.02,
            density: 0.001 + r * 0.0005,
            label: MATTER_LABEL.BALL,
            render: { fillStyle: randColor() },
            collisionFilter: { group: 0 }
        }, options));
        World.add(state.engine.world, ball);
        return ball;
    }

    function startSpawnLoop() {
        state.lastSpawn = performance.now();

        function spawnLoop(time) {
            const now = time || performance.now();
            const isPaused = document.getElementById('toggle').getAttribute('data-paused') === 'true';

            if (state.spawnRate > 0 && !isPaused) {
                const interval = 1000 / state.spawnRate;
                if (now - state.lastSpawn > interval) {
                    const x = 40 + Math.random() * (state.currentWidth - 80);
                    createBall(x, -5, 10 + Math.random() * 12);
                    state.lastSpawn = now;
                }
            }
            requestAnimationFrame(spawnLoop);
        }
        requestAnimationFrame(spawnLoop);
    }

    function updateSliderValue(input, output) {
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const val = parseFloat(input.value);
        const percentage = (val - min) / (max - min);
        const decimals = input.step.includes('.') ? input.step.length - 2 : 0;
        output.textContent = val.toFixed(decimals);
        output.style.left = `${percentage * 100}%`;
    }

    function setupControls() {
        const gravSlider = document.getElementById('gravity');
        const gravVal = document.getElementById('gravVal');
        gravSlider.addEventListener('input', function () {
            state.engine.world.gravity.y = parseFloat(this.value);
            updateSliderValue(this, gravVal);
        });
        gravSlider.value = state.engine.world.gravity.y;
        updateSliderValue(gravSlider, gravVal);

        const restSlider = document.getElementById('rest');
        const restVal = document.getElementById('restVal');
        restSlider.addEventListener('input', function () {
            updateSliderValue(this, restVal);
        });
        updateSliderValue(restSlider, restVal);

        const rateSlider = document.getElementById('rate');
        const rateVal = document.getElementById('rateVal');
        rateSlider.addEventListener('input', function () {
            state.spawnRate = parseInt(this.value, 10);
            updateSliderValue(this, rateVal);
        });
        state.spawnRate = parseInt(rateSlider.value, 10);
        updateSliderValue(rateSlider, rateVal);

        const toggleBtn = document.getElementById('toggle');
        toggleBtn.addEventListener('click', function () {
            const isPaused = toggleBtn.getAttribute('data-paused') === 'true';
            if (!isPaused) {
                Runner.stop(state.runner);
                this.textContent = TEXT.TOGGLE_RESUME;
                toggleBtn.setAttribute('data-paused', 'true');
            } else {
                Runner.run(state.runner, state.engine);
                this.textContent = TEXT.TOGGLE_PAUSE;
                toggleBtn.setAttribute('data-paused', 'false');
            }
        });

        document.getElementById('clear').addEventListener('click', function () {
            const toRemove = Composite.allBodies(state.engine.world).filter(
                b => !b.isStatic && b.label !== MATTER_LABEL.PEG
            );
            World.remove(state.engine.world, toRemove);
        });

        document.getElementById('addBig').addEventListener('click', function () {
            createBall(state.currentWidth / 2, 20, 40, {
                restitution: 0.05,
                label: MATTER_LABEL.BIG_BALL,
                collisionFilter: { group: 0 },
                render: { fillStyle: randColor() }
            });
        });

        document.getElementById('resetPegs').addEventListener('click', function () {
            createPegs(state.currentWidth, state.currentHeight);
        });

        const controlsDiv = document.getElementById('controls');
        const minimizeBtn = document.getElementById('minimize-btn');
        minimizeBtn.addEventListener('click', function () {
            const isMinimized = controlsDiv.classList.toggle('minimized');
            minimizeBtn.textContent = isMinimized ? '☐' : '_';
            minimizeBtn.title = isMinimized ? TEXT.TOGGLE_RESUME : TEXT.TOGGLE_PAUSE;
        });
    }

    function setupWindowResize() {
        window.addEventListener('resize', function () {
            const w = Math.max(window.innerWidth, CONFIG.MIN_WIDTH);
            const h = Math.max(window.innerHeight, CONFIG.MIN_HEIGHT);

            state.render.options.width = w;
            state.render.options.height = h;
            state.render.canvas.width = w;
            state.render.canvas.height = h;

            createWalls(w, h);
            createPegs(w, h);

            state.currentWidth = w;
            state.currentHeight = h;

            Mouse.setOffset(state.mouse, { x: 0, y: 0 });
            Mouse.setScale(state.mouse, { x: 1, y: 1 });

            updateSliderValue(document.getElementById('gravity'), document.getElementById('gravVal'));
            updateSliderValue(document.getElementById('rest'), document.getElementById('restVal'));
            updateSliderValue(document.getElementById('rate'), document.getElementById('rateVal'));
        });
    }

    function setupCollisionHandling() {
        Events.on(state.engine, "collisionStart", function (event) {
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;
                let ball = null;
                let peg = null;

                if (bodyB.label === MATTER_LABEL.PEG && bodyA.label === MATTER_LABEL.BIG_BALL) {
                    ball = bodyA;
                    peg = bodyB;
                } else if (bodyA.label === MATTER_LABEL.PEG && bodyB.label === MATTER_LABEL.BIG_BALL) {
                    ball = bodyB;
                    peg = bodyA;
                } else {
                    return;
                }

                if (!peg.isStatic) return;

                peg.health = 0;
                if (peg.health <= 0) {
                    Body.setStatic(peg, false);
                    Body.setAngularVelocity(peg, Math.random() * 0.1 - 0.05);
                }
            });
        });

        Events.on(state.engine, 'beforeUpdate', function () {
            const draggedBody = state.mouseConstraint.body;
            if (draggedBody && draggedBody.label === MATTER_LABEL.BIG_BALL) {
                const staticPegs = state.pegs.filter(p => p.isStatic);
                const collidingPegs = Matter.Query.collides(draggedBody, staticPegs);

                collidingPegs.forEach(collision => {
                    const peg = collision.bodyA.label === MATTER_LABEL.PEG
                        ? collision.bodyA
                        : collision.bodyB;

                    if (peg.isStatic) {
                        peg.health = 0;
                        Body.setStatic(peg, false);
                        Body.setAngularVelocity(peg, Math.random() * 0.1 - 0.05);
                    }
                });
            }
        });
    }

    function initialize() {
        initializeUI();
        initializeEngine();
        createWalls(state.currentWidth, state.currentHeight);
        createPegs(state.currentWidth, state.currentHeight);
        setupMouse();
        setupMouseEvents();
        setupControls();
        setupWindowResize();
        setupCollisionHandling();
        startSpawnLoop();
    }

    initialize();
})();
