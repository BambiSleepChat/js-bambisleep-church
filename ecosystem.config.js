// BambiSleep Church - Aristocratic Hellfire Sanctuary

module.exports = {
  apps: [{
    name: 'bambisleep-church',
    script: './src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000,
      HOST: 'localhost'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
};
