import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { AsyncMultiSelect, InlineFormLabel, InlineLabel, SegmentAsync } from '@grafana/ui';
import { DataSource } from 'DataSource';
import React, { PureComponent } from 'react';
import { GADataSourceOptions, GAQuery } from 'types';

type Props = QueryEditorProps<DataSource, GAQuery, GADataSourceOptions>;

const defaultCacheDuration = 300;

export class QueryEditor extends PureComponent<Props> {
  constructor(props: Readonly<Props>) {
    super(props);
    if (!this.props.query.hasOwnProperty('cacheDurationSeconds')) {
      this.props.query.cacheDurationSeconds = defaultCacheDuration;
    }
  }

  onProfileIdChange = (item: any) => {
    const {
      query,
      query: { metrics, dimensions, accountId, webPropertyId },
      onChange,
      datasource,
    } = this.props;
    const profileId = item.value as string;

    if (profileId) {
      datasource.getProfileTimezone(accountId, webPropertyId, profileId).then((timezone) => {
        const { query, onChange } = this.props;
        console.log(`timezone`, timezone);
        onChange({ ...query, timezone });
        this.willRunQuery(profileId, metrics, dimensions);
      });
    }
    onChange({ ...query, profileId });
    this.willRunQuery(profileId, metrics, dimensions);
  };

  onAccountIdChange = (item: any) => {
    const {
      query,
      query: { profileId, metrics, dimensions },
      onChange,
    } = this.props;
    let accountId = item.value;

    onChange({ ...query, accountId });
    this.willRunQuery(profileId, metrics, dimensions);
  };

  onWebPropertyIdChange = (item: any) => {
    const {
      query,
      query: { profileId, metrics, dimensions },
      onChange,
    } = this.props;
    let webPropertyId = item.value;

    onChange({ ...query, webPropertyId });
    this.willRunQuery(profileId, metrics, dimensions);
  };

  onMetricChange = (items: Array<SelectableValue<string>>) => {
    const {
      query,
      query: { profileId, dimensions },
      onChange,
    } = this.props;

    let metrics = [] as string[];
    items.map((item) => {
      if (item.value) {
        metrics.push(item.value);
      }
    });
    console.log(`metrics`, metrics);

    onChange({ ...query, selectedMetrics: items, metrics });
    this.willRunQuery(profileId, metrics, dimensions);
  };

  onDimensionChange = (items: Array<SelectableValue<string>>) => {
    const {
      query,
      query: { profileId, metrics },
      onChange,
    } = this.props;
    let dimensions = [] as string[];
    items.map((item) => {
      if (item.value) {
        dimensions.push(item.value);
      }
    });

    console.log(`dimensions`, dimensions);

    onChange({ ...query, selectedDimensions: items, dimensions });
    this.willRunQuery(profileId, metrics, dimensions);
  };

  willRunQuery = (profileId: string, metrics: string[], dimensions: string[]) => {
    const { query, onRunQuery } = this.props;
    console.log(`willRunQuery`);
    console.log(`query`, query);
    if (profileId && metrics && dimensions) {
      console.log(`onRunQuery`);
      onRunQuery();
    }
  };

  render() {
    const { query, datasource } = this.props;
    const { accountId, webPropertyId, profileId, selectedMetrics, selectedDimensions, timezone } = query;
    return (
      <>
        <div className="gf-form-group">
          <div className="gf-form">
            <InlineFormLabel
              width={8}
              className="query-keyword"
              tooltip={
                <>
                  The <code>accountId</code> is used to identify which GoogleAnalytics is to be accessed or altered.
                </>
              }
            >
              Account ID
            </InlineFormLabel>
            <SegmentAsync
              loadOptions={() => datasource.getAccountIds()}
              placeholder="Enter Account ID"
              width={6}
              value={accountId}
              allowCustomValue
              onChange={this.onAccountIdChange}
            />
            <InlineFormLabel
              width={8}
              className="query-keyword"
              tooltip={
                <>
                  The <code>webPropertyId</code> is used to identify which GoogleAnalytics is to be accessed or altered.
                </>
              }
            >
              Web Property ID
            </InlineFormLabel>
            <SegmentAsync
              loadOptions={() => datasource.getWebPropertyIds(accountId)}
              placeholder="Enter Web Property ID"
              value={webPropertyId}
              allowCustomValue
              onChange={this.onWebPropertyIdChange}
            />
            <InlineFormLabel
              className="query-keyword"
              width={8}
              tooltip={
                <>
                  The <code>profileId</code> is used to identify which GoogleAnalytics is to be accessed or altered.
                </>
              }
            >
              Profile ID
            </InlineFormLabel>
            <SegmentAsync
              loadOptions={() => datasource.getProfileIds(accountId, webPropertyId)}
              placeholder="Enter Profile ID"
              value={profileId}
              allowCustomValue
              onChange={this.onProfileIdChange}
            />
            <InlineLabel className="query-keyword" width={'auto'} tooltip={<>GA timeZone</>}>
              Timezone
            </InlineLabel>
            <InlineLabel width="auto">{timezone ? timezone : 'determined by profileId'}</InlineLabel>
            <div className="gf-form-label gf-form-label--grow" />
          </div>
          <div className="gf-form">
            <InlineFormLabel
              className="query-keyword"
              width={10}
              tooltip={
                <>
                  The <code>metric</code> ga:*
                </>
              }
            >
              Metrics
            </InlineFormLabel>
            <AsyncMultiSelect
              loadOptions={(q) => datasource.getMetrics(q)}
              placeholder={'ga:sessions'}
              value={selectedMetrics}
              onChange={this.onMetricChange}
              backspaceRemovesValue
              cacheOptions
              noOptionsMessage={'Search Metrics'}
              defaultOptions
            />
          </div>

          <div className="gf-form">
            <InlineFormLabel
              className="query-keyword"
              width={10}
              tooltip={
                <>
                  The <code>dimensions</code> At least one ga:date* is required.
                </>
              }
            >
              Dimensions
            </InlineFormLabel>
            <AsyncMultiSelect
              loadOptions={(q) => datasource.getDimensions(q)}
              placeholder={'ga:dateHour'}
              value={selectedDimensions}
              onChange={this.onDimensionChange}
              backspaceRemovesValue
              cacheOptions
              noOptionsMessage={'Search Dimension'}
              defaultOptions
            />
          </div>
        </div>
      </>
    );
  }
}
