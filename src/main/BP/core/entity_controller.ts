// ============================================================================
// 📌 Tên Module: EntityControllerSystem
// 🎯 Mục đích   : Quản lý vòng đời (lifecycle) cho mob trong Minecraft Bedrock giống Unity
// 🧩 Mô tả      : Cung cấp hệ thống EntityController có OnSpawn, OnUpdate, OnDestroy
// 🔗 Phụ thuộc  : @minecraft/server
//
// 🏷 API Công khai:
//   - registerType(typeId: string, ControllerClass: function) → void
//   - getControllerCount() → number
//   - clearAllControllers() → void
//
// 🔒 Logic Nội bộ:
//   - _onEntitySpawn()
//   - _onEntityRemove()
//   - _updateControllers(delta)
//
// 🧪 Khả năng kiểm thử:
//   - File test: EntityControllerSystem.test.js
//   - Kiểm thử các hàm: registerType(), getControllerCount(), clearAllControllers()
//
// ✍️ Tác giả : AI-Generated Using Standard Prompt
// 📅 Ngày tạo: 2025-10-30
// ♻️ Cập nhật: 2025-11-01
// ============================================================================

import { world, system, Entity, EntitySpawnAfterEvent, EntityRemoveAfterEvent } from "@minecraft/server";

// Define a type for the constructor of a class that extends EntityController
type ControllerConstructor = new (entity: Entity) => EntityController;

// ====================== TRIỂN KHAI API CÔNG KHAI ==========================

class EntityController {
    entity: Entity;
    tick: number;
    isAlive: boolean;

    constructor(entity: Entity) {
        this.entity = entity;
        this.tick = 0;
        this.isAlive = true;
    }

    OnSpawn(): void {}
    OnUpdate(_deltaTime: number): void {
        this.tick++;
    }
    OnDestroy(): void {
        this.isAlive = false;
    }
}

class EntityControllerSystem {
    private controllers: Map<string, EntityController>;
    private registry: Map<string, ControllerConstructor>;
    private lastTick: number;

    constructor() {
        this.controllers = new Map();
        this.registry = new Map();
        this.lastTick = Date.now();
        this._initEvents();
    }

    // Đăng ký một lớp Controller cho một loại mob (typeId) cụ thể.
    registerType(typeId: string, ControllerClass: ControllerConstructor): void {
        if (typeof typeId !== "string") throw new Error("typeId phải là string");
        this.registry.set(typeId, ControllerClass);
    }

    // Lấy tổng số controller đang hoạt động.
    getControllerCount() {
        return this.controllers.size;
    }

    // Xóa toàn bộ controller đang hoạt động, reset lại hệ thống.
    clearAllControllers() {
        this.controllers.clear();
    }

    // ====================== TRIỂN KHAI LOGIC NỘI BỘ ===========================

    _initEvents(): void {
        world.afterEvents.entitySpawn.subscribe((ev: EntitySpawnAfterEvent) => this._onEntitySpawn(ev));
        world.afterEvents.entityRemove.subscribe((ev: EntityRemoveAfterEvent) => this._onEntityRemove(ev));
        system.runInterval(() => this._updateControllers());
    }

    private _onEntitySpawn(ev: EntitySpawnAfterEvent): void {
        const typeId = ev.entity.typeId;
        if (!this.registry.has(typeId)) return;

        const ControllerClass = this.registry.get(typeId);
        if (!ControllerClass) return;

        const controller = new ControllerClass(ev.entity);
        this.controllers.set(ev.entity.id, controller);
        try {
            controller.OnSpawn();
        } catch (err) {
            console.warn(`❌ Error in ${controller.constructor.name}.OnSpawn: ${err}`);
        }
    }

    private _onEntityRemove(ev: EntityRemoveAfterEvent): void {
        const ctrl = this.controllers.get(ev.removedEntityId);
        if (!ctrl) return;
        try {
            ctrl.OnDestroy();
        } catch (err) {
            console.warn(`❌ Error in ${ctrl.constructor.name}.OnDestroy: ${err}`);
        }
        this.controllers.delete(ev.removedEntityId);
    }

    private _updateControllers(): void {
        const now = Date.now();
        const delta = (now - this.lastTick) / 1000;
        this.lastTick = now;

        for (const [id, ctrl] of this.controllers.entries()) {
            if (!ctrl.entity || !ctrl.entity.isValid()) {
                this.controllers.delete(id);
                continue;
            }
            try {
                ctrl.OnUpdate(delta);
            } catch (err) {
                console.warn(`❌ Error in ${ctrl.constructor.name}.OnUpdate: ${err}`);
            }
        }
    }
}

// ====================== XUẤT MODULES ====================================

export { EntityControllerSystem, EntityController };
