const { execSync } = require('child_process')

const {
  version,
  publish: { factomdTags },
} = require('../package.json')

const TAG_PREFIX = 'bedrocksolutions/factomd'

const exec = cmd => console.log(execSync(cmd).toString())

const dockerBuild = factomdTag =>
  exec(
    `docker build --build-arg FACTOMD_TAG=${factomdTag} -t ${TAG_PREFIX}:${factomdTag} -t ${TAG_PREFIX}:${factomdTag}-${version} .`
  )

const dockerPush = factomdTag => {
  exec(`docker push ${TAG_PREFIX}:${factomdTag}`)
  exec(`docker push ${TAG_PREFIX}:${factomdTag}-${version}`)
}

const tagsToPublish = process.argv[2] ? [process.argv[2]] : factomdTags

tagsToPublish.forEach(factomdTag => {
  dockerBuild(factomdTag)
  dockerPush(factomdTag)
})
