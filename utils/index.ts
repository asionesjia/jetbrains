import {JetBrainsType} from "@/app/page";

export function getRandomUrlByAvailability(jetbrains: JetBrainsType | null) {
    if (!jetbrains || jetbrains.length === 0) {
        return null;
    }

    // 构建权重池
    const weightPool = [];
    for (const item of jetbrains) {
        for (let i = 0; i < item.availability; i++) {
            weightPool.push(item.url);
        }
    }

    // 从权重池中随机选择一个 URL
    const randomIndex = Math.floor(Math.random() * weightPool.length);
    return weightPool[randomIndex];
}
