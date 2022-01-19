let mode = 9    //cells are 1 based indexed
let board = document.getElementById('board')

reset = ()=>{
    let s=""
    for(let i=1;i <= mode*mode;i++){
        s=s+`<td><input type="number"id=${i} /></td>`
        if(i%mode == 0 ){
            console.log(s)
            board.innerHTML+= "<tr>"+s+"</tr>"
            s=""
        }
        
    }
}
reset()
