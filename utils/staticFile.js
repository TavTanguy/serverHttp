const config = require("../" + (process.env.CONFIG || "./config.json")),
  fs = require("fs"),
  { promisify } = require("util"),
  zlib = require("zlib"),
  { join } = require("path");

const gzip = promisify(zlib.gzip),
  deflate = promisify(zlib.deflate),
  autoComplet = ["", ...config.listen.autoComplet];

module.exports = function(cb) {
  const dir = {};

  function getFileWithAutoComplet(path) {
    if (path.endsWith("/")) path = path.substr(0, path.length - 1);
    path = path.substr("/");
    for (let i = 0; i < autoComplet.length; i++) {
      const file = getFile(path + "/" + autoComplet[i]);
      if (file && typeof file.raw === "string") return file;
    }
  }
  function getFile(path) {
    path = path.split("/");
    let pt = dir;
    for (let i = 0; i < path.length; i++) {
      if (path[i] === "") continue;
      pt = pt[path[i]];
    }
    return pt;
  }
  function sendFile(file, res, acceptEncoding = "") {
    if (/\bgzip\b/.test(acceptEncoding)) {
      res.writeHead(200, { "Content-Encoding": "gzip" });
      res.write(file.gzip);
    } else if (/\bdeflate\b/.test(acceptEncoding)) {
      response.writeHead(200, { "Content-Encoding": "deflate" });
      res.write(file.deflate);
    } else {
      response.writeHead(200, {});
      res.write(file.raw);
    }
  }
  async function addFile(file) {
    const raw = await fs.promises.readFile(file, "utf8");
    inObj = {
      raw,
      gzip: await gzip(raw),
      deflate: await deflate(raw)
    };
    return inObj;
  }

  (async function addDir(path, pt) {
    const dirents = await fs.promises.readdir(path, { withFileTypes: true });
    debugger;
    for (let i = 0; i < dirents.length; i++) {
      const el = dirents[i];
      if (el.isDirectory()) {
        pt[el.name] = {};
        await addDir(join(path, el.name), pt[el.name]);
      } else {
        pt[el.name] = await addFile(join(path, el.name));
      }
    }
    return;
  })(config.listen.dir, dir)
    .then(() => {
      cb({
        dir,
        getFile,
        getFileWithAutoComplet,
        sendFile
      });
    })
    .catch(err => {
      throw err;
    });
};
