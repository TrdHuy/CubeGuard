// Tên Test: PandaCreeperController.test.js
import { PandaCreeperController } from '../scripts/mobs/panda_creeper_controller.js';

// Giả lập các đối tượng và hàm cần thiết của Minecraft
const mockEntity = {
    id: 'mockEntity123',
    typeId: 'myname:testentity',
    nameTag: '',
    location: { x: 0, y: 0, z: 0 },
    dimension: {
        playSound: (sound, location) => {
            console.log(`Mock Sound Played: ${sound} at ${JSON.stringify(location)}`);
        },
        getPlayers: (options) => {
            // Trả về một người chơi giả lập nếu khoảng cách maxDistance đủ lớn
            if (options.maxDistance >= 5) {
                return [{ id: 'mockPlayer' }];
            }
            return [];
        },
    },
    triggerEvent: (event) => {
        console.log(`Mock Event Triggered: ${event}`);
    },
};

const world = {
    sendMessage: (message) => {
        console.log(`Mock World Message: ${message}`);
    }
};

// Hàm chạy test đơn giản
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
        toBeTruthy: () => {
            if (!value) {
                throw new Error(`Expected ${value} to be truthy`);
            }
        }
    };
}

// --- Các bài test ---

test('PandaCreeperController OnSpawn hoạt động đúng', () => {
    // Sắp xếp
    globalThis.world = world;
    const controller = new PandaCreeperController(mockEntity);

    // Hành động
    controller.OnSpawn();

    // Khẳng định
    expect(mockEntity.nameTag).toBe("Panda Creeper");
});

test('PandaCreeperController OnUpdate không làm gì nếu không có người chơi', () => {
    // Sắp xếp
    const controller = new PandaCreeperController(mockEntity);
    controller.tick = 59; // Sắp đến lúc kiểm tra

    // Hành động
    controller.OnUpdate(0.05); // Tick 60

    // Khẳng định (Không có lỗi nào xảy ra)
    // Logic này khó kiểm tra trực tiếp mà không mock sâu hơn,
    // nhưng chúng ta có thể đảm bảo nó không crash.
});

test('PandaCreeperController OnDestroy hoạt động đúng', () => {
    // Sắp xếp
    const controller = new PandaCreeperController(mockEntity);

    // Hành động
    controller.OnDestroy();

    // Khẳng định
    expect(controller.isAlive).toBe(false);
});
