const { execSync } = require('child_process')

const {
  version,
  publish: { factomdTags },
} = require('../package.json')

const TAG_PREFIX = 'bedrocksolutions/factomd'

const dockerBuild = factomdTag =>
  execSync(
    `docker build --build-arg FACTOMD_TAG=${factomdTag} -t ${TAG_PREFIX}:${factomdTag} -t ${TAG_PREFIX}:${factomdTag}-${version}`
  )

const dockerPush = factomdTag => {
  execSync(`docker push ${TAG_PREFIX}:${factomdTag}`)
  execSync(`docker push ${TAG_PREFIX}:${factomdTag}-${version}`)
}

factomdTags.forEach(factomdTag => {
  dockerBuild(factomdTag)
  dockerPush(factomdTag)
})
