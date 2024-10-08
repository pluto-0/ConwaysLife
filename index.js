let board = document.getElementById("board").getContext("2d")
function resize_board() {
    document.getElementById("board").width = document.documentElement.clientWidth
    document.getElementById("board").height = document.documentElement.clientHeight - document.getElementById("toolbar").clientHeight
}
resize_board()
window.addEventListener("resize", () => {
    resize_board()
    board_obj.draw_state(board)
})

function make_board() {
    board_obj = {
        playing: false,
        width : Number(document.getElementById("width_val").value),
        height : Number(document.getElementById("height_val").value),
        state : make_empty_state(document.getElementById("width_val").value, document.getElementById("height_val").value),
        stack: [],
        is_alive : function (i, j) {
            let neighbors = this.alive_neighbors(i, j)
            if (this.state[i][j] == 1) {
                if (neighbors == 2 || neighbors == 3) {return true}
                return false
            }
            if (neighbors == 3) {return true}
            return false
        },

        update_state : function() {
            let state_copy = make_empty_state(this.width, this.height)
            for (let i = 0; i < this.height; ++i) {
                for (let j = 0; j < this.width; ++j) {
                    if (this.is_alive(i, j)) {state_copy[i][j] = 1}
                    else {state_copy[i][j] = 0}
                }
            }
            this.stack.push(['update', this.state])
            this.state = state_copy
        },

        draw_state: function(board) {
            let max_i = 0
            let max_j = 0
            for (let i = 0; i < this.height; ++i) {
                for (let j = 0; j < this.width; ++ j) {
                    let alive = this.state[i][j] == 1
                    fill_square(j, i, board, alive)
                    max_i = Math.max(i, max_i)
                    max_j = Math.max(j, max_j)
                }
            }
        },

        change_cell: function(x, y) { 
            let alive
            this.stack.push(['cell_change', x, y, this.state[y][x]])
            if (this.state[y][x] == 1) {
                this.state[y][x] = 0 
                alive = false
            }
            else {
                this.state[y][x] = 1
                alive = true
            }
            fill_square(x, y, board, alive)
        },

        alive_neighbors: function(x, y) {
            const possible_changes = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
            let ans = 0
            let new_x, new_y
            for (let change of possible_changes) {
                new_x = x + change[0]
                new_y = y + change[1]
                if (new_x < 0 || new_x >= this.height || new_y < 0 || new_y >= this.width) {
                    continue
                }
                try {if (this.state[new_x][new_y] == 1) {ans++}}
                catch {console.log(new_x, new_y)}
            }
            return ans
        }
    }
    return board_obj
}
board_obj = make_board()

function draw_grid(board, width, height) {
    board.fillStyle = "grey"
    for (let i = 0; i <= width; ++i) {
        board.beginPath();
        path_begin = cords_to_pixel(i, 0, width, height)
        path_end = cords_to_pixel(i, height, width, height)
        board.moveTo(path_begin[0], path_begin[1]); 
        board.lineTo(path_end[0], path_end[1]); 
        board.stroke(); 
    }

    for (let i = 0; i <= height; ++i) {
        board.beginPath();
        path_begin = cords_to_pixel(0, i, width, height)
        path_end = cords_to_pixel(width, i, width, height)
        board.moveTo(path_begin[0], path_begin[1]); 
        board.lineTo(path_end[0], path_end[1]); 
        board.stroke(); 
    }
}

function fill_square(x, y, board, alive) {
    let width = document.getElementById("board").width / board_obj.width
    let height = document.getElementById("board").height / board_obj.height 
    x_pixel_cords = x * width
    y_pixel_cords = y * height
    board.beginPath()
    board.rect(x_pixel_cords, y_pixel_cords, width - 1, height - 1)
    if (alive) {board.fillStyle = "white"}
    else {board.fillStyle = "black"}
    board.fill()
}

function cords_to_pixel(x, y, cord_width, cord_height) {
    pixel_width = document.getElementById("board").width
    pixel_height = document.getElementById("board").height
    x_result = x * (pixel_width / cord_width)
    y_result = y * (pixel_height / cord_height)
    return [x_result, y_result]
}

// Have to correct for offset of toolbar
function pixel_to_cords(x, y, pixel_width, pixel_height) {
    const y_offset = document.getElementById("toolbar").offsetHeight
    const width_per_cell = pixel_width / board_obj.width
    const height_per_cell = pixel_height / board_obj.height
    const x_cord = Math.floor(x / width_per_cell)
    const y_cord = Math.floor((y - y_offset) / height_per_cell)
    return [x_cord, y_cord]
}

