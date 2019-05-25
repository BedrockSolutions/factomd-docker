const crypto = require("crypto");
const {mkdtemp, writeFile} = require('fs').promises
const {safeDump} = require('js-yaml')
const {join, resolve} = require('path')
const pify = require('pify')

// Promisify...
const execAsync = pify(require('child_process').exec, {multiArgs: true})
const rimraf = pify(require('rimraf'))

const createTmpDir = async () => mkdtemp(resolve('./testing/tmp/'))

const removeTmpDir = rimraf

const writeConfigFile = async (config, tmpDir) => writeFile(join(tmpDir, 'values.yaml'), safeDump(config))

const copyFileFromContainer = async (filename, tmpDir) => {
  const name = crypto.randomBytes(5).toString('hex');
  try {
    await execAsync(`docker run --name ${name} -v ${tmpDir}:/app/config bedrocksolutions/factomd:latest true`)
    await execAsync(`docker cp ${name}:${join('/app', filename)} ${join(tmpDir, filename)}`)
    return execAsync(`cat ${join(tmpDir, filename)}`)
  } finally {
    await execAsync(`docker rm ${name}`)
  }
}

const getFileFromContainer = async (filename, config) => {
  let tmpDir
  try {
    tmpDir = await createTmpDir()
    await writeConfigFile(config, tmpDir)
    const [stdout] = await copyFileFromContainer(filename, tmpDir)
    return stdout
  } finally {
    if (tmpDir) {
      await removeTmpDir(tmpDir)
    }
  }
}



module.exports = { getFileFromContainer }
