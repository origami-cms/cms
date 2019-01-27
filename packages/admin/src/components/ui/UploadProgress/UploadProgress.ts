import { customElement, html, LitElement, property, svg } from 'lit-element';
import CSS from './upload-progress-css';

@customElement('ui-upload-progress')
export class UploadProgress extends LitElement {
  public static styles = [CSS];

  @property()
  public progress: number = 0;

  @property()
  public stroke: string = 'var(--color-main)';

  @property({type: Number})
  public strokeWidth: number = 2;

  private readonly _radius = 50;
  private readonly _startAngle = 0;


  public render() {
    // tslint:disable-next-line no-magic-numbers
    const angle = this.progress / 100 * 360;
    return html`
      <svg viewBox=${`0 0 ${this._radius * 2 + this.strokeWidth * 2} ${this._radius * 2 + this.strokeWidth * 2}`}>
        <path fill="none" stroke=${this.stroke} stroke-width=${this.strokeWidth} d=${this._arc()} />
        <path fill="none" stroke=${this.stroke} stroke-width=${this.strokeWidth} d=${this._arc(angle)} />
      </svg>
    `;
  }


  private _polarToCartesian(
    angleInDegrees: number
  ) {
    // tslint:disable no-magic-numbers
    const angle = angleInDegrees === 360 ? 359.99 : angleInDegrees;
    const angleInRadians = (angle - 90) * Math.PI / 180;

    return {
      x: this._radius + (this._radius * Math.cos(angleInRadians)) + this.strokeWidth,
      y: this._radius + (this._radius * Math.sin(angleInRadians)) + this.strokeWidth
    };
  }


  private _arc(
    endAngle: number = 360
  ) {
    const start = this._polarToCartesian(endAngle);
    const end = this._polarToCartesian(this._startAngle);

    // tslint:disable-next-line no-magic-numbers
    const largeArcFlag = endAngle - this._startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', this._radius, this._radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
    // return 'M 63.39745962155614 99.99999999999999 A 100 100 0 1 0 150 50';

  }
}
