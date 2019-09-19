const fs = require('fs');
const pth = require('path');
const fileType = require('file-type');
const jsonFile = require('jsonfile');
const uniq = require('uniqid');

const Journal = class Journal {
  constructor(path) {
    if (!path) throw new Error('The path parameter is undefined');

    if (typeof path !== 'string') throw new TypeError('Expected path parameter to be a string but got ' + typeof path);

    this.path = pth.resolve(path);

    if (!fs.existsSync(this.path)) throw new Error(this.path + ' cannot be found');
    if (!fs.existsSync(pth.resolve(this.path, 'journal.json'))) jsonFile.writeFileSync(pth.resolve(this.path, 'journal.json'), []);

    this.entries = jsonFile.readFileSync(pth.resolve(this.path, 'journal.json')).filter((entry) => entry.id);
  };

  new(id, entry) {
    if (!id) throw new Error('The id parameter is undefined');
    if (!entry) throw new Error('The entry parameter is undefined');

    if (typeof id !== 'string') throw new TypeError('Expected id parameter to be a string but got ' + typeof id);
    if (typeof entry !== 'object') throw new TypeError('Expected entry parameter to be an object but got ' + typeof entry);

    this.entries.push({
      id: id,
      ...entry
    });

    return this.save();
  };

  delete(id) {
    if (!id) throw new Error('The id parameter is undefined');

    if (typeof id !== 'string') throw new TypeError('Expected id parameter to be a string but got ' + typeof id);

    for (let entry of this.entries) {
      if (!entry.id || !entry.path) continue;

      if (entry.id === id) delete this.entries[entry];
    };

    return this.save();
  };

  get(id) {
    for (let entry of this.entries) {
      if (!entry.id) continue;

      if (entry.id === id) return entry;
    };

    return;
  };

  json() {
    let json = {};

    for (let entry of this.entries) {
      if (!entry.id || !entry.path) continue;

      json[entry.id] = entry.path;
    };

    return json;
  };

  save() {
    return jsonFile.writeFileSync(pth.resolve(this.path, 'journal.json'), this.entries);
  };
};

const Cluster = class Cluster {
  constructor(path, id) {
    if (!path) throw new Error('The path parameter is undefined');

    if (typeof path !== 'string') throw new TypeError('Expected path parameter to be a string but got ' + typeof path);

    if (!fs.existsSync(pth.resolve(path))) throw new Error(this.path + ' cannot be found');

    this.path = pth.resolve(path, 'cluster.' + id);
    this.id = id;

    if (!fs.existsSync(pth.resolve(this.path))) fs.mkdirSync(pth.resolve(this.path));

    this.journal = new Journal(this.path);
  };

  store(id, file, meta) {
    this.journal.new(id, {
      path: this.path,
      type: fileType(file),
      ...meta || {}
    });

    return fs.writeFileSync(pth.resolve(this.path, id), file);
  };

  delete(id) {
    if (!this.journal.get(id) || !fs.existsSync(pth.resolve(this.journal.get(id).path, id))) return;

    this.journal.delete(id);

    return fs.copyFileSync(pth.resolve(this.journal.get(id).path));
  };

  get(id) {
    if (!this.journal.get(id) || !fs.existsSync(pth.resolve(this.journal.get(id).path, id))) return;

    return {
      file: fs.readFileSync(pth.resolve(this.journal.get(id).path, id)),
      ...this.journal.get(id)
    };
  };

  size() {
    return fs.readdirSync(this.path).length;
  };

  broken() {
    return !fs.existsSync(this.path);
  };

  repair() {
    if (!fs.existsSync(pth.resolve(this.path))) return fs.mkdirSync(pth.resolve(this.path));
  };
};

const FileCluster = class FileCluster {
  constructor(path, options) {
    if (!path) throw new Error('The path parameter is undefined');

    if (typeof path !== 'string') throw new TypeError('Expected path parameter to be a string but got ' + typeof path);
    if (options && typeof options !== 'object') throw new TypeError('Expected options parameter to be an object but got ' + typeof options);

    this.path = pth.resolve(path);

    if (!fs.existsSync(this.path)) throw new Error(this.path + ' cannot be found');

    this.options = {
      maxClusterSize: 100,
      idGen: uniq,
      ...options || {}
    };
    this.clusters = [];
    this.journal = new Journal(this.path);

    for (let entry of this.journal.entries) {
      if (!this.getCluster(entry.cluster)) this.journal.delete(entry.id);
    };

    for (let cluster of fs.readdirSync(this.path).filter((cluster) => cluster.startsWith('cluster.') && fs.statSync(pth.resolve(this.path, cluster)).isDirectory())) {
      this.clusters.push(new Cluster(this.path, cluster.slice('cluster.'.length)))
    };
  };

  store(id, file, meta) {
    if (!id) throw new Error('The id parameter is undefined');
    if (!file) throw new Error('The file parameter is undefined');

    if (typeof id !== 'string') throw new TypeError('Expected id parameter to be a string but got ' + typeof id);
    if (!Buffer.isBuffer(file)) throw new TypeError('Expected file parameter to be a buffer');

    let cluster = this.freeCluster();

    if (!cluster) cluster = new Cluster(this.path, uniq());

    this.journal.new(id, {
      cluster: cluster.id
    });

    cluster.store(id, file, meta);
  };

  delete(id) {
    if (!id) throw new Error('The id parameter is undefined');

    if (typeof id !== 'string') throw new TypeError('Expected id parameter to be a string but got ' + typeof id);

    let cluster = getCluster(id);

    if (!cluster) throw new Error('Cannot find file');

    cluster.delete(id);
    this.journal.delete(id);
  };

  get(id) {
    if (!id) throw new Error('The id parameter is undefined');

    if (typeof id !== 'string') throw new TypeError('Expected id parameter to be a string but got ' + typeof id);

    let cluster = this.getCluster(this.journal.get(id).cluster);

    if (!cluster) return;

    return cluster.get(id);
  };

  exists(id) {
    console.log(this.journal.get(id).cluster, id, this.path);
    if (!this.journal.get(id) || !fs.existsSync(pth.resolve(this.path, 'cluster.' + this.journal.get(id).cluster)) || !fs.existsSync(pth.resolve(this.path, 'cluster.' + this.journal.get(id).cluster, id))) return false;

    return true;
  };

  freeCluster() {
    for (let cluster of this.clusters) {
      if (cluster.broken()) cluster.repair();

      if (!cluster.broken() && cluster.size() < this.options.maxClusterSize + 1) return cluster;
    };

    return;
  };

  getCluster(id) {
    for (let cluster of this.clusters) {
      if (cluster.id === id) return cluster;
    };

    return;
  };
};

module.exports = FileCluster;