const {readFileSync, writeFileSync} = require('fs')
const {last} = require('lodash')

const version = last(process.argv)
const versionRegex = /\d+\.\d+\.\d+/
if (!versionRegex.test(version)) {
  console.error('Invalid version: ' + version)
  process.exit(1)
}

function update(filename) {
  const file = readFileSync(__dirname + '/../' + filename)
    .toString('utf8')
    .replace(versionRegex, version)
  writeFileSync(filename, file)
}

update('package.json')
update('README.md')
update('chrome/manifest.json')
