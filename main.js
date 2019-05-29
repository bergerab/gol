function gol(parent, init={}) {
    const width = init.width || 800,
          height = init.height || 600,
          html = {
              canvas: l.canvas({ width: width, height: height }),
              delayInput: l.input({ type: 'range', min: 3, max: 2000, value: 300 }),
              sizeInput:  l.input({ type: 'range', min: 2, max: 100, value: 20, onchange: changeSize }),
              loopButton: l.button('Start Loop', { onclick: () => toggleLoop() }),
              nextGenButton: l.button('Next Generation', { onclick: runGeneration }),
              clearButton: l.button('Clear', { onclick: clearCells }),
              saveButton: l.button('Save', { onclick: save }),
              loadButton: l.button('Load', { onclick: load}),
              prefabSelect: l.select(Object.keys(prefabs).map(key => l.option(key, { value: key }))),
              loadPrefabButton: l.button('Load Prefab', { onclick: loadPrefab }),
              generationCounter: l.label('0'),
              modeButton: l.button('Pan', { onclick: toggleDragMode }),
              toggleGridButton: l.button('Hide Grid', { onclick: () => toggleGrid() }),
              xInput: l.input({ value: 100, onchange: setNX }),
              yInput: l.input({ value: 100, onchange: setNY }),
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
        startX: -10, // x translation
        startY: -3 // y translation
    };

    l(parent, l.with(html, () => div(
        canvas,
        div(
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
        //             v = v.sub(startX*squareSize, startY*squareSize);
        for (let i=0; i<settings.nx; ++i) {
            for (let j=0; j<settings.ny; ++j) {
                const pos = new Vec2(((i*settings.squareSize) + settings.squareSize/2), ((j*settings.squareSize) + settings.squareSize/2));
                let d = Vec2.distance(v, pos);
                if (d < closestDistance) {
                    closest = [i+settings.startX, j+settings.startY];
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
        for (let i=settings.startX; i<settings.nx+settings.startX; ++i) {
            for (let j=settings.startY; j<settings.ny+settings.startY; ++j) {
                ctx.beginPath();
                ctx.rect((i-settings.startX)*settings.squareSize, (j-settings.startY)*settings.squareSize, settings.squareSize, settings.squareSize);
                if (i >= settings.cells.length || j >= settings.cells[0].length || i < 0 || j < 0) {
                } else if (settings.cells[i][j]) {
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
            settings = item;
        }
        
        html.xInput.value = settings.nx;
        html.yInput.value = settings.ny;
        toggleGrid(settings.showGrid);
        
        render();
    }

    function handleClick(e, toggle) {
        const pos = getRelativePosition(e);
        const [i, j] = getClosestCell(pos);
        if (i >= settings.cells.length || j >= settings.cells[0].length) {
            
        } else {
            if (toggle) {
                settings.cells[i][j] = settings.cells[i][j] === 0 ? 1 : 0;
            } else {
                settings.cells[i][j] = 1;
            }
        }
        setGenerationCount(0);
        render();
    }

    let mouseDown = false,
        mouseDownPos = null,
        dragged = false,
        mousePos = new Vec2(0, 0),
        dMousePos = new Vec2(0, 0),
        dragMode = false;

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
        const _dMousePos = (currentMousePos.sub(mousePos).mulScalar(-1).minMax(15)).add(dMousePos);
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

    // only resize if we are getting larger,
    // if getting smaller, keep large array
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
        load(prefabs[html.prefabSelect.value]);
    }

    function changeSize() {
//        const oldRx = settings.rx,
//              oldRy = settings.ry;
//        render();
//        const dx = Math.round(settings.rx - oldRx);
        //        const dy = Math.round(settings.ry - oldRy);
        settings.squareSize = +html.sizeInput.value;
        render();
    }

    function setGenerationCount(gc) {
        settings.generationCount = gc;
        html.generationCounter.innerText = settings.generationCount;
    }

    function setNX() {
        settings.nx = +html.xInput.value;
        settings.cells = resize(settings.cells, settings.nx, settings.ny);
        render();
    }

    function setNY() {
        settings.ny = +html.yInput.value;
        settings.cells = resize(settings.cells, settings.nx, settings.ny);
        render();
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
            toggleDragMode(e, false);
            break;
        case 'p':
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
        }
    });

    function loop() {
        setTimeout(function () {
            runGeneration();
            render();
            if (settings.loopIsRunning) {
                loop();
            }
        }, html.delayInput.value);
    }
}
