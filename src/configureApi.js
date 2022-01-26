const prompts = require('prompts');
const fs = require('fs')

const configFile = `{
  "fileType": "content",
  "logRequest": true,
  "countMode": "NO_COUNT",
  "groupResponsesByIp": true
}`

const defaultRequestContent = '{"message": "ok"}'
const defaultRequestJson = `
{
  "status": 200,
  "headers": {
    "content-type": "application/json"
  }
}
`

const defaultTemplate = (response) => {
  return `{
    "sessionsDirectory": "${response.sessionDirectory}",
    "api": {
      "${response.protocol}Port": ${response.apiPort}
    },
    "server": {
      "${response.protocol}Port": ${response.serverPort}
    },
    "defaultSession": {
      "name": "${response.defaultSession}"
    },
    "defaultMatchers": [
      {
        "name": "users-with-id-route",
        "method": "^GET$",
        "url": "/users/\\\\d+"
      },
      {
        "name": "any-other-routes",
        "method": "^(GET|POST|PUT|DELETE)$",
        "url": "/.*"
      }
    ]
  }`
}

const configureApi = async () => {
  const questions = [
    {
      type: 'text',
      name: 'protocol',
      message: 'What protocol should be enabled? (http or https)',
      initial: 'http',
      validate: (protocol) => (protocol === 'https' || protocol === 'http') ? true : `Valid protocol is only http or https. You provided ${protocol}`
    },
    {
      type: 'number',
      name: 'apiPort',
      message: 'What port should be specified for api port? (default is 3050)',
      initial: 3050,
    },
    {
      type: 'number',
      name: 'serverPort',
      message: 'What port should be specified for server port? (default is 3000)',
      initial: 3000
    },
    {
      type: 'text',
      name: 'sessionDirectory',
      message: 'What will be the path to the session directory',
      initial: './sessions/',
      validate: (sessionDirectory) => (sessionDirectory.trim().length > 3 && sessionDirectory.endsWith('/')) ? true : 'Session Directory must have at least 3 characters and that ends up with "/"'
    },
    {
      type: 'text',
      name: 'defaultSession',
      message: 'What will be the folder that will be used for the default session',
      initial: 'default',
      validate: (defaultSession) => (defaultSession.trim().length > 3) ? true : 'Default Session must have at least 3 characters'
    }
  ];

  let isCanceled = false;

  const onCancel = () => {
    isCanceled = true
    return true
  }
  const responses = await prompts.prompt(questions, { onCancel })

  if (!isCanceled) {
    try {
      if (!fs.existsSync(responses.sessionDirectory)) {
        // fs.mkdirSync(responses.sessionDirectory)
        fs.mkdirSync(`${responses.sessionDirectory}${responses.defaultSession}`, { recursive: true })

        fs.writeFileSync('ezmockserver.json', defaultTemplate(responses), 'utf8')
        fs.writeFileSync(`${responses.sessionDirectory}${responses.defaultSession}/.config.json`, configFile, 'utf8')
        fs.writeFileSync(`${responses.sessionDirectory}${responses.defaultSession}/users-with-id-route.content`, defaultRequestContent, 'utf8')
        fs.writeFileSync(`${responses.sessionDirectory}${responses.defaultSession}/users-with-id-route.json`, defaultRequestJson, 'utf8')
        fs.writeFileSync(`${responses.sessionDirectory}${responses.defaultSession}/any-other-routes.content`, defaultRequestContent, 'utf8')
        fs.writeFileSync(`${responses.sessionDirectory}${responses.defaultSession}/any-other-routes.json`, defaultRequestJson, 'utf8')
      } else {
        console.log('EzmockServer is already configured')
      }
    } catch (err) {
      console.error(`Could not create ezmockserver.json for ${err}`)
    }
  }
}

module.exports = { 
  configureApi
}