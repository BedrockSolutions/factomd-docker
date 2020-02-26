const chalk = require('chalk')
const { spawnSync } = require('child_process')

const {
  version,
  publish: { factomdTags },
} = require('../package.json')

const TAG_PREFIX = 'bedrocksolutions/factomd'

const exec = cmdArgs => {
  console.log(chalk.green(`docker ${cmdArgs.join(' ')}`))
  spawnSync('docker', cmdArgs, {stdio: 'inherit'})
}

const dockerBuild = factomdTag =>
  exec(
    ['build', '--build-arg', `FACTOMD_TAG=${factomdTag}`, '-t', `${TAG_PREFIX}:${factomdTag}`, '-t', `${TAG_PREFIX}:${factomdTag}-${version}`, '.']
  )

const dockerPush = factomdTag => {
  exec(['push', `${TAG_PREFIX}:${factomdTag}`])
  exec(['push', `${TAG_PREFIX}:${factomdTag}-${version}`])
}

const tagsToPublish = process.argv[2] ? [process.argv[2]] : factomdTags

tagsToPublish.forEach(factomdTag => {
  dockerBuild(factomdTag)
  dockerPush(factomdTag)
})
