'use strict';

const ncp = require('ncp').ncp;
const path = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const exec = require('child_process').exec;
const targz = require('targz');

function asyncCopyTo(from, to) {
  return asyncMkDirP(path.dirname(to)).then(
    () =>
      new Promise((resolve, reject) => {
        ncp(from, to, error => {
          if (error) {
            // Wrap to have a useful stack trace.
            reject(new Error(error));
          } else {
            // Wait for copied files to exist; ncp() sometimes completes prematurely.
            // For more detail, see github.com/facebook/react/issues/22323
            // Also github.com/AvianFlu/ncp/issues/127
            setTimeout(resolve, 10);
          }
        });
      })
  );
}

function asyncExecuteCommand(command) {
  return new Promise((resolve, reject) =>
    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    })
  );
}

function asyncExtractTar(options) {
  return new Promise((resolve, reject) =>
    targz.decompress(options, error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    })
  );
}

function asyncMkDirP(filepath) {
  return new Promise((resolve, reject) =>
    mkdirp(filepath, error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    })
  );
}

function asyncRimRaf(filepath) {
  return new Promise((resolve, reject) =>
    rimraf(filepath, error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    })
  );
}

function resolvePath(filepath) {
  if (filepath[0] === '~') {
    const home = process.env.HOME;
    const resolved = path.join(home, filepath.slice(1));
    const relative = path.relative(home, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      return home;
    }
    return resolved;
  } else {
    const resolved = path.resolve(filepath);
    if (!path.isAbsolute(filepath)) {
      const base = process.cwd();
      const relative = path.relative(base, resolved);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        return base;
      }
    }
    return resolved;
  }
}

module.exports = {
  asyncCopyTo,
  resolvePath,
  asyncExecuteCommand,
  asyncExtractTar,
  asyncMkDirP,
  asyncRimRaf,
};
