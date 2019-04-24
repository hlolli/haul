import {
  RuntimeCompleteEvent,
  RuntimeCommandStartEvent,
  RuntimeUnhandledErrorEvent,
} from 'haul-inspector-events';
import InspectorClient from './InspectorClient';
import Logger from './Logger';

export default class Runtime {
  logger: Logger;

  constructor(private inspectorClient?: InspectorClient) {
    this.logger = new Logger(inspectorClient);
  }

  async ready(waitForInspector: boolean = false): Promise<void> {
    if (waitForInspector && this.inspectorClient) {
      await this.inspectorClient.ready();
    }
  }

  startCommand(command: string | readonly string[], argv: string[]) {
    if (this.inspectorClient) {
      this.inspectorClient.emitEvent(
        new RuntimeCommandStartEvent(
          typeof command === 'string' ? command : command.join(' '),
          argv
        )
      );
    }
  }

  unhandledError(error: Error | string) {
    this.logger.error('Unhandled error:', error);
    if (this.inspectorClient) {
      this.inspectorClient.emitEvent(new RuntimeUnhandledErrorEvent(error));
    }
  }

  complete(exitCode: number = 0) {
    process.exitCode = exitCode;
    if (this.inspectorClient) {
      this.inspectorClient.emitEvent(new RuntimeCompleteEvent(exitCode));
      this.inspectorClient.close();
    }
  }
}
