import { Origami } from '@origami/core';

export type defaultData = {
  [type in Origami.ModuleType]: string[];
};

export const defaultData = {
  store: ['LowDB', 'MongoDB', 'Postgres', 'MySQL', 'Microsoft SQL', 'MariaDB', 'Other', 'None'],
  theme: ['None', 'Snow']
} as defaultData;
