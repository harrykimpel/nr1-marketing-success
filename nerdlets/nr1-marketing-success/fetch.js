import { COLORS } from './constants';
import { fetchNrqlResults } from './nrql';

/*
 * Fetch some node /link stuff via NRQL
 *   should have a better name...
 */
export const fetchRelationshipFacets = async (accountId, nrqlQuery, addThankYou, sourceEqTarget, nodeLevel) => {
  const nodesFetch = [];
  const linksFetch = [];

  if (accountId && nrqlQuery) {
    const results = await fetchNrqlResults(accountId, nrqlQuery);
    console.log('fetch level: ' + nodeLevel);
    var i = 0;
    if (results != undefined &&
      results.e != undefined &&
      results.e.results.length > 0) {
      results.e.results.forEach(row => {

        nodesFetch.push({
          color: COLORS[nodesFetch.length % COLORS.length],
          name: row.facet,
          value: row.value,
          source: i,
          target: sourceEqTarget,
          level: nodeLevel
        });
        i++
      })
    }

    if (addThankYou) {
      nodesFetch.push({
        name: 'Thank You'
      })
    }
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

  return { linksFetch, nodesFetch };
};