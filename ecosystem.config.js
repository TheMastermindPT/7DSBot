module.exports = {
  apps: [{
    name: 'sdsbot',
    script: 'index.js',
    instances: '1',
    watch: true,
    ignore_watch: ['node_modules', 'logs/output'],
    exec_mode: 'cluster',
    restart_delay: 250,
    error_file: './logs/errors/err.log',
    out_file: './logs/output/out.log',
    time: true,
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
  }],
};
