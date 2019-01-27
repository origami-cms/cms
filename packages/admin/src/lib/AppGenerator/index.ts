import AppPageGenerator from './AppPageGenerator';

// tslint:disable
export default new class AppGenerator {
  private _cache: string[] = [];

  public generate(appName: string, pageName: string, content: string, scripts: string[] = []) {
    const page = pageName.split('.')[0].replace(/[^\w]/, '-');
    const tagName = `app-${appName}-page-${page}`;

    if (this._cache.includes(tagName)) return tagName;

    const genPage = AppPageGenerator(tagName, content, scripts);
    this._cache.push(genPage);

    return genPage;
  }
}();
