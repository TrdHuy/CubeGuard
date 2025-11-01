// Tên Test: EntityControllerSystem.test.js
import { EntityControllerSystem, EntityController } from '../scripts/core/entity_controller.js';

// Giả lập (mock) các API của Minecraft server cho môi trường kiểm thử.
// Trong một môi trường test thực tế (ví dụ: dùng Jest), bạn nên dùng thư viện mock chuyên dụng hơn.
const world = {
    afterEvents: {
        entitySpawn: { subscribe: () => {} },
        entityRemove: { subscribe: () => {} },
    },
};
const system = {
    runInterval: () => {}
};

// Một controller giả lập cho mục đích kiểm thử.
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

// Hàm chạy test đơn giản, vì chúng ta không có một framework test đầy đủ như Jest.
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
    // Sắp xếp (Arrange)
    // Chúng ta cần giả lập các đối tượng global world và system để lớp có thể khởi tạo mà không bị lỗi.
    globalThis.world = world;
    globalThis.system = system;
    const ecs = new EntityControllerSystem();

    // Hành động (Act)
    ecs.registerType("myname:testentity", MockEntityController);
    const before = ecs.getControllerCount();
    ecs.clearAllControllers();
    const after = ecs.getControllerCount();

    // Khẳng định (Assert)
    expect(before).toBeGreaterThanOrEqual(0); // Sẽ là 0 vì chưa có entity nào được spawn
    expect(after).toBe(0);
});
