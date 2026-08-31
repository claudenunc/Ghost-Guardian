export function createDemoRepositories(fixture) {
  return {
    workspace: {
      create() {
        return fixture;
      },
    },
  };
}

export function createUnavailableProductionRepositories() {
  return {
    workspace: {
      create() {
        return {};
      },
    },
  };
}
