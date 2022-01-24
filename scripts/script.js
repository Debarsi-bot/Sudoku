'use strict'
import generateSudoku from './sudoku.js'

let mode = 9    //cells are 1 based indexed
let board = document.getElementById('board')
let assist = 0

let sudoku  //store the sudoku object 
let cells   //store all the cells in an array
let currentState    //store state of current game, i.e., if cell value is correct or not for every cell
let score       //stores total number of cells with correct value
let toggleButton = document.getElementById("toggleButton")

let reset = ()=>{
    //enter all the cells of sudoku into HTML
    sudoku = generateSudoku(9)
    // sudokuObj = {
    //     array   //the sudoku n*n grid with solution
    //     n       //number of rows or column
    //     sqrtn  //size of each small matrix
    //     puzzle //contains the forme sudoku puzzle
    // }
    cells = []
    currentState = Array(mode*mode).fill(false) //let all cells store wrong value initially
    score = 0                                   //start witha  score of zero

    let s=""
    for(let i=0;i < mode*mode;i++){

        s=s+`<td><input type="number" id=${i} /></td>`
        if( (i+1)%mode == 0 ){
            board.innerHTML+= "<tr>"+s+"</tr>"
            s=""
        }
    }
    Array.from(document.getElementById("board").childNodes).forEach(e=>{
        Array.from(e.childNodes).forEach(e => cells.push(e.firstChild))
    })
    
    for(let i = 0; i < sudoku.n*sudoku.n; i++)
    {
        let row = Math.floor(i/sudoku.n)
        let col = i%sudoku.n
        if(sudoku.puzzle[row][col] != 0){
            let item = document.getElementById(i)
            item.value = sudoku.puzzle[row][col]
            item.disabled = true
            currentState[i] = true
            score++
        }
    }
}

// functions for working with player assist
function removeWrongCellHover(e){
    e.classList.remove("wrongCell")
}
function removeCorrectCellHover(e){
    e.classList.remove("correctCell")
}

function removeAssist() {
    assist = 0
    cells.forEach(e =>{
        removeWrongCellHover(e)
        removeCorrectCellHover(e)
    })
}

function addCorrectCellHover(e){
    e.classList.add("correctCell")
}

function addWrongCellHover(e){
    e.classList.add("wrongCell")
}

function addAssist() {
    assist = 1
    for(let i=0;i < mode*mode; i++){
        if(cells[i].disabled == true)
            continue
        if(cells[i].value != 0){
            let rowCol = getRowCol(i)
            if(cells[i].value == sudoku.array[rowCol.row][rowCol.col] )
                addCorrectCellHover(cells[i])
            else
                addWrongCellHover(cells[i])
        }
    }
}

//function for toggling assist
toggleButton.addEventListener("click", ()=>{
    if(toggleButton.value == 0){
        toggleButton.value = "1"
        addAssist()
    }
    else{
        toggleButton.value = "0"
        removeAssist()
    }
    
})
reset()

cells.forEach(e=>{
    e.addEventListener("input", arg=>handleInput(arg))

    e.addEventListener("mouseover",arg=>{
        let cellInfo = getCellInfo(arg)
        cells[cellInfo.index].classList.add("cellHover")
        toggleHoverRelatedCells(cellInfo.index)
    })
    e.addEventListener("mouseout",arg=>{
        let cellInfo = getCellInfo(arg)
        cells[cellInfo.index].classList.remove("cellHover")
        toggleHoverRelatedCells(cellInfo.index)
    })
})

//add hover effect toa ll related cells
function toggleHoverRelatedCells(index){
    let rowCol = getRowCol(index)
    //apply to entire row
    for(let i = mode* rowCol.row; i < mode*(rowCol.row+1); i++)
    {
        if(i == index)
            continue
        cells[i].classList.toggle('relatedCells')
    }

    //apply to entire column
    for(let i = rowCol.col; i<mode*mode; i+=mode)
    {
        if(i == index)
            continue
        cells[i].classList.toggle('relatedCells')
    }

    let rowStart = parseInt(rowCol.row / sudoku.sqrtn)*sudoku.sqrtn
    let colStart = parseInt(rowCol.col / sudoku.sqrtn)*sudoku.sqrtn
    let gridStart = rowStart*mode + colStart

    /*we take each row of the grid one by one and apply the effect to concerend cells
    Since we are using toogle, some cells will already be efefcted by adding effect to the enire row or column
    We make sure we skip those elements
    */
    let coloring = (arg)=>{
        for(let i = arg; i<arg+sudoku.sqrtn; i++)
        {
            if((i >= rowCol.row*mode && i < (rowCol.row+1)*mode) || Math.abs(i - index) % mode == 0|| Math.abs(index- i )%mode == 0)
                continue;
            else
                cells[i].classList.toggle('relatedCells')
        }
    }
    let c = sudoku.sqrtn
    while(c--){
        coloring(gridStart + c*mode)
    }
}

//function to get row and col from an index
function getRowCol(index){
    let row = parseInt(index/mode)
    let col = parseInt(index%mode)
    let obj = {
        row:row,
        col:col
    }
    return obj
}
/*this function is used to get information about a cell that is been clicked, hovered, or been involved 
in any other activity
We return
1) target cell
2) index of target cell in the cell array
3) row and column of the cell in the equivalent sudoku puzzle
*/
function getCellInfo (arg){
    let target = arg.srcElement
    let index = parseInt(target.id)
    let rowCol = getRowCol(index)
    let obj ={
        target: target,
        index: index,
        row: rowCol.row,
        col: rowCol.col
    }
    return obj
}

/*function to be called when a value is enetered in a cell
Uses : 
1) If assist is on add the correct or wrong class to the cell
2) Find current state of game and calculate total correct values
3) If total coorect value equals total cells the sudoku is solved
*/
function handleInput(arg){
    let cellInfo = getCellInfo(arg)
    if(cellInfo.target.value != 0 ){
        //correct value in cell
        if(cellInfo.target.value == sudoku.array[cellInfo.row][cellInfo.col]){      
            if(currentState[cellInfo.index] != true){
                currentState[cellInfo.index] = true
                score++
            }

            if(assist){
                cellInfo.target.classList.remove("wrongCell")
                cellInfo.target.classList.add("correctCell")
            }
        }
        else
        //incorrect value in cell
        {                
            if(currentState[cellInfo.index] == true){
                currentState[cellInfo.index] = false
                score--
            }
            if(assist){
                cellInfo.target.classList.remove("correctCell")
                cellInfo.target.classList.add("wrongCell")
            }
        }
    }
    if(score == mode*mode)
        console.log("solved")

}
