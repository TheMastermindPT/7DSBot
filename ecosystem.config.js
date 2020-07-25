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
      DATABASE_URL: 'mysql://root:root@localhost:8889/7dsbot',
    },
    env_production: {
      NODE_ENV: 'production',
      DATABASE_URL: 'mysql://svtr3b87e393raqw:dnzmko1k8kmj1ys4@b8rg15mwxwynuk9q.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/lp7brkwhbltxzrch',
    },
  }],
};
