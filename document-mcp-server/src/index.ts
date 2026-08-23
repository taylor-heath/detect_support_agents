/** Library entry point, for embedding the server in another process. */
export { createDocumentMcpServer, SERVER_NAME, SERVER_VERSION } from './server.js';
export { createHttpApp, runHttp } from './transports/http.js';
export { runStdio } from './transports/stdio.js';
export { loadConfig, type Config } from './config.js';
export { createLogger, silentLogger, type Logger } from './logging.js';
export { createReadOnlyClient, type ReadOnlyHttpClient } from './upstream/client.js';
export { READ_ONLY_TOOLS, READ_ONLY_ANNOTATIONS } from './tools/index.js';
export {
  buildProtectedResourceMetadata,
  protectedResourceMetadataUrl
} from './auth/metadata.js';
export { createTokenVerifier } from './auth/verifier.js';
