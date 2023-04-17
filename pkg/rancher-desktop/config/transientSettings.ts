import _ from 'lodash';

import { RecursivePartial, RecursiveReadonly } from '@pkg/utils/typeUtils';

export const navItemNames = [
  'Application',
  'WSL',
  'Virtual Machine',
  'Container Engine',
  'Kubernetes',
] as const;

export type NavItemName = typeof navItemNames[number];

export const defaultTransientSettings = {
  noModalDialogs: false,
  preferences:    {
    navItem: {
      current:     'Application' as NavItemName,
      currentTabs: {
        Application:        'general',
        'Container Engine': 'general',
        ...(process.platform === 'win32' && { WSL: 'integration' }),
      } as Record<NavItemName, string | undefined>,
    },
  },
};
export type TransientSettings = typeof defaultTransientSettings;

class TransientSettingsImpl {
  private _value = _.cloneDeep(defaultTransientSettings);

  get value(): RecursiveReadonly<TransientSettings> {
    return this._value;
  }

  update(transientSettings: RecursivePartial<TransientSettings>) {
    _.merge(this._value, transientSettings);
  }
}

export const TransientSettings = new TransientSettingsImpl();
