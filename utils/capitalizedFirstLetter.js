module.exports.capaitlize=(letter)=>{
    let capital=""
    words=letter.split(" ")
    console.log(words)
    for(i in words){
        
        capital=capital+words[i].charAt(0).toUpperCase() + words[i].slice(1) +" "
    }
    return capital

}