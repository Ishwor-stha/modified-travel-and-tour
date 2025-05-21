module.exports.capaitlize=(letter)=>{
    let capital=""
    words=letter.split(" ")
    for(i in words){
        if(words[i]===words[words.length-1])return capital=capital+words[i].charAt(0).toUpperCase() + words[i].slice(1)
        capital=capital+words[i].charAt(0).toUpperCase() + words[i].slice(1) +" "
    }
    
}