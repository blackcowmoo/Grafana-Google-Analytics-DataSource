import { DataSourceInstanceSettings, SelectableValue } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { GADataSourceOptions, GAQuery } from './types';

export class DataSource extends DataSourceWithBackend<GAQuery, GADataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<GADataSourceOptions>) {
    super(instanceSettings);
    console.log('instanceSettings', instanceSettings);
  }

  async getAccountIds(): Promise<Array<SelectableValue<string>>> {
    return this.getResource('accounts').then(({ accounts }) => {
      return accounts
        ? Object.entries(accounts).map(([value, label]) => ({ label, value } as SelectableValue<string>))
        : [];
    });
  }

  async getWebPropertyIds(accountId: string): Promise<Array<SelectableValue<string>>> {
    return this.getResource('web-properties', { accountId }).then(({ webProperties }) =>
      webProperties
        ? Object.entries(webProperties).map(([value, label]) => ({ label, value } as SelectableValue<string>))
        : []
    );
  }

  async getProfileIds(accountId: string, webPropertyId: string): Promise<Array<SelectableValue<string>>> {
    return this.getResource('profiles', { accountId, webPropertyId }).then(({ profiles }) => {
      return profiles
        ? Object.entries(profiles).map(([value, label]) => ({ label, value } as SelectableValue<string>))
        : [];
    });
  }

  async getDimensions(): Promise<Array<SelectableValue<string>>> {
    return this.getResource('dimensions').then(({ dimensions }) => {
      return dimensions
        ? dimensions.map((dimension: any) => {
            return {
              label: dimension.id + ' ' + dimension.attributes.description,
              value: dimension.id,
            } as SelectableValue<string>;
          })
        : [];
    });
  }

  async getMetrics(): Promise<Array<SelectableValue<string>>> {
    return this.getResource('metrics').then(({ metrics }) => {
      return metrics
        ? metrics.map((metric: any) => {
            return {
              label: metric.id + ' ' + metric.attributes.description,
              value: metric.id,
            } as SelectableValue<string>;
          })
        : [];
    });
  }
}
