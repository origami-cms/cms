import {html} from '@polymer/lit-element';
export default html`<style>:host{position:absolute;top:0;left:0;right:0;bottom:0;margin:var(--page-padding)}:host zen-router{position:absolute;left:var(--sidebar-width);top:var(--header-height);bottom:0;right:0;padding:var(--size-main, 4rem)}:host zen-sidebar{opacity:1;transition:all var(--transition-time)}:host zen-sidebar:unresolved{opacity:0}
</style>`;
