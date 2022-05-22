
let isValidRequestBody =function(value){
    if(Object.keys(value).length===0) return false;
    return true;
}

let isValid=function(value){
    if(value==null || value=="null" || Object.values(value).length===0 ||  value=="undefined" || (typeof value==="string" && value.trim().length===0) ) return false;
    return true;
}


module.exports={isValidRequestBody,isValid} 