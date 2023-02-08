const fs = require('fs')

const convertTupleToCSVRows= (data, nameOfFile) => {
    var lineArray = [];

    data.forEach(function (itemResults, index) {
        var line = Array.from(itemResults[1]).join(",");
        //lineArray.push(index == 0 ? "data:text/csv;charset=utf-8,\n" + itemResults[0]+","+ line: itemResults[0]+","+ line);
        lineArray.push(index == 0 ? ",\n" + itemResults[0]+","+ line: itemResults[0]+","+ line);
    });
    var csvContent = lineArray.join("\n");

    fs.writeFile(nameOfFile, csvContent, (err) => {
        if (err) throw err;
    })
}

const convertTupleToCSVColumns= (data, nameOfFile) => {
    const csvRows = [];
    
    var keys=[]
    var resultsLengths=[]
    data.forEach(function(itemResults, index){
        keys.push(itemResults[0])
        var line = Array.from(itemResults[1])
        resultsLengths.push(line.length)
    }) 
    csvRows.push(keys.join(','))
    var maxNumberOfRows = (Math.max(...resultsLengths))

    const headers = Object.keys(data);
 
    var rows = []
    for (let i = 0; i < maxNumberOfRows; i++) {
        var row = ""
        data.forEach(function(itemResults, index){
            var line = Array.from(itemResults[1])
            row = row + (typeof line[i] === 'undefined' ? "," : line[i] + ",")
        }) 
        csvRows.push(row)
      }

    fs.writeFile(nameOfFile, csvRows.join('\n'), (err) => {
        if (err) throw err;
    })
}

module.exports = {
    convertTupleToCSVColumns,
    convertTupleToCSVRows,
};