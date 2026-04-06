export function errorHandler(error, req, reply) {
  req.log.error({ err: error, route: req.url }, 'request failed');

  reply.status(400).send({
    error: 'BAD_REQUEST',
    message: error.message
  });
}
