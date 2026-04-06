export class CommandController {
  constructor(commandService) {
    this.commandService = commandService;
    this.handle = this.handle.bind(this);
  }

  async handle(req, reply) {
    const result = await this.commandService.handle(req.body.text);

    reply.send(result);
  }
}
