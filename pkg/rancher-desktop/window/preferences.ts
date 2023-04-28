import path from 'path';

import { app, dialog } from 'electron';

import { webRoot, createWindow } from '.';

import { Help } from '@pkg/config/help';
import { NavItemName } from '@pkg/config/transientSettings';
import paths from '@pkg/utils/paths';
import { CommandOrControl, Shortcuts } from '@pkg/utils/shortcuts';
import { getVersion } from '@pkg/utils/version';

interface NavItems {
  name: NavItemName;
  tabs?: string[];
}

export const preferencesNavItems: NavItems[] = [
  {
    name: 'Application',
    tabs: ['general', 'behavior', 'environment'],
  },
  {
    name: process.platform === 'win32' ? 'WSL' : 'Virtual Machine',
    tabs: process.platform === 'win32' ? ['integrations', 'network', 'proxy'] : [],
  },
  {
    name: 'Container Engine',
    tabs: ['general', 'allowed-images'],
  },
  { name: 'Kubernetes' },
];

let isDirty = false;

/**
 * Open the main window; if it is already open, focus it.
 */
export function openPreferences() {
  const window = createWindow('preferences', `${ webRoot }/index.html#preferences`, {
    title:           'Rancher Desktop - Preferences',
    width:           768,
    height:          512,
    autoHideMenuBar: true,
    resizable:       false,
    minimizable:     false,
    show:            false,
    icon:            path.join(paths.resources, 'icons', 'logo-square-512.png'),
    webPreferences:  {
      devTools:         !app.isPackaged,
      nodeIntegration:  true,
      contextIsolation: false,
    },
  });

  if (!Shortcuts.isRegistered(window)) {
    Shortcuts.register(
      window,
      [{
        key:      '?',
        meta:     true,
        platform: 'darwin',
      }, {
        key:      'F1',
        platform: ['win32', 'linux'],
      }],
      async() => {
        Help.preferences.openUrl(await getVersion());
      },
      'preferences help',
    );

    Shortcuts.register(
      window,
      { key: 'Escape' },
      () => {
        window.close();
      },
      'Close preferences dialog',
    );

    preferencesNavItems.forEach(({ name }, index) => {
      Shortcuts.register(
        window,
        {
          ...CommandOrControl,
          key: index + 1,
        },
        () => window.webContents.send('route', { name }),
        `switch preferences tabs ${ name }`,
      );
    });

    Shortcuts.register(
      window,
      {
        ...CommandOrControl,
        key: ']',
      },
      () => window.webContents.send('route', { direction: 'forward' }),
      'switch preferences tabs by cycle [forward]',
    );

    Shortcuts.register(
      window,
      {
        ...CommandOrControl,
        key: '[',
      },
      () => window.webContents.send('route', { direction: 'back' }),
      'switch preferences tabs by cycle [back]',
    );
  }

  window.webContents.on('ipc-message', (_event, channel) => {
    if (channel === 'preferences/load') {
      window.show();
    }
  });

  window.on('close', (event) => {
    if (!isDirty) {
      return;
    }

    const cancelPosition = 1;

    const result = dialog.showMessageBoxSync(
      window,
      {
        title:    'Rancher Desktop - Close Preferences',
        type:     'warning',
        message:  'Close preferences without applying?',
        detail:   'There are preferences with changes that have not been applied. All unsaved preferences will be lost.',
        cancelId: cancelPosition,
        buttons:  [
          'Discard changes',
          'Cancel',
        ],
      });

    if (result === cancelPosition) {
      event.preventDefault();
    }
  });

  app.dock?.show();
}

export function preferencesSetDirtyFlag(dirtyFlag: boolean) {
  isDirty = dirtyFlag;
}
