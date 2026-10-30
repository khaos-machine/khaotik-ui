// The on-device models khaosd holds (GET /api/v1/models), as Settings › Models lists them.
// Moved from Khaos App's src/app/model-table.ts (catalog app-coverage plan, T9).
import { formatBytes } from './bytes.js'

/**
 * One model as khaosd reports it. `service` is the on-device engine that loads it; `enables`
 * the capability it turns on, in the engine's words; `sizeBytes` 0 when not installed.
 * @typedef {Object} LocalModel
 * @property {string} id
 * @property {string} name
 * @property {string} kind
 * @property {string} service
 * @property {string} enables
 * @property {string} repo
 * @property {string} revision
 * @property {boolean} installed
 * @property {number} sizeBytes
 * @property {string} location
 * @property {'downloading' | 'failed'} [download] Absent when idle.
 * @property {string} [downloadError] With `failed`: the download tool's own last line.
 */

/**
 * One model as Settings › Models lists it. `size` is '' when it is not on disk: khaosd reports
 * no size before a download.
 * @typedef {Object} ModelRow
 * @property {string} id
 * @property {string} name
 * @property {string} repo
 * @property {string} usedFor
 * @property {string} size
 * @property {'installed' | 'available' | 'downloading' | 'failed'} state
 * @property {string} error With `failed`: the download tool's own last line.
 */

/** @typedef {{ service: string, title: string, rows: readonly ModelRow[] }} ModelGroup */

/** @param {LocalModel} model @returns {ModelRow} */
export function modelRow(model) {
  return {
    id: model.id,
    name: model.name,
    repo: model.repo,
    usedFor: model.enables,
    size: model.installed && model.sizeBytes > 0 ? formatBytes(model.sizeBytes) : '',
    state: model.download === 'downloading' ? 'downloading' : model.download === 'failed' ? 'failed' : model.installed ? 'installed' : 'available',
    error: model.download === 'failed' ? (model.downloadError ?? 'khaosd reported the download failed and gave no reason.') : '',
  }
}

/**
 * Models grouped by the engine that loads them, in the order khaosd listed them. A group
 * explains why several models of one kind are there: each engine needs its own.
 * @param {readonly LocalModel[]} models @param {(service: string) => string} engineName @returns {ModelGroup[]}
 */
export function modelGroups(models, engineName) {
  const services = [...new Set(models.map((model) => model.service))]
  return services.map((service) => ({
    service,
    title: engineName(service) || service,
    rows: models.filter((model) => model.service === service).map(modelRow),
  }))
}

/** The folder every model sits under, with the home folder as `~`, or '' when they differ. @param {readonly LocalModel[]} models */
export function storageFolder(models) {
  const paths = models.map((model) => model.location).filter((path) => path)
  if (paths.length === 0) return ''
  // khaosd keeps a model at <cache>/models--<owner>--<name>/snapshots/<revision>.
  const roots = new Set(paths.map((path) => path.replace(/\/models--[^/]+\/.*$/, '')))
  if (roots.size !== 1) return ''
  const [root] = [...roots]
  return (root ?? '').replace(/^\/Users\/[^/]+/, '~')
}

/** Total size on disk of the models that are there. @param {readonly LocalModel[]} models */
export function installedSize(models) {
  const bytes = models.filter((model) => model.installed).reduce((sum, model) => sum + model.sizeBytes, 0)
  return bytes > 0 ? formatBytes(bytes) : ''
}
