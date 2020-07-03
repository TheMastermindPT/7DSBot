module.exports = {
  apps : [{
    script: 'index.js',
    watch: '.'
  }, {
    script: './index.js',
    watch: ['./index.js']
  }],
  env: {
    "PORT": 80,
  },
  deploy : {
    production : {
      port : 80,
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
