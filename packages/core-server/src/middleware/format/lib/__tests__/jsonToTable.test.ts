import { arrayToTable, jsonToTable, objectToTable } from '../jsonToTable';

const arrayTable = {
  data: [
    { name: 'Bob', age: 25 },
    { name: 'Sarah', age: 50 }
  ],
  html: `
<table>
  <thead>
    <tr><th>Name</th><th>Age</th></tr>
  </thead>
  <tbody>
    <tr><td>Bob</td><td>25</td></tr>
    <tr><td>Sarah</td><td>50</td></tr>
  </tbody>
</table>`.trim()
};

const objectTable = {
  data: { name: 'Bob', age: 25 },
  html: `
<table>
  <tbody>
    <tr><td>Name</td><td>Bob</td></tr>
    <tr><td>Age</td><td>25</td></tr>
  </tbody>
</table>`.trim()
};

describe('core-server.jsonToTable.arrayToTable', () => {
  it('should return blank string if no data', () => {
    const html = arrayToTable([]);
    expect(html).toEqual('');
  });

  it('should render table', () => {
    const html = arrayToTable(arrayTable.data);
    expect(html).toEqual(arrayTable.html);
  });

  it('should render with capitalized column names', () => {
    const html = arrayToTable(arrayTable.data);
    expect(/<th>([^<]*)<\/th>/.exec(html)![1]).toEqual('Name');
  });
});


describe('core-server.jsonToTable.objectToTable', () => {
  it('should return blank string if no data', () => {
    // @ts-ignore Force error
    const html = objectToTable();
    expect(html).toEqual('');
  });

  it('should render table', () => {
    const html = objectToTable(objectTable.data);
    expect(html).toEqual(objectTable.html);
  });

  it('should render with capitalized column names', () => {
    const html = objectToTable(objectTable.data);
    expect(/<td>([^<]*)<\/td>/.exec(html)![1]).toEqual('Name');
  });
});


describe('core-server.jsonToTable.jsonToTable', () => {
  it('should return array table if array is passed', () => {
    const html = jsonToTable(arrayTable.data);
    expect(html).toEqual(arrayTable.html);
  });

  it('should render table', () => {
    const html = jsonToTable(objectTable.data);
    expect(html).toEqual(objectTable.html);
  });
});
