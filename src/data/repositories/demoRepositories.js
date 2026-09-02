export function createDemoRepositories(fixture) {
  return {
    environment: 'demo',
    workspace: {
      create() {
        return fixture;
      },
    },
    creator: {
      get() {
        return fixture?.creator || {};
      },
    },
    comments: {
      list() {
        return fixture?.comments || [];
      },
    },
    videos: {
      list() {
        return fixture?.videos || [];
      },
    },
  };
}

export function createUnavailableProductionRepositories() {
  return {
    environment: 'production',
    workspace: {
      create() {
        return {};
      },
    },
    creator: {
      get() {
        throw new Error('Production repositories are not configured');
      },
    },
    comments: {
      list() {
        throw new Error('Production repositories are not configured');
      },
    },
    videos: {
      list() {
        throw new Error('Production repositories are not configured');
      },
    },
  };
}
