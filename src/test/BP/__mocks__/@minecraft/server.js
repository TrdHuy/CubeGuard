// This is a manual mock for the @minecraft/server module.
// It provides the basic objects and functions that our tests need to run in a Node.js environment.

module.exports = {
  world: {
    afterEvents: {
      entitySpawn: {
        subscribe: () => {},
      },
      entityRemove: {
        subscribe: () => {},
      },
    },
    sendMessage: jest.fn(),
  },
  system: {
    runInterval: () => {},
  },
  Entity: class Entity {
    constructor() {
      // Mock implementation
    }
  },
};
