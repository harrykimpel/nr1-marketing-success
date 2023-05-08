import React from 'react';
import { PlatformStateContext, NerdGraphQuery, Spinner, HeadingText, Grid, GridItem, Stack, StackItem, Select, SelectItem, AreaChart, TableChart, PieChart } from 'nr1'
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
const height = 1000;
const width = 1000;

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
    await this.fetchData();
    this.fetchData2();
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
              query: "FROM Metric SELECT uniqueCount(fastly.log.marketing.msgcount) as 'value' where metricName = 'fastly.log.marketing.msgcount' and  url like '`+url+`' `+client_ip+` and request_referer not like '%staging-%' and request_referer not like 'https://%zoom.us/' and request_referer not like '' facet request_referer, client_ip limit 20 since 1 day ago"
            ) {
              results
            }
          }
        }
      }`
    );
  }
  
  async fetchData() {
    console.log('fetchData');

    const { accountId } = this.state;
    var nrql = this.createNrqlQuery('%thank-you%', '');
    //console.log('nrql: '+nrql)
    var { nodesFetch, linksFetch } = await fetchRelationshipFacets(accountId, nrql, true, -1);

    //console.log('nodes ('+nodesFetch.length+'): ' + JSON.stringify(nodesFetch));
    //console.log('links ('+linksFetch.length+'): '+JSON.stringify(linksFetch));

    this.setState({
      isLoading: true,
      links: linksFetch,
      nodes: nodesFetch
    });

    //for (let x = 0; x < nodes.length - 1; x++) {
    /*var x = 0;
    nodesFetch.forEach(node => {
      //console.log('node: '+node);
      nrql = this.createNrqlQuery(node.name[0].replace('https://newrelic.com', ''), " and client_ip = '"+node.name[1]+"' ");
      //console.log('nrql: '+nrql)
      const { links, nodes } = this.state;
      var nodesRoot = nodes;
      var linksRoot = links;
      const { nodesFetch, linksFetch } = fetchRelationshipFacets(accountId, nrql, false, node.source);
      console.log('nodesSub ('+nodesFetch.length+'): ' + JSON.stringify(nodesFetch));
      //nodesState.push(nodes2);
      nodesRoot.push(nodesFetch);

      /*this.setState({
        isLoading: true,
        links,
        nodesx: nodes
      });*/

      /*if (nodesFetch != undefined) {
        console.log('nodes2 ('+nodesFetch.length+'): '+JSON.stringify(nodesFetch));
        console.log('links2 ('+linksFetch.length+'): '+JSON.stringify(linksFetch));
    
        var i = nodesRoot.length;
        nodesFetch.forEach(node2 => {
          //nodes.push(node2);
          linksRoot.push({
            color: node2.color,
            source: i,
            //sourceId: ids[0],
            //target: ids[x + 1],
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
    })*/

    //console.log('nodes ('+nodesFetch.length+'): ' + JSON.stringify(nodesFetch));
    //console.log('links ('+linksFetch.length+'): '+JSON.stringify(linksFetch));
    
    /*const nodes = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
const links = [
  {source: 0, target: 1, value: 10},
  {source: 0, target: 2, value: 20},
  {source: 1, target: 2, value: 20}
];*/
    
  


  }

  async fetchData2() {
    console.log('fetchData2');

    const { accountId, links, nodes } = this.state;
    //console.log('nodesSubRoot ('+nodes.length+'): ' + JSON.stringify(nodes));

    //for (let x = 0; x < nodes.length - 1; x++) {
    var x = 0;
    nodes.forEach(async (node) => {
      //console.log('node: '+node);
      var nrql = this.createNrqlQuery(node.name[0].replace('https://newrelic.com', ''), " and client_ip = '"+node.name[1]+"' ");
      //console.log('nrql: '+nrql)
      //const { links, nodes } = this.state;
      var nodesRoot = nodes;
      var linksRoot = links;
      const { nodesFetch, linksFetch } = await fetchRelationshipFacets(accountId, nrql, false, node.source);
      //console.log('nodesSub ('+nodesFetch.length+'): ' + JSON.stringify(nodesFetch));
      //nodesState.push(nodes2);

      /*this.setState({
        isLoading: true,
        links,
        nodesx: nodes
      });*/

      if (nodesFetch != undefined &&
        nodesFetch.length > 0) {
        //nodesRoot.push(nodesFetch);
        //console.log('nodes2 ('+nodesFetch.length+'): '+JSON.stringify(nodesFetch));
        //console.log('links2 ('+linksFetch.length+'): '+JSON.stringify(linksFetch));
    
        var i = nodesRoot.length;
        nodesFetch.forEach(node2 => {
          nodesRoot.push(node2);
          
          linksRoot.push({
            color: node2.color,
            source: i,
            //sourceId: ids[0],
            //target: ids[x + 1],
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
      console.log('nodesRoot ('+nodesRoot.length+'): ' + JSON.stringify(nodesRoot));
      console.log('linksRoot ('+linksRoot.length+'): '+JSON.stringify(linksRoot));
    })

    
    /*const nodes = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
const links = [
  {source: 0, target: 1, value: 10},
  {source: 0, target: 2, value: 20},
  {source: 1, target: 2, value: 20}
];*/
    
  


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

  render() {
    const { accountId, accounts, selectedAccount, links, nodes, isLoading, hideLabels, activeLink } = this.state;
    //console.log({ accountId, accounts, selectedAccount });
    
    const query = `
            query($id: Int!) {
                actor {
                    account(id: $id) {
                        name
                    }
                }
            }
        `;
    
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
    
    const variables = {
          id: accountId,
    };

    return (
      <Stack
        fullWidth
        horizontalType={Stack.HORIZONTAL_TYPE.FILL}
        gapType={Stack.GAP_TYPE.EXTRA_LOOSE}
        spacingType={[Stack.SPACING_TYPE.MEDIUM]}
        directionType={Stack.DIRECTION_TYPE.VERTICAL}>
        <StackItem>
          <h1>Hello Harry, welcome to nr1-marketing-success Nerdlet!</h1>
          <NerdGraphQuery query={query} variables={variables}>
            {({ loading, error, data }) => {
              if (loading) {
                return <Spinner />;
              }

              if (error) {
                return 'Error!';
              }

              return <><HeadingText>{data.actor.account.name} Apps:</HeadingText>
                <Sankey
                  height={height - 30}
                  links={renderLinks}
                  nodes={renderNodes}
                  onLinkClick={this.handleSankeyLinkClick}
                  onLinkMouseOut={() => this.setState({ activeLink: null })}
                  onLinkMouseOver={node => this.setState({ activeLink: node })}
                  width={width}
                /></>;
            }}
          </NerdGraphQuery>
        </StackItem>
      </Stack>)
  }
}
