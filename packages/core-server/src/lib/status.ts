import { OK } from 'http-status-codes';
import JsonQuery from 'json-query';
import { statuses } from '../statuses';


interface Status {
  message: string;
  code: number;
}

/**
 * Lookup a status message from the language file based on the message id,
 * and update the server response.
 * @param res Server response
 * @param message Message code
 * @param code Status code (will be potentially overridden)
 * @return The message object
 */
export const status = (ln: string, message: string, code: number = OK): Status => {
  const data = statuses[ln];
  let m = JsonQuery(message, { data }).value;
  let c = code;

  // Destructure the code and message from an array
  // EG: notFound: ['No resource found', 404]
  if (m instanceof Array) { [m, c] = m; }

  return {
    message: m || message,
    code: c
  };
};
