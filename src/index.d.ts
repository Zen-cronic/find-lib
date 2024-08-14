type SearchOptions = {
  /**
   * The size of the search.
   */
  size?: number;
};

type TtlDepsOptions = {
  /**
   * The total dependencies of a lib, including nested dependencies.
   */
  ttlDeps: number;
};

type FirstLayerOptions = {
  /**
   * The number of dependencies in the 1st layer.
   */
  firstLayer: number;
};

type DepOptions = TtlDepsOptions | FirstLayerOptions;
type FindOptions = SearchOptions & DepOptions;

declare function findLib(
  searchQuery: string,
  findOpts?: FindOptions
): Promise<void>;

export { findLib };
