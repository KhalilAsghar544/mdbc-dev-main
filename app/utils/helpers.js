exports.siteExists= async (arr, id) =>{
    return arr.some(function(el) {
        return el.site_id === id;
      }); 
}