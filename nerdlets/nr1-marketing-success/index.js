import React from 'react';
import { PlatformStateContext, NerdGraphQuery, Spinner, HeadingText, Grid, GridItem, Stack, StackItem, Select, SelectItem, AreaChart, TableChart, PieChart, Modal } from 'nr1'
import { Sankey } from 'react-vis';
import { fetchRelationshipFacets } from './fetch';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

const INTERVAL_SECONDS_DEFAULT = 30;
const INTERVAL_SECONDS_MIN = 3;
const INTERVAL_SECONDS_MAX = 60;
const NRQL_QUERY_LIMIT_DEFAULT = 50;
const SUB_MENU_HEIGHT = 45;
const BLURRED_LINK_OPACITY = 0.3;
const FOCUSED_LINK_OPACITY = 0.8;
const height = 2000;
const width = 1400;
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

export default class Nr1MarketingCampaignsNerdlet extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      activeLink: null,
      detailData: null,
      detailHidden: true,
      filterPrivateAsns: true,
      height: height - SUB_MENU_HEIGHT - 10,
      isLoading: true,
      links: [],
      nodes: [],
      peerBy: 'peerName',
      width: width,
      accountId: 1202289,
      accounts: null,
      selectedAccount: null,
      hideLabels: false
    };

    this.handleDetailClose = this.handleDetailClose.bind(this);
    this.handleSankeyLinkClick = this.handleSankeyLinkClick.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.fetchData2 = this.fetchData2.bind(this);
  }

  async componentDidMount() {
    //this.startTimer();
    var i = 0;
    await this.fetchData(i);
    await sleep(2000);
    i++;
    await this.fetchData2(i);
    await sleep(2000);
    i++;
    await this.fetchData2(i);
    await sleep(2000);
    i++;
    await this.fetchData2(i);
    /*await sleep(2000);
    i++;
    await this.fetchData2(i);*/
  }

  componentDidUpdate(prevProps, prevState) {
    /*if (this.graphContainer && this.graphContainer.clientWidth !== prevState.width) {
      const width = this.graphContainer.clientWidth;
      this.setState({ width });
    }*/
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  createNrqlQuery(url, client_ip) {
    return (
      `{
        actor {
          account(id: 1202289) {
            e: nrql(
              query: "FROM Metric SELECT uniqueCount(fastly.log.marketing.msgcount) as 'value' where metricName = 'fastly.log.marketing.msgcount' and  url like '`+ url + `' ` + client_ip + ` and request_referer not like '%staging-%' and request_referer not like 'https://%zoom.us/' and request_referer not like '' facet request_referer, client_ip limit 20 since 1 day ago"
            ) {
              results
            }
          }
        }
      }`
    );
  }

  async fetchData(level) {
    console.log('fetchData');

    const { accountId } = this.state;
    var nrql = this.createNrqlQuery('%thank-you%', '');
    //console.log('nrql: '+nrql)
    var { nodesFetch, linksFetch } = await fetchRelationshipFacets(accountId, nrql, true, -1, level);

    this.setState({
      isLoading: true,
      links: linksFetch,
      nodes: nodesFetch
    });
  }

  async fetchData2(level) {
    console.log('fetchData2');

    const { accountId, links, nodes } = this.state;

    var x = 0;
    nodes.forEach(async (node) => {
      if (node.level == level - 1) {
        var nrql = this.createNrqlQuery(node.name[0].replace('https://newrelic.com', ''), " and client_ip = '" + node.name[1] + "' ");
        var nodesRoot = nodes;
        var linksRoot = links;
        const { nodesFetch, linksFetch } = await fetchRelationshipFacets(accountId, nrql, false, node.source, level);

        if (nodesFetch != undefined &&
          nodesFetch.length > 0) {

          var i = nodesRoot.length;
          nodesFetch.forEach(node2 => {
            nodesRoot.push(node2);

            linksRoot.push({
              color: node2.color,
              source: i,
              target: node2.source,
              value: node2.value
            });
            i++
          })
        }

        this.setState({
          isLoading: true,
          links: linksRoot,
          nodes: nodesRoot
        });

        x++;
        if (level == 2) {
          console.log('nodesRoot (' + nodesRoot.length + '): ' + JSON.stringify(nodesRoot));
          console.log('linksRoot (' + linksRoot.length + '): ' + JSON.stringify(linksRoot));
        }
      }
    })
  }

  startTimer() {
    const { intervalSeconds } = INTERVAL_SECONDS_DEFAULT;

    if (intervalSeconds >= INTERVAL_SECONDS_MIN) {
      this.fetchData();
      this.fetchData2();

      this.refresh = setInterval(async () => {
        this.fetchData();
        this.fetchData2();
      }, intervalSeconds * 1000);
    }
  }

  stopTimer() {
    if (this.refresh) clearInterval(this.refresh);
  }

  async resetTimer() {
    await this.setState({ isLoading: true });
    this.stopTimer();
    this.startTimer();
  }

  handleSankeyLinkClick(detailData, evt) {
    //this.setState({ detailData, detailHidden: false });
  }

  handleDetailClose() {
    this.setState({ detailHidden: true });
  }

  renderDetailCard() {
    const account = this.props.account || {};
    const { hideLabels } = this.props;
    const { detailData, detailHidden, filterPrivateAsns, nodes, peerBy } = this.state;

    if (!account || !detailData || detailHidden) return;

    return (
      <Modal hidden={detailHidden} onClose={this.handleDetailClose}>
        <div className='modal'>
          {JSON.stringify(detailData)}
        </div>
      </Modal>
    );
  }

  render() {
    const { accountId, accounts, selectedAccount, links, nodes, isLoading, hideLabels, activeLink } = this.state;
    //console.log({ accountId, accounts, selectedAccount });

    // Add link highlighting
    const renderLinks = links.map((link, linkIndex) => {
      let opacity = BLURRED_LINK_OPACITY;

      if (activeLink) {
        // I'm the hovered link
        if (linkIndex === activeLink.index) {
          opacity = FOCUSED_LINK_OPACITY;
        } else {
          // let's recurse
          const myLinks = [
            ...((activeLink.source || {}).targetLinks || []),
            ...((activeLink.target || {}).sourceLinks || []),
          ];
          if (myLinks) {
            myLinks.forEach(t => {
              if (t.index === linkIndex && t.sourceId === activeLink.sourceId)
                opacity = FOCUSED_LINK_OPACITY;
            });
          }
        }
      }

      return { ...link, opacity };
    });

    const renderNodes = hideLabels ? nodes.map((n, idx) => ({ ...n, name: `${idx}` })) : nodes;

    return (
      <Stack
        fullWidth
        horizontalType={Stack.HORIZONTAL_TYPE.FILL}
        gapType={Stack.GAP_TYPE.EXTRA_LOOSE}
        spacingType={[Stack.SPACING_TYPE.MEDIUM]}
        directionType={Stack.DIRECTION_TYPE.VERTICAL}>
        <StackItem>
          {this.renderDetailCard()}
          <Sankey
            height={height - 30}
            links={renderLinks}
            nodes={renderNodes}
            onLinkClick={this.handleSankeyLinkClick}
            onLinkMouseOut={() => this.setState({ activeLink: null })}
            onLinkMouseOver={node => this.setState({ activeLink: node })}
            width={width}
          />
        </StackItem>
      </Stack>)
  }
}