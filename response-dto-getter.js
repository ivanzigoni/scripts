/**
 * script for extracting all response dtos and their dependencies (other than libraries etc)
 *
 *  usage:
 *
 * - the script matches for filenames that has "response" and "dto" in them
 *    - monthly-fee-response.dto.ts is valid
 *    - response-dto-for-something.ts is valid
 *    - response.interface.ts is not valid
 *    - user-res.dto.ts is not valid
 *
 * - executing the script: "node response-dto-getter.js /home/me/Documents/work/repositories/my-app /home/me/Documents/work/my-responses"
 *    - first path is target folder (root, src etc)
 *    - second path is destiny folder where dto-output output folder will be created
 */
;(() => {
  const fs = require('node:fs')
  const path = require('path')
  const cp = require('child_process')

  const [_, __, arg, destiny] = process.argv

  if (!arg) {
    console.error('must send target folder')
    console.log(
      'example: node response-dto-getter.js /home/me/Documents/work/repositories/my-app /home/me/Documents/work/my-responses',
    )
    return
  }

  if (!destiny) {
    console.error('must send destiny folder')
    console.log(
      'example: node response-dto-getter.js /home/me/Documents/work/repositories/my-app /home/me/Documents/work/my-responses',
    )
    return
  }

  if (!fs.existsSync(arg)) {
    console.error('target folder does not exists')
    return
  }

  const outputFolder = path.resolve(destiny, 'dto-output')

  const responsesFolder = path.resolve(outputFolder, 'responses')

  const responsesDependenciesFolder = path.resolve(
    outputFolder,
    'responses-dependencies',
  )

  if (fs.existsSync(outputFolder)) {
    cp.execSync(`rm -rf ${outputFolder}`)
  }

  cp.execSync(`mkdir ${outputFolder}`)

  cp.execSync(`mkdir ${responsesFolder}`)

  cp.execSync(`mkdir ${responsesDependenciesFolder}`)

  function getRelativeImportPath(p) {
    const fileDescriptor = fs.openSync(p)

    const charCount = 5000

    const buffer = Buffer.alloc(charCount)

    fs.readSync(fileDescriptor, buffer, 0, charCount)

    const str = buffer.toString('utf8', 0, charCount)

    const r =
      /import([ \n\t]*(?:[^ \n\t\{\}]+[ \n\t]*,?)?(?:[ \n\t]*\{(?:[ \n\t]*[^ \n\t"'\{\}]+[ \n\t]*,?)+\})?[ \n\t]*)from[ \n\t]*(['"])([^'"\n]+)(?:['"])/g

    const matches = str.matchAll(r)

    const pathsToImport = []

    if (matches) {
      for (const match of Array.from(matches)) {
        const statement = match[0]

        const importPath = statement
          .replaceAll('"', '`')
          .replaceAll("'", '`')
          .split('`')[1]

        const isRelative = importPath.includes('.')

        if (isRelative) {
          const pathToImport = importPath

          pathsToImport.push(pathToImport + '.ts')
        }
      }
    }

    return pathsToImport
  }

  function traverse(p) {
    for (const file of fs.readdirSync(p)) {
      const filePath = path.resolve(p, file)

      const isDirectory = fs.lstatSync(filePath).isDirectory()

      if (isDirectory) {
        if (filePath.includes('dist')) {
          continue
        }

        if (filePath.includes('node_modules')) {
          continue
        }

        traverse(filePath)
      } else {
        const condition1 = file.match('response')
        const condition2 = file.match('dto')

        if (file.includes('response-dto-getter.js')) {
          continue
        }

        if (condition1 && condition2) {
          const relativeImports = getRelativeImportPath(filePath)

          for (const relativeImport of relativeImports) {
            const fileToImport = path.resolve(p, relativeImport)

            cp.execSync(`cp ${fileToImport} ${responsesDependenciesFolder}`)
          }

          cp.execSync(`cp ${filePath} ${responsesFolder}`)
        }
      }
    }

    return
  }

  traverse(arg)
})()
