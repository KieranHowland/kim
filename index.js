const chalk = require('chalk');
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  os.cpus().forEach(function () {
    cluster.fork();
    cluster.fork();
  });

  cluster.on('listening', function (worker) {
    console.log(chalk.yellow('[Cluster] ') + chalk.green(`Worker ${worker.id} listening.`));
  });

  cluster.on('disconnect', function (worker) {
    console.log(chalk.yellow('[Cluster] ') + chalk.red(`Worker ${worker.id} disconnected.`));
  });

  cluster.on('exit', function (worker) {
    console.log(chalk.yellow('[Cluster] ') + chalk.red(`Worker ${worker.id} died, respawning...`));
  });
} else {
  require('./app.js');
}