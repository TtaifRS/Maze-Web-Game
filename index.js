const {
    Engine,
    Render,
    Runner,
    World,
    Bodies,
    Body,
    Events
} = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0;

const cellsVertical = Math.floor(Math.random() * 30);
const cellsHorizontal = Math.floor(Math.random() * 30);
const width = window.innerWidth - 10;
const height = window.innerHeight - 10;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const {
    world
} = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
})

Render.run(render);
Runner.run(Runner.create(), engine)

//walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, {
        isStatic: true
    }),
    Bodies.rectangle(0, height / 2, 2, height, {
        isStatic: true
    }),
    Bodies.rectangle(width / 2, height, width, 2, {
        isStatic: true
    }),
    Bodies.rectangle(width, height / 2, 2, height, {
        isStatic: true
    })
]

World.add(world, walls);

//maze generate
const shuffle = (arr) => {
    let counter = arr.length;
    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
}

const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);


const stepThrougCells = (row, column) => {
    // if I have visited the cell [ row, coloumn ], then return
    if (grid[row][column]) {
        return
    }

    // mark this as visited
    grid[row][column] = true;

    // assemble randomly-ordered list  of neighbours
    const neighbours = shuffle([
        [row - 1, column, 'up'],
        [row, column - 1, 'left'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down']
    ])


    // for each neighbour
    for (neighbour of neighbours) {
        const [nextRow, nextColumn, direction] = neighbour;
        //see if this neighbour is out of bound
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
        }
        // if visited that neighbour, continue to next neighbour
        if (grid[nextRow][nextColumn]) {
            continue
        }
        // remove a wall from either horizontals or verticals
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }

        // visit the next cell
        stepThrougCells(nextRow, nextColumn)
    }

}

stepThrougCells(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5, {
                isStatic: true,
                label: 'wall',
                render: {
                    fillStyle: '#FF0033'
                }
            }
        );

        World.add(world, wall)

    })
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5, unitLengthY, {
                isStatic: true,
                label: 'wall',
                render: {
                    fillStyle: '#FF0033'
                }
            }
        );
        World.add(world, wall)
    })
})


//Goal
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7, {
        isStatic: true,
        label: 'goal',
        render: {
            fillStyle: '#43A047'
        }
    }
)

World.add(world, goal)

//Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius, {
        label: 'ball',
        render: {
            fillStyle: '#3300FF'
        }
    }
)

World.add(world, ball)

//keypress
document.addEventListener('keydown', event => {
    const {
        x,
        y
    } = ball.velocity;
    if (event.keyCode === 87) {
        Body.setVelocity(ball, {
            x,
            y: y - 2
        })
    }

    if (event.keyCode === 68) {
        Body.setVelocity(ball, {
            x: x + 2,
            y
        })
    }

    if (event.keyCode === 65) {
        Body.setVelocity(ball, {
            x: x - 2,
            y
        })
    }

    if (event.keyCode === 83) {
        Body.setVelocity(ball, {
            x,
            y: y + 2
        })
    }



})

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal']

        if (labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)) {
            world.gravity.y = 1
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false)
                }
            })
        }
    })
})