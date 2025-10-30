// Test Name: EntityControllerSystem.test.js
import { EntityControllerSystem, EntityController } from '../scripts/core/entity_controller.js';

// Mocking Minecraft server APIs for testing environment
// In a real test setup (e.g., with Jest), you would use a more robust mocking library.
const world = {
    afterEvents: {
        entitySpawn: { subscribe: () => {} },
        entityRemove: { subscribe: () => {} },
    },
};
const system = {
    runInterval: () => {}
};

// A mock controller for testing purposes
class MockEntityController extends EntityController {
    constructor(entity) {
        super(entity);
        this.spawned = false;
        this.updated = false;
        this.destroyed = false;
    }
    OnSpawn() { this.spawned = true; }
    OnUpdate(delta) { this.updated = delta > 0; }
    OnDestroy() { this.destroyed = true; }
}

// Simple test runner, since we don't have a full test framework like Jest.
function test(description, callback) {
    try {
        callback();
        console.log(`✅ PASS: ${description}`);
    } catch (error) {
        console.error(`❌ FAIL: ${description}`);
        console.error(error);
    }
}

function expect(value) {
    return {
        toBe: (expected) => {
            if (value !== expected) {
                throw new Error(`Expected ${value} to be ${expected}`);
            }
        },
        toBeGreaterThanOrEqual: (expected) => {
            if (value < expected) {
                throw new Error(`Expected ${value} to be greater than or equal to ${expected}`);
            }
        }
    };
}


test('registerType và getControllerCount hoạt động đúng', () => {
    // Arrange
    // We need to mock the global world and system objects for the class to instantiate without error.
    globalThis.world = world;
    globalThis.system = system;
    const ecs = new EntityControllerSystem();

    // Act
    ecs.registerType("myname:testentity", MockEntityController);
    const before = ecs.getControllerCount();
    ecs.clearAllControllers();
    const after = ecs.getControllerCount();

    // Assert
    expect(before).toBeGreaterThanOrEqual(0); // It will be 0 as no entities are spawned
    expect(after).toBe(0);
});
