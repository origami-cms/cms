import { ButtonOptions } from '@origami/zen';
import { ResourceState } from '@origami/zen-lib/API';
import { App as ServerApp } from 'origami-core-server';


export interface State {
  App: App;
  Apps: Apps;
  Quote: QuoteWithLoader;
  Setup: Setup;
  Me: Me;
  Auth: Auth;
  Pages: Pages;
  Organization: Organization;
  resources: {
    users: Users;
    [name: string]: any
  };
}
export interface Loader {
  _loading: {
    get?: boolean;
    post?: boolean;
  };
  _errors: {
    get: string | boolean;
    post: string | boolean;
  };
}

export interface Setup {
  setup: boolean;
  user: boolean;
  errors: {
    user: boolean
  };
  loading: {
    user: boolean
  };
}

export interface Auth {
  verified: null | boolean;
  loggedIn: boolean;
  token?: string | null;
  loading: {
    verifying: boolean,
    loggingIn: boolean
  };
  errors: {
    loggingIn: null | string,
    verify: null | string
  };
}

export interface App {
  page: {
    title: string,
    path: string,
    actions: ButtonOptions[]
  };
  sidebar: {
    items: SidebarItem[]
  };
  appSelector: {
    open: boolean
  };
}

export interface Apps {
  apps: AppsMap;
  entries: {
    [name: string]: string;
  };
}

export type AppConfig = ServerApp.EntryResponse;
export interface AppsMap {
  [name: string]: AppConfig;
}

export interface SidebarItem {
  icon: string | { type: string, color: string, background: string };
  path: string;
  name: string;
}

export interface Quote {
  quote: QuoteDetails;
  address?: string;
}

export interface QuoteDetails {
  quoteId: string | boolean;
  coverages: {
    excessLimit: number
    frequency: 'Monthly Premium' | 'Annual Premium'
    premium: number
  }[];
}

export interface QuoteWithLoader extends Quote, Loader { }


export interface Me {
  id: null | string;
  fname: null | string;
  lname: null | string;
  email: null | string;
}


export interface Pages extends Loader {
  pages: Page[];
}
export interface Page {
  id?: string;
  children?: Page[];
}

export interface Users extends ResourceState {
  users: User[];
}
export interface User {
  id: null | string;
  fname: null | string;
  lname: null | string;
  email: null | string;
}


export interface Organization {
  theme: OrganizationTheme;
  logo: null | number;
}
export interface OrganizationTheme {
  colorMain: string | false;
  colorSecondary: string | false;
}
