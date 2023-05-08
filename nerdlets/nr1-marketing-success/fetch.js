import { COLORS } from './constants';
import { fetchNrqlResults } from './nrql';

export const fetchRelationshipFacets = async (accountId, nrqlQuery, addThankYou, sourceEqTarget) => {
  const nodesFetch = [];
  const linksFetch = [];

  if (accountId && nrqlQuery) {
    const results = await fetchNrqlResults(accountId, nrqlQuery);

      var i = 0;
      results.e.results.forEach(row => {
          // Collect nodes
          //const ids = (row.facet || []).map(f => {
              //const id = nodes.findIndex(node => node.name === f);
              //if (id < 0)
                  //return (
                    nodesFetch.push({
          color: COLORS[nodesFetch.length % COLORS.length],
          name: row.facet,
          value: row.value,
          source: i,
          target: sourceEqTarget
        });// - 1
                  //);

              //return id;
          //});
          i++
      })

      if (addThankYou) {
        nodesFetch.push({
              //color: COLORS[nodes.length % COLORS.length],
              name: 'Thank You'
            })
          }
      //const value = row.value;
      // Sum all from this source
      //nodes[ids[0]].value += value;

      // Update existing links (0 => 1 => 2 etc)
         i = 0;
      //for (let x = 0; x < ids.length - 1; x++) {
        //var i = 0;
      results.e.results.forEach(row => {
          /*const sa = links.findIndex(link => link.source === ids[x] && link.target === ids[x + 1]);
          if (sa >= 0) {
            //links[sa].value += value;
          } else {*/
          linksFetch.push({
              color: nodesFetch[i].color,
              source: i,
              //sourceId: ids[0],
              //target: ids[x + 1],
              target: nodesFetch.length - 1,
              value: nodesFetch[i].value
          });
          i++;
      });
          /*links.push({
              color: nodes[ids[0]].color,
                source: i,
                target: nodes.length -1,
                value: row['Thank You']

            })*/
          //);

         //i++;
      //}
    //});
  }
    
  return { linksFetch, nodesFetch };
};

/*
 * Fetch some node /link stuff via NRQL
 *   should have a better name...
 */
export const fetchRelationshipFacetsNew = async (accountId, nrqlQuery) => {
  const nodes = [];
  const links = [];

  if (accountId && nrqlQuery) {
    const results = await fetchNrqlResults(accountId, nrqlQuery);
    //console.log('fetchData.results: '+JSON.stringify(results));

      results.e.results.forEach(row => {
          const ids = (row.facet || []).map(f => {
              const id = nodes.findIndex(node => node.name === f);
              console.log('id: ' + id);
              // Collect nodes
              //const ids = (row.facet || []).map(f => {
              //const id = nodes.findIndex(node => node.name === f);
              if (id < 0)
              return (
              nodes.push({
                  //color: COLORS[nodes.length % COLORS.length],
                  name: row.facet
              }))
                  
            return id;
          });

        //return id;
    });

            nodes.push({
              //color: COLORS[nodes.length % COLORS.length],
              name: 'Thank You'
            })
      
      var i = 0;
      results.e.results.forEach(row => {
      // Collect nodes
      //const ids = (row.facet || []).map(f => {
        //const id = nodes.findIndex(node => node.name === f);
        //if (id < 0)
          //return (
            links.push({
              //color: COLORS[nodes.length % COLORS.length],
                source: i,
                target: nodes.length -1,
                value: row['Thank You']

            })
          //);

          i++;
        //return id;
    });

      /*const value = row.value;
      // Sum all from this source
      nodes[ids[0]].value += value;

      // Update existing links (0 => 1 => 2 etc)
      for (let x = 0; x < ids.length - 1; x++) {
        const sa = links.findIndex(link => link.source === ids[x] && link.target === ids[x + 1]);
        if (sa >= 0) {
          links[sa].value += value;
        } else {
          links.push({
            color: nodes[ids[0]].color,
            source: ids[x],
            sourceId: ids[0],
            target: ids[x + 1],
            value,
          });
        }
      }
    };*/
      
  }

  return { links, nodes };
};