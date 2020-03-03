// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  Session,
  SessionAPI,
  KernelManager,
  SessionManager
} from '@jupyterlab/services';

import { log } from './log';

export async function main() {
  log('Starting session manager');
  let kernelManager = new KernelManager();
  let sessionManager = new SessionManager({ kernelManager });

  log('Start a new session');
  let options: Session.ISessionOptions = {
    kernel: {
      name: 'python'
    },
    path: 'foo.ipynb',
    type: 'notebook',
    name: 'foo.ipynb'
  };
  const sessionConnection = await sessionManager.startNew(options);

  log('Change the session path to "bar.ipynb"');
  await sessionConnection.setPath('bar.ipynb');

  log('Execute "a=1"');
  let future = sessionConnection.kernel.requestExecute({ code: 'a = 1' });
  future.onReply = reply => {
    log(`Got execute reply with status ${reply.content.status}`);
  };
  await future.done;

  log('Shut down session');
  await sessionConnection.shutdown();

  log('Get a list of session models and connect to one if any exist');
  let sessionModels = await SessionAPI.listRunning();
  if (sessionModels.length > 0) {
    let session = sessionManager.connectTo({ model: sessionModels[0] });
    log(`Connected to ${session.kernel.name}`);
  }
}
