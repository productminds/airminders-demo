import { normalizeKeys, toGtmEventName } from "./naming"

/**
 * Amplitude Browser SDK 2 destination plugin that mirrors every processed
 * event into window.dataLayer (GTM). It sits at the end of the SDK timeline,
 * so it inherits the exact taxonomy — one event definition feeds both
 * Amplitude and every GTM-fed provider (GA4, media pixels).
 *
 * Why a destination plugin (not the track() promise callback): the plugin
 * runs in the same processing cycle as the event, with no wait for the batch
 * upload — so there is no added latency and no events lost on a network
 * failure. A push failure is isolated and never blocks the Amplitude send.
 *
 * Privacy: user_id and user_properties are withheld by default; opting them
 * in exposes them to every tag in the container and requires a legal basis.
 * A user opt-out (ampli.client.setOptOut(true)) halts the whole SDK timeline,
 * so the dataLayer stops receiving events at the same instant Amplitude does.
 *
 * @typedef {Object} DataLayerPluginOptions
 * @property {string} [dataLayerName] - global array name. Default "dataLayer".
 * @property {string} [namespace] - key the Amplitude payload sits under. Default "amplitude".
 * @property {string[]} [allowlist] - original taxonomy names to forward. Empty forwards all.
 * @property {boolean} [includeUserProperties] - expose user_properties. Default false.
 * @property {boolean} [includeUserId] - expose user_id. Default false.
 * @property {boolean} [normalizePropertyKeys] - snake_case property keys. Default true.
 * @property {(eventType: string) => string} [eventNameMapper] - override the GA4 name mapping.
 */
export class DataLayerDestinationPlugin {
  /**
   * @param {DataLayerPluginOptions} [options]
   */
  constructor(options = {}) {
    this.name = "gtm-datalayer-destination"
    this.type = "destination"

    this.dataLayerName = options.dataLayerName ?? "dataLayer"
    this.namespace = options.namespace ?? "amplitude"
    this.allowlist = new Set(options.allowlist ?? [])
    this.includeUserProperties = options.includeUserProperties ?? false
    this.includeUserId = options.includeUserId ?? false
    this.normalizePropertyKeys = options.normalizePropertyKeys ?? true
    this.eventNameMapper = options.eventNameMapper ?? toGtmEventName
  }

  async setup() {
    const host = this.host()
    if (host) {
      host[this.dataLayerName] = host[this.dataLayerName] || []
    }
  }

  /**
   * Called by the SDK for every processed event.
   * @param {import("@amplitude/analytics-browser").Types.Event} event
   * @returns {Promise<import("@amplitude/analytics-browser").Types.Result>}
   */
  async execute(event) {
    try {
      const host = this.host()
      if (!host) {
        return { event, code: 0, message: "skipped: no window (SSR)" }
      }
      if (!this.shouldForward(event)) {
        return { event, code: 200, message: "skipped: filtered" }
      }
      host[this.dataLayerName].push(this.buildPayload(event))
      return { event, code: 200, message: "pushed to dataLayer" }
    } catch (error) {
      return { event, code: 500, message: `dataLayer push failed: ${String(error)}` }
    }
  }

  /**
   * execute() runs for Identify, GroupIdentify and Revenue too. Reserved
   * event types (prefixed "$") and events outside the allowlist are dropped.
   * @param {import("@amplitude/analytics-browser").Types.Event} event
   * @returns {boolean}
   */
  shouldForward(event) {
    if (event.event_type.startsWith("$")) return false // $identify, $groupidentify
    if (this.allowlist.size > 0 && !this.allowlist.has(event.event_type)) return false
    return true
  }

  /**
   * @param {import("@amplitude/analytics-browser").Types.Event} event
   * @returns {Object.<string, *>}
   */
  buildPayload(event) {
    const props = event.event_properties ?? {}

    return {
      // GA4-normalized name drives GTM Custom Event triggers.
      event: this.eventNameMapper(event.event_type),
      [this.namespace]: {
        // Original taxonomy name kept for auditing/rastreabilidade (RF02).
        event_type: event.event_type,
        event_properties: this.normalizePropertyKeys ? normalizeKeys(props) : props,
        session_id: event.session_id,
        insert_id: event.insert_id,
        time: event.time,
        ...(this.includeUserProperties && {
          user_properties: event.user_properties ?? {},
        }),
        ...(this.includeUserId && { user_id: event.user_id }),
      },
      // Clears the previous event's keys so GA4 tags never read stale values.
      _clear: true,
    }
  }

  /**
   * @returns {(Window & Object.<string, *>) | null}
   */
  host() {
    return typeof window === "undefined" ? null : window
  }
}
