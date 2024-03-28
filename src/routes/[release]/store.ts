
  // DEFAULTS
  let count = 40;
  let pathPrefix = false;
  let moreFilters = false;

  let search = "";
  let term = writable("");
  $: term.set(search.trim());

  let scope = "";
  let state = writable("");
  $: state.set(scope);

  let platformSearch = "";
  let platFind = writable("");
  $: platFind.set(platformSearch.trim());

  let featureSearch = "";
  let featFind = writable("");
  $: featFind.set(featureSearch.trim());

  // INTERNAL FUNCTIONS
  const scopeChange = (val: string) => scope = val;
  const spaceSplit = (str: string) => str.split(/\s+/);

  const getState = (x: PathDef) => ('is-state' in x ? "true" : "false");
  const getPath = (x: PathDef) => (pathPrefix ? x["path-with-prefix"] : x["path"])
  const getEnumValues = (x: PathDef) => ('enum-values' in x ? x["enum-values"].join(",") : '')
  const getSearchKeys = (str: string) => spaceSplit(str).join("|")

  const pathClearToTree = (str: string) => str.replaceAll("=*", "").replace("<mark>", "").replace("</mark>", "");

  // WRITABLE STORES
  let start = writable(0);
  let yangPaths = writable(paths);

  let platformStore = writable(Object.keys(platforms));
  let featureStore = writable(uniqueFeatures);

  // DERIVED STORES
  let platList = derived([platFind, platformStore],  ([$platFind, $platformStore]) => $platformStore.filter((x: string) => x.includes($platFind)));
  let featList = derived([featFind, featureStore],  ([$featFind, $featureStore]) => $featureStore.filter((x: string) => x.includes($featFind)));

  let platSelect = writable("7220-IXR-D2L");
  let featSelect = derived(platSelect, ($platSelect: string) => $platSelect != "" ? platforms[$platSelect]: []);
  
  let stateFilter = derived([state, yangPaths], ([$state, $yangPaths]) => $yangPaths.filter((x: any) => $state == "" ? true : getState(x) == $state));
  let yangFilter = derived([term, stateFilter],  ([$term, $stateFilter]) => $stateFilter.filter((x: any) => searchBasedYangFilter(x, $term, pathPrefix)));

  let platFeatYangFilter = derived([featSelect, yangFilter],  ([$featSelect, $yangFilter]) => $yangFilter.filter((x: any) => featureBasedYangFilter(x, $featSelect)));

  let total = derived(platFeatYangFilter, ($platFeatYangFilter) => {start.set(0); return $platFeatYangFilter.length});
  let end = derived([start, total], ([$start, $total]) => ($start + count) <= $total ? ($start + count) : $total);

  let paginated = derived([start, end, platFeatYangFilter], ([$start, $end, $platFeatYangFilter]) => $platFeatYangFilter.slice($start, $end));

  // UPDATE TABLE PAGINATION
  const updateTable = (s: number) => {if(s >= 0 && s < $total) start.set(s)}
