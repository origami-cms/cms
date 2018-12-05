export type JSONArray = { [key: string]: any }[];

/**
 * Converts a JSON array to a HTML table string
 * @param json JSON array
 */
export const arrayToTable = (json: JSONArray): string => {
  if (!json[0]) return '';
  const cols = Object.keys(json[0]);

  return `<table>
  <thead>
    <tr>${cols
      .map((col) => `<th>${col.charAt(0).toUpperCase() + col.slice(1)}</th>`)
      .join('')}</tr>
  </thead>
  <tbody>${json
    .map(
      (row) => `
    <tr>${cols.map((colName) => `<td>${row[colName]}</td>`).join('')}</tr>`
    )
    .join('')}
  </tbody>
</table>`;
};

/**
 * Converts a JSON object to a HTML table string
 * @param json JSON Object
 */
export const objectToTable = (json: object): string => {
  if (!json) return '';

  return `<table>
  <tbody>${Object.entries(json)
    .map(
      ([key, val]) => `
    <tr><td>${key.charAt(0).toUpperCase() +
      key.slice(1)}</td><td>${val}</td></tr>`
    )
    .join('')}
  </tbody>
</table>`;
};

/**
 * Converts a JSON Array or Object to HTML table string
 * @param json JSON Array or object
 */
export const jsonToTable = (json: object | JSONArray): string => {
  if (json instanceof Array) return arrayToTable(json);
  else return objectToTable(json);
};
