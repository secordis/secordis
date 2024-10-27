async function getLightspeedCategory(site) { // "reverse engineered" but really its just using a public api
  const query = `
      query getDeviceCategorization($itemA: CustomHostLookupInput!, $itemB: CustomHostLookupInput!) {
          a: custom_HostLookup(item: $itemA) {
              archive_info {
                  filter {
                      category
                  }
              }
          }
          b: custom_HostLookup(item: $itemB) {
              archive_info {
                  filter {
                      category
                  }
              }
          }
      }
  `;

  const variables = {
      itemA: { hostname: site, getArchive: true },
      itemB: { hostname: site, getArchive: true }
  };

  const categoryMap = {
      28: 'proxy',
      21: 'porn', 22: 'porn', 23: 'porn', 24: 'porn', 25: 'porn', 26: 'porn', 27: 'porn', 94: 'porn', 109: 'porn', 110: 'porn', 111: 'porn',
      13: 'games', 102: 'games', 74: 'games',
      3: 'ads', 35: 'ads', 39: 'ads',
      61: 'messaging',
      131: 'entertainment', 45: 'entertainment',
      33: 'security/malware', 62: 'security/malware', 63: 'security/malware', 65: 'security/malware', 72: 'security/malware', 125: 'security/malware', 134: 'security/malware',
      8: 'drugs',
      12: 'gambling',
      66: 'weapons'
  };

  try {
      const response = await fetch("https://production-archive-proxy-api.lightspeedsystems.com/archiveproxy", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'x-api-key': 'onEkoztnFpTi3VG7XQEq6skQWN3aFm3h'
          },
          body: JSON.stringify({ query, variables })
      });

      const data = await response.json();
      const cat = data.data.a.archive_info.filter.category;

      console.log(cat);
      return categoryMap[cat] || 'none';
  } catch (error) {
      console.error("Error in getLightspeedCategory:", error);
      return 'none';
  }
}