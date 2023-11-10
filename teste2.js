const fs = require("fs")
const path = require("path")


function getRelativeImportPath(p) {
  const fileDescriptor = fs.openSync(p);

  const charCount = 5000;
  
  const buffer = Buffer.alloc(charCount);
  
  fs.readSync(fileDescriptor, buffer, 0, charCount);
  
  const str = buffer.toString('utf8', 0, charCount);
  
  const r = /import([ \n\t]*(?:[^ \n\t\{\}]+[ \n\t]*,?)?(?:[ \n\t]*\{(?:[ \n\t]*[^ \n\t"'\{\}]+[ \n\t]*,?)+\})?[ \n\t]*)from[ \n\t]*(['"])([^'"\n]+)(?:['"])/g
  
  const matches = str.matchAll(r)
  
  const pathsToImport = []

  if (matches) {
    
    for (const match of Array.from(matches)) {
      const statement = match[0]

      const importPath = statement
        .replaceAll('"', "`")
        .replaceAll("'", "`")
        .split("`")[1]

      const isRelative = importPath.includes(".")

      if (isRelative) {
        const pathToImport = importPath

        pathsToImport.push(pathToImport)
      }
    }

  }

  return pathsToImport
}

const pa = process.cwd() + "/teste.js"

getRelativeImportPath(pa)

// console.info(r.test(bufferAsStr));