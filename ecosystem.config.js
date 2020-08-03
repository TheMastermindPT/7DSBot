module.exports = {
  apps: [{
    name: 'sdsbot',
    script: 'index.js',
    instances: '1',
    exec_mode: 'cluster',
    error_file: 'logs/errors/err.log',
    out_file: 'logs/output/out.log',
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
      JAWSDB_URL: 'mysql://svtr3b87e393raqw:dnzmko1k8kmj1ys4@b8rg15mwxwynuk9q.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/lp7brkwhbltxzrch',
      PREFIX: '!',
    },
  }],
};
