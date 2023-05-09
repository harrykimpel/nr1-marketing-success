import { COLORS } from './constants';
import { fetchNrqlResults } from './nrql';

/*
 * Fetch some node /link stuff via NRQL
 *   should have a better name...
 */
export const fetchRelationshipFacets = async (accountId, nrqlQuery, addThankYou, sourceEqTarget, nodeLevel, nodesLength) => {
  const nodesFetch = [];
  const linksFetch = [];

  if (accountId && nrqlQuery) {
    const results = await fetchNrqlResults(accountId, nrqlQuery);
    console.log('nrqlQuery: ' + nrqlQuery);
    console.log('fetch level: ' + nodeLevel);
    var valTotal = 0;

    if (results != undefined &&
      results.e != undefined &&
      results.e.results.length > 0) {

      console.log('fetch results: ' + JSON.stringify(results.e.results));
      console.log('fetch nodesLength: ' + nodesLength);
      var i = nodesLength;
      if (addThankYou) {
        i = 0;
      }
      results.e.results.forEach(row => {
        valTotal += row.value;
        console.log('fetch i: ' + i);
        //const id = nodesFetch.findIndex(node => node.display === row.value + " - " + row.facet && nodeLevel === row.level);
        //if (id < 0) {
        nodesFetch.push({
          color: COLORS[nodesFetch.length % COLORS.length],
          name: row.facet,
          value: row.value,
          //display: row.value + " - " + row.facet[0] + " - " + row.facet[0],
          display: row.value + " - " + row.facet,
          source: i,
          target: sourceEqTarget,
          level: nodeLevel,
          referer: row.facet.replace('https://newrelic.com', '')
        });
        i++
        //}
      })
    }
    else {
      console.log('no results');
    }

    if (addThankYou) {
      nodesFetch.push({
        name: 'Thank You',
        value: valTotal,
        display: valTotal + ' - Thank You',
        level: nodeLevel
      })

      i = 0;
      results.e.results.forEach(row => {
        linksFetch.push({
          color: nodesFetch[i].color,
          source: i,
          target: nodesFetch.length - 1,
          value: nodesFetch[i].value
        });
        i++;
      });
    }
    else {
      nodesFetch.forEach(node => {
        if (node.level == nodeLevel) {
          linksFetch.push({
            color: node.color,
            source: node.source,
            target: node.target,
            value: node.value
          });
        }
      });
    }
  }

  console.lo

  return { linksFetch, nodesFetch };
};