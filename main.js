function gol(parent, init={}) {
    const width = init.width || 800,
          height = init.height || 600,
          html = {
              canvas: l.canvas({ width: width, height: height }),
              delayInput: l.input({ type: 'range', min: 3, max: 2000, value: 200 }),
              sizeInput:  l.input({ type: 'range', min: 2, max: 100, value: 20, onchange: changeSize }),
              loopButton: l.button('Start Loop', { onclick: () => toggleLoop() }),
              nextGenButton: l.button('Next Generation', { onclick: runGeneration }),
              clearButton: l.button('Clear', { onclick: clearCells }),
              saveButton: l.button('Save', { onclick: save }),
              loadButton: l.button('Load', { onclick: () => load()}),
              prefabSelect: l.select(Object.keys(prefabs).map(key => l.option(key, { value: key }))),
              loadPrefabButton: l.button('Load Prefab', { onclick: loadPrefab }),
              generationCounter: l.label('0'),
              modeButton: l.button('Pan', { onclick: toggleDragMode }),
              toggleGridButton: l.button('Hide Grid', { onclick: () => toggleGrid() }),
              eraserButton: l.button('Eraser', { onclick: () => toggleEraser() }),
              xInput: l.input({ type: 'number', value: 100, onchange: setNX, max: 1000, min: 1 }),
              yInput: l.input({ type: 'number', value: 100, onchange: setNY, max: 1000, min: 1 }),
          },
          ctx = html.canvas.getContext('2d');

    let settings = {
        squareSize: 20,
        showGrid: true,
        nx: 50,
        ny: 50,
        loopIsRunning: false,
        generationCount: 0,
        cells: [],
        startX: 0, // x translation
        startY: 0 // y translation
    };

    l(parent, l.with(html, () => div(
        canvas,
        div({ class: 'gol-settings' },
            div(
                nextGenButton,
                loopButton,
                label('Fast', { style: { paddingLeft: '10px' }}),
                delayInput,
                label('Slow', { style: { paddingRight: '10px' }}),
                label('Far'),
                sizeInput,
                label('Near', { style: { paddingRight: '10px' }}),
                modeButton,
                toggleGridButton,
                eraserButton,
            ),
            div(
                label('Size (X):'),
                xInput,
                label('Size (Y):', { style: { paddingLeft: '10px' }}),
                yInput,
            ),
            div(
                prefabSelect,
                loadPrefabButton,
            ),
            div(
                clearButton,
                saveButton,
                loadButton,
            ),
            div(
                label('Generation #'),
                generationCounter,
            ),
           )
    )));

    load();

    // performance can be greatly improved
    // if the board is cut into halfs and only look
    // in the halfs where "v" could be (quadtree)
    function getClosestCell(v) {
        let closest = [0, 0],
            closestDistance = Infinity;
        for (let i=0; i<settings.nx; ++i) {
            for (let j=0; j<settings.ny; ++j) {
                const x = i - settings.startX;
                const y = j - settings.startY;
                const pos = new Vec2(((x*settings.squareSize) + settings.squareSize/2), ((y*settings.squareSize) + settings.squareSize/2));
                let d = Vec2.distance(v, pos);
                if (d < closestDistance) {
                    closest = [i, j];
                    closestDistance = d;
                }
            }
        }

        return closest;
    }

    function createCells() {
        const cells = [];
        for (let i=0; i<settings.nx; ++i) {
            const row = [];
            for (let j=0; j<settings.ny; ++j) {
                row.push(0);
            }
            cells.push(row);
        }
        return cells;
    }

    function render() {
        ctx.clearRect(0, 0, html.canvas.width, html.canvas.height);
        const width = html.canvas.width/settings.squareSize,
              height = html.canvas.height/settings.squareSize;
        
        for (let i=0; i<width; ++i) {
            for (let j=0; j<height; ++j) {
                ctx.beginPath();
                ctx.rect(i*settings.squareSize, j*settings.squareSize, settings.squareSize, settings.squareSize);
                const x = i + settings.startX;
                const y = j + settings.startY;
                if (x >= settings.cells.length || y >= settings.cells[0].length || x < 0 || y < 0) {
                } else if (settings.cells[x][y]) {
                    ctx.fill();
                } else {
                    if (settings.showGrid) {
                        ctx.stroke();
                    }
                }
                ctx.closePath();
            }
        }
    }

    function get(i, j) {
        if (i < 0 || j < 0 || i >= settings.nx || j >= settings.ny) {
            return 0;
        }
        return settings.cells[i][j];
    }

    function getNeighbors(i, j) {
        return [
            get(i-1, j),
            get(i-1, j-1),
            get(i-1, j+1),
            get(i, j-1),
            get(i, j+1),
            get(i+1, j-1),
            get(i+1, j),
            get(i+1, j+1)
        ];
    }

    function runGeneration() {
        const newCells = [];
        for (let i=0; i<settings.nx; ++i) {
            const row = [];
            for (let j=0; j<settings.ny; ++j) {
                const neighbors = getNeighbors(i, j);
                const sum = neighbors.reduce((a, b) => a + b, 0);
                if (settings.cells[i][j]) {
                    if (sum < 2 || sum > 3) {
                        row.push(0);
                    } else {
                        row.push(1);
                    }
                } else {
                    if (sum === 3) {
                        row.push(1);
                    } else {
                        row.push(0);
                    }
                }
            }
            newCells.push(row);
        }

        setGenerationCount(settings.generationCount+1);
        settings.cells = newCells;
        render();
    }

    function save() {
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    function clearCells() {
        settings.cells = createCells();
        setGenerationCount(0);
        settings.loopIsRunning = false;
        render();
    }

    function printSave() {
        console.log(localStorage.getItem('settings'));
    }

    function load(item=null) {
        if (item === null) {
            item = localStorage.getItem('settings');
            if (item) {
                settings = JSON.parse(item);
            } else {
                settings.cells = createCells();
            }
        } else {
            settings = Object.assign({}, item);
        }
        
        html.xInput.value = settings.nx;
        html.yInput.value = settings.ny;
        toggleLoop(settings.loopIsRunning);
        toggleGrid(settings.showGrid);
        html.sizeInput.value = settings.squareSize;
        setGenerationCount(settings.generationCount);
        
        render();
    }
    
    let mouseDown = false,
        mouseDownPos = null,
        dragged = false,
        mousePos = new Vec2(0, 0),
        dMousePos = new Vec2(0, 0),
        dragMode = false,
        eraserMode = false;

    function handleClick(e, toggle) {
        const pos = getRelativePosition(e);
        const [i, j] = getClosestCell(pos);
        if (i >= settings.cells.length || j >= settings.cells[0].length) {
            
        } else {
            if (toggle) {
                settings.cells[i][j] = settings.cells[i][j] === 0 ? 1 : 0;
            } else {
                settings.cells[i][j] = eraserMode ? 0 : 1;
            }
        }
        setGenerationCount(0);
        render();
    }

    html.canvas.addEventListener('mousedown', function (e) {
        mouseDown = true;
        mouseDownPos = getRelativePosition(e);
    });

    html.canvas.addEventListener('mouseup', function (e) {
        if (!dragMode && !dragged) {
            handleClick(e, true);
        }

        mouseDown = false;
        dragged = false;
        mouseDownPos = null;
        dMousePos = new Vec2(0, 0);
    });

    window.addEventListener('wheel', function (e) {
        let v = new Vec2(-e.deltaX, -e.deltaY);
        v = v.divScalar(100);
        const size = +html.sizeInput.value;
        html.sizeInput.value = size + v.y;
        html.sizeInput.onchange();
    });

    html.canvas.addEventListener('mousemove', function (e) {
        const currentMousePos = getRelativePosition(e);
        const _dMousePos = (currentMousePos.sub(mousePos).mulScalar(-1).minMax(20)).add(dMousePos);
        mousePos = currentMousePos;
        if (mouseDown) {
            if (dragMode) {
                dMousePos = _dMousePos;
                if (Math.abs(dMousePos.x) >= settings.squareSize) {
                    const diffX = Math.floor(dMousePos.x/settings.squareSize);
                    settings.startX = Math.min(settings.nx, Math.max(Math.round(html.canvas.width/-settings.squareSize), diffX + settings.startX));
                    dMousePos.x = 0;
                }
                if (Math.abs(dMousePos.y) >= settings.squareSize) {
                    const diffY = Math.floor(dMousePos.y/settings.squareSize);
                    settings.startY = Math.min(settings.ny, Math.max(Math.round(html.canvas.height/-settings.squareSize), diffY + settings.startY));
                    dMousePos.y = 0;
                }
                render();
            } else {
                if (mouseDownPos.sub(mousePos).hyp() > 5) {
                    dragged = true;
                    handleClick(e, false);
                }
            }
        }
    });

    function getRelativePosition(e) {
        var rect = html.canvas.getBoundingClientRect();
        return new Vec2(e.clientX - rect.left, e.clientY - rect.top);
    }

    function resize(mat, x, y) {
        const resized = [];
        for (let i=0; i<x; ++i) {
            const rows = [];
            for (let j=0; j<y; ++j) {
                if (i < mat.length && j < mat[i].length) {
                    rows.push(mat[i][j]);
                } else {
                    rows.push(0);
                }
            }
            resized.push(rows);
        }
        return resized;
    }

    function toggleLoop(force=null) {
        settings.loopIsRunning = force === null ? !settings.loopIsRunning : force;
        if (settings.loopIsRunning) {
            loop();
            html.loopButton.innerText = 'Stop Loop';
        } else {
            html.loopButton.innerText = 'Start Loop';
        }
    }

    function toggleGrid(force=null) {
        if (force === null) {
            settings.showGrid = !settings.showGrid;
        } else {
            settings.showGrid = force;
        }
        if (settings.showGrid) {
            html.toggleGridButton.innerText = 'Hide Grid';
        } else {
            html.toggleGridButton.innerText = 'Show Grid';
        }
        render();
    }

    function loadPrefab() {
        setGenerationCount(0);
        load(prefabs[html.prefabSelect.value]);
    }

    function changeSize() {
        settings.squareSize = +html.sizeInput.value;
        render();
    }

    function setGenerationCount(gc) {
        settings.generationCount = gc;
        html.generationCounter.innerText = settings.generationCount;
    }

    function setNX() {
        settings.nx = Math.max(1, Math.min(1000, +html.xInput.value));
        settings.cells = resize(settings.cells, settings.nx, settings.ny);
        render();
    }

    function setNY() {
        settings.ny = Math.max(1, Math.min(1000, +html.yInput.value));
        settings.cells = resize(settings.cells, settings.nx, settings.ny);
        render();
    }

    function toggleEraser(force=null) {
        eraserMode = force === null ? !eraserMode : force;
        if (eraserMode) {
            html.eraserButton.innerText = 'Pen';
        } else {
            html.eraserButton.innerText = 'Eraser';
        }
    }

    function toggleDragMode(e, force=null) {
        if (force === null) {
            dragMode = !dragMode;
        } else {
            dragMode = force;
        }
        
        if (dragMode) {
            html.modeButton.innerText = 'Draw';
            html.canvas.style.cursor = 'grab';
        } else {
            html.modeButton.innerText = 'Pan';
            html.canvas.style.cursor = null;
        }
    }

    window.addEventListener('keypress', function (e) {
        switch (e.key) {
        case 'd':
            toggleEraser(false);
            toggleDragMode(e, false);
            break;
        case 'p':
            toggleEraser(false);
            toggleDragMode(e, false);
            break;
        case 'q':
            toggleDragMode(e, true);
            break;
        case 's':
            save();
            break;
        case 'l':
            load();
            break;
        case 'f':
            loadPrefab();
            break;
        case 'c':
            clearCells();
            break;
        case 'n':
            runGeneration();
            break;
        case 'r':
            toggleLoop();
            break;
        case 'g':
            toggleGrid();
            break;
        case 'e':
            toggleEraser(true);
            toggleDragMode(e, false);
            break;
        }
    });

    function loop() {
        setTimeout(function () {
            if (settings.loopIsRunning) {
                runGeneration();
                render();
                loop();
            }
        }, html.delayInput.value);
    }
}
