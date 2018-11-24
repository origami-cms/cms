// tslint:disable no-console
import symbols from 'log-symbols';
import { colors } from './colors';
import { OrigamiError } from './OrigamiError';

export type LogType = 'none' | 'error' | 'warn' | 'info' | 'log' | 'debug';
export type LogLevel = 'none' | 'error' | 'warn' | 'info' | 'log' | 'success';

export const logLevels: { [k in LogType]: number } = {
  none: 1,
  error: 2,
  warn: 3,
  info: 4,
  log: 5,
  debug: 6
};

const DEFAULT_LOG_TYPE = 'info';
const DEFAULT_LOG_LEVEL = 4;

export const showLog = (type: LogType) => {
  const logType = (process.env.LOG_LEVEL as LogType) ||
    ((process.env.NODE_ENV === 'production') ? 'none' : DEFAULT_LOG_TYPE);

  const logLevel = logLevels[logType] || DEFAULT_LOG_LEVEL;

  return logLevels[type] <= logLevel;
};

const _log = (type: LogLevel, namespaceOrMessage: string, ...rest: any[]) => {
  let icon = symbols.info;
  let color = colors.purple;


  switch (type) {
    case 'error':
      if (!showLog('error')) return;
      icon = symbols.error;
      color = colors.red;
      break;

    case 'warn':
      if (!showLog('warn')) return;
      icon = symbols.warning;
      color = colors.yellow;
      break;

    case 'info':
      if (!showLog('info')) return;
      icon = symbols.info;
      color = colors.blue;
      break;

    case 'success':
      if (!showLog('debug')) return;
      icon = symbols.success;
      color = colors.green;
      break;

    case 'log':
    default:
      if (!showLog('log')) return;
  }

  let first;
  if (rest.length > 0) first = color.bold(namespaceOrMessage);
  else first = namespaceOrMessage;

  console.log(
    color(icon),
    first,
    color(...rest)
  );
};


export const success = (namespaceOrMessage: string, ...message: any[]) =>
  _log('success', namespaceOrMessage, ...message);

export const log = (namespaceOrMessage: string, ...message: any[]) =>
  _log('log', namespaceOrMessage, ...message);

export const info = (namespaceOrMessage: string, ...message: any[]) =>
  _log('info', namespaceOrMessage, ...message);

export const warn = (namespaceOrMessage: string | OrigamiError, ...message: any[]) => {
  if (namespaceOrMessage instanceof OrigamiError) {
    _log('warn', namespaceOrMessage.code, namespaceOrMessage.message);
  } else _log('warn', namespaceOrMessage, ...message);
};

export const error = (objOrError: Error | string, err?: Error | string) => {
  if (objOrError instanceof Error) _log('error', objOrError.message);
  else if (err instanceof Error) _log('error', objOrError, err.message);
  else if (err) _log('error', objOrError, err);
};
