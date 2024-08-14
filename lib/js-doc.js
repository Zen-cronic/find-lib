/**
 * @typedef {Object} SearchOptions
 * @property {number} [size] - The size of the search.
 */

/**
 * @typedef {Object} TtlDepsOptions
 * @property {number} ttlDeps - The total dependencies of a lib, including nested.
 */

/**
 * @typedef {Object} FirstLayerOptions
 * @property {number} firstLayer - The number of dependencies in the 1st layer.
 */

/**
 * @typedef {TtlDepsOptions | FirstLayerOptions} DepOptions
 */

/**
 * @typedef {SearchOptions & DepOptions} FindOptions
 */
module.exports = {};
