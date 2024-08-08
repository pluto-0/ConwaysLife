let board = document.getElementById("board").getContext("2d")

board_obj = {
    width : Number(document.getElementById("width_val").value),
    height : Number(document.getElementById("height_val").value),
    state : [],
    is_alive : function (i, j) {
        let alive_neighbors = 0
        for (let x_change = -1; x_change < 2; ++x_change) {
            for (let y_change = -1; y_change < 2; ++ y_change) {
                if (x_change == y_change == 0 ) {continue}
                if (i + x_change < 0 || i + x_change >= this.width) {continue}
                if (j + y_change < 0 || j + y_change >= this.height) {continue}
                if (this.state[i + x_change][j + y_change]) {
                    alive_neighbors++
                }
            }
        }

        if (this.state[i][j]) {
            if (alive_neighbors == 2 || alive_neighbors == 3) {return true}
            return false
        }
        if (alive_neighbors  == 3) {return true}
        return false
    },
    update_state : function() {
        for (let i = 0; i < this.height; ++i) {
            for (let j = 0; this.width; ++j) {
                if (this.is_alive(i, j)) {this.state[i][j] = 1}
                else {this.state[i][j] = 0}
            }
        }
    },
    draw_state: function(board) {
        for (let i = 0; i < this.height; ++i) {
            for (let j = 0; j < this.width; ++ j) {
                let alive = this.is_alive(i, j)
                fill_square(i, j, board, alive)
            }
        }
    }
}


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
    console.log(x_cord, y_cord)
    return {x_cord, y_cord}
}

for (let i = 0; i < board_obj.height; ++i) {
    const new_row = []
    for (let j = 0; j < board_obj.width; ++j) {
        new_row.push(0)
    }
    board_obj.state.push(new_row)
}

let canvas = document.getElementById("board")
canvas.addEventListener("click", event => {
    const x = event.x
    const y = event.y
    pixel_to_cords(x, y, document.getElementById("board").width, document.getElementById("board").height)
})

draw_grid(board, board_obj.width, board_obj.height)
board_obj.draw_state(board)