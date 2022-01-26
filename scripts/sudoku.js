'use strict'
/* n is number of cells in sudoku
sqrtn is name used for sqrt(n) which is the size of each small matrices
k is number of cells to remain empty which varies wrt difficulty
obj is used as the standad name throught for the sudoku object used
 */


export default function generateSudoku (n, difficulty) { 
    const arr = new Array(n)
    for(let i = 0;i < n;i++){
        arr[i] = new Array(n)
        arr[i].fill(0)
    }
    const sudokuObj = {
        array:arr,   //the sudoku n*n grid
        n:n,                //number of rows or column
        sqrtn:Math.sqrt(n),   //size of each small matrix
    }
    sudokuObj.puzzle = clone(sudokuObj.array)
    
    fillDiagonal(sudokuObj)
    fillOthers(sudokuObj,0,0)
    sudokuObj.puzzle = clone(sudokuObj.array)
    console.log(difficulty)
    puzzleGenerator(sudokuObj, difficulty)
    print(sudokuObj.puzzle, sudokuObj.n)
    print(sudokuObj.array,sudokuObj.n)
    return sudokuObj
}



//function to clone arrays

function clone( items){
    return items.map(item => Array.isArray(item) ? clone(item) : item)
}

//function to print sudoku
function print (array, n) {
    for(let i=0;i<n;i++){
        let s=""
        for(let j=0;j<n;j++){
            if(array[i][j] == 0)
                s+='_'+" "
            else
                s+=(array[i][j]+" ")
        }
        console.log(s)
    }
    console.log()
}

// check if a number is valid in the matrix
function isValidInBox (obj, rowStart, colStart, num) {
    for(let i=0;i < obj.sqrtn;i++){
        for(let j =0; j<obj.sqrtn;j++){
            if(obj.array[rowStart+i][colStart+j] == num)
                return false
        }
    }
    return true
}

//check if a number is valid in the given cell
function isValidInCell (array, n, sqrtn, row, col, num) {
    for(let i=0; i<n; i++){
        if(array[row][i] == num)
            return false;
        if(array[i][col]== num)
            return false;
        if(array[sqrtn*Math.floor((row/sqrtn))+Math.floor(i/sqrtn)][sqrtn*Math.floor((col/sqrtn)) + i%sqrtn] == num)
            return false;
    }
    return true
}

//fill a box of given column and row
function fillBox  (obj, row, col) {
    let num 
    for(let i=0; i<obj.sqrtn; i++){
        for(let j=0; j<obj.sqrtn; j++){
            do{
                num = getRandom(1,obj.n)
            }while(!isValidInBox(obj, row, col, num));
            obj.array[row+i][col+j] = num
        }
        
    }
    
}

//function to fill al diagonal matrices
function fillDiagonal (obj) {
    for(let i=0; i<obj.n; i+=obj.sqrtn)
        fillBox(obj,i,i)
}

//function to fill all other cells
function fillOthers (obj,row,col) {
    if(col == obj.n && row < obj.n)
    {
        col = 0
        row++
    }
    if(row == obj.n )
        return true

    if(obj.array[row][col] != 0)
        return fillOthers(obj,row,col+1)
    
    for(let i = 1;i<=obj.n;i++){
        if(isValidInCell(obj.array,obj.n,obj.sqrtn, row, col, i)){
            obj.array[row][col] = i
            if(fillOthers(obj, row, col+1))
                return true
            obj.array[row][col] = 0
        }
    }
    return false
}


//function to generate a random number between 1 to n
function getRandom (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

/*
After generating a sudoku board we now clear the cells
The no of cells to be cleared depends on te difficulty level
While clearing a cell we need to check if the solution still remains unique
*/


//function to check if a given configuration is solvable
function isSolvable ( obj ) {
    for(let i=0; i<obj.n; i++){
        for(let j=0; j<obj.n; j++){
            if(obj.puzzle[i][j] == 0){
                for(let k=1; k<=obj.n; k++){
                    if(isValidInCell(obj.puzzle,obj.n,obj.sqrtn, i, j, k)){
                        obj.puzzle[i][j] = k;
                        if(isSolvable (obj) == false)
                            obj.puzzle[i][j] = 0;
                        else 
                            return true;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function puzzleGenerator (obj, difficulty) {
    let k
    switch(difficulty){
        case "Easy":
            k = getRandom(38, 41)
            k = getRandom(2, 3)
            break
        case "Hard":
            k = getRandom(50,55)
            break
        default:
            k = getRandom(45, 48)
    }
    console.log(k)
    
    const arr = new Array(obj.n * obj.n)
    arr.fill( -1 )
    /*We will make k cells empty
    We generate a random cell and try to replace that content of the cell with another value
    If on replacing the sudoku still remain solvable , then we cannot leave the cell empty,
    since contents of the cell in the solution will not be unique
    If we find sudoku is unsolvable on replacing with any other number , then the content of the cell 
    is unique and we can empty that cell
    */
    while(k != 0){
        let index = getRandom(0 , obj.n * obj.n - 1)
        if(arr[index] == 0)
            continue;
        
        arr[index] = 0
        let row = Math.floor(index / obj.n)
        let col = index % obj.n
        let i
        let arrTemp 
        for(i = 1; i <= obj.n; i++){
            //if the number is alread the number inc ell we skip it
            if(i == obj.puzzle[row][col] || !isValidInCell( obj.puzzle, obj.n, obj.sqrtn, row, col, i))
                continue
            
            arrTemp = clone(obj.puzzle)
            obj.puzzle[row][col] = i
            let flag = isSolvable(obj)
            obj.puzzle = clone(arrTemp)
            if(flag){
                //content of cell is not unique
                break;
            }
        }
        
        if(i == obj.n+1){//cell cannot be replaced by another number, it is unique
            obj.puzzle[row][col] = 0 //make tha cell in the puzzle blank, i.e., to be filled by player
            k--
        }
    }
}




