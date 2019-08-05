/* Server static */
const { createServer } = require("http"),
  { info, error } = require("./utils/log"),
  config = require(process.env.CONFIG || "./config.json");

require("./utils/staticFile")(startServer);

function startServer(staticFile) {
  const server = createServer();

  server.on("request", (req, res) => {
    staticFile.sendFile(
      staticFile.getFileWithAutoComplet(req.url),
      res,
      req.headers["accept-encoding"]
    );

    res.end();
  });

  server.listen(config.listen.port, config.listen.ip, () => {
    info(`${config.name} listen on ${config.listen.ip}:${config.listen.port}`);
  });
}
