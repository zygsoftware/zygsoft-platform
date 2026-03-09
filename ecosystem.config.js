module.exports = {
    apps: [
        {
            name: 'zygsoft-next',
            script: 'node_modules/.bin/next',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        },
        {
            name: 'zygsoft-python',
            script: 'python-api/.venv/bin/uvicorn',
            args: 'app:app --host 0.0.0.0 --port 8000',
            cwd: 'python-api',
            interpreter: 'none'
        }
    ]
};
