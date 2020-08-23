let util = {};

util.convertToTrees = function(array, idFieldName, parentIdFieldName, childrenFieldName){
  let cloned = array.slice();
  let numOfChild = 0;

  for(let i = cloned.length - 1; i > -1; i--){
    let parentId = cloned[i][parentIdFieldName];

    if(parentId){
      let filtered = array.filter(function(elem){
        return elem[idFieldName].toString() == parentId.toString();
      });

      if(filtered.length){
        let parent = filtered[0];

        if(parent[childrenFieldName]){
          parent[childrenFieldName].unshift(cloned[i]);
        }
        else {
          parent[childrenFieldName] = [cloned[i]];
        }
        numOfChild++;
      }
      cloned.splice(i,1);
    }
  }
  return [cloned, numOfChild];
}

module.exports = util;