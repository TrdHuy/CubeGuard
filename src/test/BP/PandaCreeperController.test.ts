import { PandaCreeperController } from '../../main/BP/mobs/panda_creeper_controller';
import { world } from '@minecraft/server';
import type { Entity, Dimension, Player } from '@minecraft/server';

// Helper to create a mock entity
const createMockEntity = (playersInRange: boolean): Entity => {
  const mockDimension: Partial<Dimension> = {
    playSound: jest.fn(),
    getPlayers: jest.fn().mockReturnValue(playersInRange ? [{ id: 'mockPlayer' } as Player] : []) as (options?: any) => Player[],
  };

  return {
    id: 'mockEntity123',
    typeId: 'myname:testentity',
    nameTag: '',
    location: { x: 0, y: 0, z: 0 },
    dimension: mockDimension as Dimension,
    triggerEvent: jest.fn(),
  } as unknown as Entity;
};

describe('PandaCreeperController', () => {
  beforeEach(() => {
    // Clear mock history before each test
    jest.clearAllMocks();
  });

  it('should set the nameTag on spawn', () => {
    // Arrange
    const mockEntity = createMockEntity(false);
    const controller = new PandaCreeperController(mockEntity);

    // Act
    controller.OnSpawn();

    // Assert
    expect(mockEntity.nameTag).toBe('Panda Creeper');
    expect(world.sendMessage).toHaveBeenCalledWith('A wild Panda Creeper has spawned!');
  });

  it('should not trigger explosion if no players are nearby', () => {
    // Arrange
    const mockEntity = createMockEntity(false);
    const controller = new PandaCreeperController(mockEntity);
    controller.tick = 59; // Set tick to just before the check

    // Act
    controller.OnUpdate(0.05); // This will make the tick 60

    // Assert
    expect(mockEntity.triggerEvent).not.toHaveBeenCalled();
  });

  it('should trigger explosion if players are nearby', () => {
    // Arrange
    const mockEntity = createMockEntity(true);
    const controller = new PandaCreeperController(mockEntity);
    controller.tick = 59;

    // Act
    controller.OnUpdate(0.05);

    // Assert
    expect(world.sendMessage).toHaveBeenCalledWith('🐼 Panda Creeper phát hiện người chơi!');
    expect(mockEntity.dimension.playSound).toHaveBeenCalledWith('mob.panda.sneeze', mockEntity.location);
    expect(mockEntity.triggerEvent).toHaveBeenCalledWith('minecraft:start_exploding');
  });

  it('should set isAlive to false on destroy', () => {
    // Arrange
    const mockEntity = createMockEntity(false);
    const controller = new PandaCreeperController(mockEntity);

    // Act
    controller.OnDestroy();

    // Assert
    expect(controller.isAlive).toBe(false);
    expect(world.sendMessage).toHaveBeenCalledWith('The Panda Creeper has despawned.');
  });
});
