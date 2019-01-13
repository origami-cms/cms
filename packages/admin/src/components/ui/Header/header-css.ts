import {html} from '@polymer/lit-element';
export default html`<style>:host{position:absolute;display:flex;height:var(--header-height);top:0;left:var(--sidebar-width);right:0;padding-left:var(--size-main);background-color:var(--header-bg);border-left:var(--header-divider);border-width:1px;box-shadow:var(--header-shadow);z-index:100}:host h1{flex:1;margin:0;line-height:var(--header-height);font-size:var(--font-size-large)}:host ui-header-user,:host ui-header-notifications{flex-grow:0;border-left:var(--header-divider)}
</style>`;
