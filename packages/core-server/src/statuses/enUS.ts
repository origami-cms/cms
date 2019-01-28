import {
  BAD_REQUEST,                         // 200
  CREATED,                             // 201
  FORBIDDEN as E_FORBIDDEN,            // 400
  INTERNAL_SERVER_ERROR as E_INTERNAL, // 401
  NOT_FOUND as E_NOTFOUND,             // 422
  OK,
  UNAUTHORIZED,                        // 404
  UNPROCESSABLE_ENTITY                 // 500
} from 'http-status-codes';

export const enUS = {
  general: {
    errors: {
      internal: ['Internal error', E_INTERNAL],
      notFound: ['Not found', E_NOTFOUND]
    }
  },

  resource: {
    errors: {
      notFound: ['Resource not found', E_NOTFOUND]
    },
    success: {
      foundOne: ['Successfully retrieved resource', OK],
      foundList: ['Successfully retrieved resources', OK],
      created: ['Successfully created resource', OK],
      updated: ['Successfully updated resource', OK],
      deleted: ['Successfully deleted resource', OK]
    }
  },

  auth: {
    errors: {
      noHeader: ['No \'Authorization\' header found', UNAUTHORIZED],
      invalidHead: ['Header is incorrect format. Should be \'Bearer ...\'', BAD_REQUEST],
      invalidJWT: ['Supplied JWT is incorrect', BAD_REQUEST],
      expired: ['Supplied JWT has expired', UNAUTHORIZED],
      noUser: ['Email or password is incorrect', BAD_REQUEST]
    },
    success: {
      verified: ['JWT is valid', OK],
      login: ['Successfully logged in', OK]
    }
  },


  request: {
    invalid: ['Invalid request', UNPROCESSABLE_ENTITY]
  },


  user: {
    errors: {
      notFound: ['No user can be found with that id', E_NOTFOUND]
    },
    success: {
      create: ['Successfully created user', CREATED],
      update: ['Successfully updated user', OK],
      delete: ['Successfully deleted user', OK],
      foundList: ['Successfully retrieved users', OK],
      foundOne: ['Successfully retrieved user', OK]
    }
  },


  theme: {
    errors: {
      notFound: ['No theme can be found with that id', E_NOTFOUND],
      render: ['Could not render page from theme', E_INTERNAL]
    },
    success: {
      create: ['Successfully created theme', CREATED],
      update: ['Successfully updated theme', OK],
      delete: ['Successfully deleted theme', OK],
      foundList: ['Successfully retrieved themes', OK],
      foundOne: ['Successfully retrieved theme', OK]
    }
  },

  page: {
    errors: {
      notFound: ['No page can be found with that id', E_NOTFOUND],
      render: ['Error rendering page', E_INTERNAL]
    },
    success: {
      create: ['Successfully created page', CREATED],
      update: ['Successfully updated page', OK],
      delete: ['Successfully deleted page', OK],
      foundList: ['Successfully retrieved pages', OK],
      foundOne: ['Successfully retrieved page', OK]
    }
  },

  setup: {
    errors: {
      initialUser: ['Initial user for Origami is already setup', UNAUTHORIZED]
    }
  }
};
