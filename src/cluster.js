const cluster = require('cluster');
const os = require('os');

if (!cluster.isMaster) return require('./index');

os.cpus().forEach(() => {
  cluster.fork();
  cluster.fork();
});

cluster.on('listening', (worker) => {
  console.log(`${worker.id}-${worker.process.pid} listening...`);
});

cluster.on('disconnect', (worker) => {
  console.log(`${worker.id}-${worker.process.pid} disconnected.`);
});

cluster.on('exit', (worker) => {
  console.log(`${worker.id}-${worker.process.pid} respawning...`);
});