function make_empty_state(width, height) {
    let ans = []
    for (let i = 0; i < height; ++i) {
        const new_row = []
        for (let j = 0; j < width; ++j) {
            new_row.push(0)
        }
        ans.push(new_row)
    }
    return ans
}

board.width = window.innerWidth
board.height = window.innerHeight

let canvas = document.getElementById("board")
canvas.addEventListener("click", event => {
    const x_pixel_cords = event.x
    const y_pixel_cords = event.y
    let cords = pixel_to_cords(x_pixel_cords, y_pixel_cords, document.getElementById("board").width, document.getElementById("board").height)
    let x = cords[0]
    let y = cords[1]
    board_obj.change_cell(x, y)
})

draw_grid(board, board_obj.width, board_obj.height)
board_obj.draw_state(board)
document.getElementById("forward").addEventListener("mouseup", event => {
    if (event.button == 0) {
        board_obj.update_state()
        board_obj.draw_state(board)
    }
})

document.getElementById("back").addEventListener("mouseup", () => {
    if (board_obj.stack.length > 0) {
        const change = board_obj.stack.pop()
        if (change[0] == 'cell_change') {
            board_obj.state[change[1]][change[2]] = change[3]
            fill_square(change[1], change[2], board, change[3] == 1)
        }
        else if (change[0] == 'update') {
            board_obj.state = change[1]
            board_obj.draw_state(board)
        }
    }
})

document.getElementById("width_val").addEventListener("change", function change_width() {
    board_obj.state = make_empty_state(parseInt(this.value), board_obj.height)
    board_obj.width = parseInt(this.value)
    board.clearRect(0, 0, document.getElementById("board").width, document.getElementById("board").height)
    draw_grid(board, board_obj.width, board_obj.height)
    board_obj.draw_state(board)
})

document.getElementById("height_val").addEventListener("change", function change_height() {
    board_obj.state = make_empty_state(board_obj.width, parseInt(this.value))
    board_obj.height = parseInt(this.value)
    board.clearRect(0, 0, document.getElementById("board").width, document.getElementById("board").height)
    draw_grid(board, board_obj.width, board_obj.height)
    board_obj.draw_state(board)
})

document.getElementById("increase_width").addEventListener("mouseup", function increase_width() {
    board_obj.state = make_empty_state(board_obj.width + 1, board_obj.height)
    board_obj.width = board_obj.width + 1
    board.clearRect(0, 0, document.getElementById("board").width, document.getElementById("board").height)
    draw_grid(board, board_obj.width, board_obj.height)
    board_obj.draw_state(board)
})

document.getElementById("decrease_width").addEventListener("mouseup", function decrease_width() {
    if (board_obj.width > 1) {
        board_obj.state = make_empty_state(board_obj.width - 1, board_obj.height)
        board_obj.width = board_obj.width - 1
        board.clearRect(0, 0, document.getElementById("board").width, document.getElementById("board").height)
        draw_grid(board, board_obj.width, board_obj.height)
        board_obj.draw_state(board)
    }
})

document.getElementById("increase_height").addEventListener("mouseup", function increase_height() {
    board_obj.state = make_empty_state(board_obj.width, board_obj.height + 1)
    board_obj.height = board_obj.height + 1
    board.clearRect(0, 0, document.getElementById("board").width, document.getElementById("board").height)
    draw_grid(board, board_obj.width, board_obj.height)
    board_obj.draw_state(board)
})

document.getElementById("decrease_height").addEventListener("mouseup", function decrease_height() {
    if (board_obj.height > 1) {
        board_obj.state = make_empty_state(board_obj.width, board_obj.height - 1)
        board_obj.height = board_obj.height - 1
        board.clearRect(0, 0, document.getElementById("board").width, document.getElementById("board").height)
        draw_grid(board, board_obj.width, board_obj.height)
        board_obj.draw_state(board)
    }
})

document.getElementById("play").addEventListener("mouseup", () => {
    function update(board) {
        board_obj.update_state()
        board_obj.draw_state(board)
    }

    if (! board_obj.playing) {
        board_obj.playing = true
        interval_id = setInterval(update, 50, board)
    }
    
})
document.getElementById("pause").addEventListener("mouseup", () => {
        console.log(interval_id)
        board_obj.playing = false
        clearInterval(interval_id)
})

