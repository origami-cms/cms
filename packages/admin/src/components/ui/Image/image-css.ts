import {html} from 'lit-element';
export default html`<style>:host zen-icon{position:absolute;left:50%;top:50%;transform:translate(-50%, -50%)}:host img{position:absolute;top:0;left:0;width:100%;height:100%}:host{position:relative}:host zen-icon{height:30%}:host img{object-fit:cover;opacity:0;transition:all var(--transition-time)}:host img.loaded{opacity:1}
</style>`;
