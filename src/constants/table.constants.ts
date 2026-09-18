export const TABLE_STATUSE = ['AVALIABLE', 'OCCUPIED', 'OUT_OF_SERVICE'] as const;
export const TABLE_ZONES = ['INDOOR', 'OUTDOOR', 'BAR', 'VIP'] as const;
export type TableStatus = (typeof TABLE_STATUSE)[number];
export type TableZone = (typeof TABLE_ZONES)[number];