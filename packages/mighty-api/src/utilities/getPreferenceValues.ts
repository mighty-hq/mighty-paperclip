export interface PreferenceValues {
  [key: string]: unknown;
}

export function getPreferenceValues<Values extends PreferenceValues = PreferenceValues>(): Values {
  return {} as Values;
}
