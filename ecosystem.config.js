module.exports = {
  apps: [{
    name: 'intro',
    script: 'npm',
    args: 'start',
    instances: 'max', // 利用多核CPU
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};