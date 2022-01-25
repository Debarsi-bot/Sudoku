'use strict'
import generateSudoku from './sudoku.js'

let mode = 9    //cells are 1 based indexed
let board = document.getElementById('board')

let newGameButton = document.getElementById('newGameButton')
let sudoku  //store the sudoku object 
let cells   //store all the cells in an array
let currentState    //store state of current game, i.e., if cell value is correct or not for every cell
let score       //stores total number of cells with correct value
let totalMoves  //stores total moves used to solve a board
let selectedCell //store index of a cell clicked
let displayTotalMoves = document.getElementById('totalMoves')
let toggleButton = document.getElementById('toggleButton')

//modal1 is the modal window when player solves the sudoku correctly
let modal1 = document.getElementById('modal1')
let modal1CloseButton = document.getElementById('modal1Close')
//variables to store timestamps
let startTime
let endTime
//store all keypad buttons in an array
let keypad = Array.from(document.getElementById('keypad').children)

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
    score = 0   //start with a  score of zero increase score initially for cells already filled
    totalMoves = 0   
    displayTotalMoves.innerHTML= `Moves : ${totalMoves}`
    toggleButton.value = 0
    toggleButton.checked = false
    board.innerHTML=""
    selectedCell = -1 //initially no cell is clicked, so we store an invalid index
    let s=""
    for(let i=0;i < mode*mode;i++){

        s=s+`<td><input type="number" autocomplete ="off" id=${i} /></td>`
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
    cells.forEach(e=>{
        e.addEventListener("input", arg=>handleInput(arg))
    
        e.addEventListener("mouseover",arg=>{
            let cellInfo = getCellInfo(arg)
            //if a cell is already selected we do not add hover effects
            if(selectedCell == -1)
                addOrRemoveHoverOnCells(cellInfo.index, 1)
        })
        e.addEventListener("mouseout",arg=>{
            let cellInfo = getCellInfo(arg)
            //if a cell is already selected we do not remove hover effects
            if(selectedCell == -1)
                addOrRemoveHoverOnCells(cellInfo.index, 0)
        })
    
    })
    startTime = new Date().getTime()
}

//add eventListener to keypad click
keypad.forEach(e => {
    e.addEventListener('click', arg =>{
        
    })
})
// functions for working with player assist
function removeWrongCellHover(e){
    e.classList.remove("wrongCell")
}
function removeCorrectCellHover(e){
    e.classList.remove("correctCell")
}

function removeAssist() {
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

/*
if flag is 1 we add class = "className" to target
if flag is 0 we remove class = "className" from target
 */
function addOrRemoveClass(target, flag, className){
    if(flag)
        target.classList.add(className)
    else
        target.classList.remove(className)
}

//remove hover from cells
//flag is 0 to remove hover and 1 to add hover
function addOrRemoveHoverOnCells(index, flag){
    addOrRemoveClass(cells[index], flag, 'cellHover')
    let rowCol = getRowCol(index)
    //apply to entire row
    for(let i = mode* rowCol.row; i < mode*(rowCol.row+1); i++)
    {
        addOrRemoveClass(cells[i], flag, 'relatedCells')
    }

    //apply to entire column
    for(let i = rowCol.col; i<mode*mode; i+=mode)
    {
        addOrRemoveClass(cells[i], flag, 'relatedCells')
    }
    let rowStart = parseInt(rowCol.row / sudoku.sqrtn)*sudoku.sqrtn
    let colStart = parseInt(rowCol.col / sudoku.sqrtn)*sudoku.sqrtn
    let gridStart = rowStart*mode + colStart

    let coloring = (arg)=>{
        for(let i = arg; i<arg+sudoku.sqrtn; i++)
        {
            addOrRemoveClass(cells[i], flag, 'relatedCells')
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
    totalMoves++
    displayTotalMoves.innerHTML= `Moves : ${totalMoves}`
    let cellInfo = getCellInfo(arg)
    //input is empty
    if(cellInfo.target.value == ""){
        
        if(currentState[cellInfo.index] == true){
            currentState[cellInfo.index] = false
            score--
        }
        cellInfo.target.classList.remove("wrongCell")
        cellInfo.target.classList.remove("correctCell")
    }
    else
    {
        //correct value in cell
        if(cellInfo.target.value == sudoku.array[cellInfo.row][cellInfo.col]){      
            if(currentState[cellInfo.index] != true){
                currentState[cellInfo.index] = true
                score++
            }

            if(toggleButton.value == "1"){
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
            if(toggleButton.value == 1){
                cellInfo.target.classList.remove("correctCell")
                cellInfo.target.classList.add("wrongCell")
            }
        }
    }
    if(score == mode*mode)
        {
            endTime = new Date().getTime()
            modal1.classList.remove("hidden")
            let timeDiff = getTimeDiff(startTime, endTime)
            document.getElementById('messageTotalMoves').innerText = `Total Moves : ${totalMoves}`
            let s=""
            for(const property in timeDiff){
                if(timeDiff[property] != 0){
                    s+=`${timeDiff[property]} ${property}`
                }
            }
            document.getElementById('messageTimeTaken').innerHTML = `Total Time Taken  : ${s}`
        }

}

//handle keypad button click
function handleKeypadClick(){

}

//handline modal1 close button 
modal1CloseButton.addEventListener('click', ()=>{
    modal1.classList.add('hidden')
})

newGameButton.addEventListener('click', ()=>{
    reset()
})

//function to get difference between timestamps
function getTimeDiff(startTime, endTime){
    let difference = endTime - startTime
    let hoursDifference = Math.floor(difference/1000/60/60);
    difference -= hoursDifference*1000*60*60

    let minutesDifference = Math.floor(difference/1000/60);
    difference -= minutesDifference*1000*60

    let secondsDifference = Math.floor(difference/1000);
    return {
        hours: hoursDifference,
        minutes: minutesDifference,
        seconds: secondsDifference
    }
}

//function to unmark an selected cell when a mouse click is recorded elsewhere
/*
Working:
We are concered about seperating an input box click, and click elsewhere
Since input cells have an integer as id, we check if parseInt(id) == id , which is true if only id is an integer
Some cells have defined values, as part of the problem and those values are not to be changed or selceted, and have a property disabled
, so we filter out those cells by checking if disabled property is true
 */
document.addEventListener('click', arg => {
    let target = arg.target
    if(target.id != parseInt(target.id) ||target.disabled == true){
        //target is not an input cell
        if(selectedCell != -1)
        {
            //if an input cell was elected, we remove the hover effects, as user clicked outside
            addOrRemoveHoverOnCells(selectedCell, 0)
        }
        selectedCell = -1 //no cell is selected
    }
    else{
        if(selectedCell != -1)
        {
            //an input cell is already selected so we remove hover effects relating to that
            addOrRemoveHoverOnCells(selectedCell, 0)
            
        }
        //an input cells is selected so we add hover effects relating to that cell
        selectedCell = parseInt(target.id)
        addOrRemoveHoverOnCells(selectedCell, 1)
    }
})