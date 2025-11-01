import { EntityControllerSystem, EntityController } from '../../main/BP/core/entity_controller';
import type { Entity } from '@minecraft/server';

// A mock controller for testing purposes.
class MockEntityController extends EntityController {
  public spawned = false;
  public updated = false;
  public destroyed = false;

  constructor(entity: Entity) {
    super(entity);
  }

  OnSpawn() {
    this.spawned = true;
  }
  OnUpdate(delta: number) {
    this.updated = delta > 0;
  }
  OnDestroy() {
    this.destroyed = true;
  }
}

describe('EntityControllerSystem', () => {
  let ecs: EntityControllerSystem;

  beforeEach(() => {
    // Create a new ECS instance before each test
    ecs = new EntityControllerSystem();
  });

  it('should register a type and clear controllers correctly', () => {
    // Act
    ecs.registerType("myname:testentity", MockEntityController);
    const before = ecs.getControllerCount();
    ecs.clearAllControllers();
    const after = ecs.getControllerCount();

    // Assert
    expect(before).toBe(0); // Should be 0 as no entities have spawned yet
    expect(after).toBe(0);
  });
});
