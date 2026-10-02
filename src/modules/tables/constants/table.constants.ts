export const TABLE_STATUSES = ['AVAILABLE', 'OCCUPIED', 'OUT_OF_SERVICE'] as const;
export const TABLE_ZONES = ['INDOOR', 'OUTDOOR', 'BAR', 'VIP'] as const;
export type TableStatus = (typeof TABLE_STATUSES)[number];
export type TableZone = (typeof TABLE_ZONES)[number];