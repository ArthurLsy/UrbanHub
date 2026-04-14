export type Zone = {
  uuid?: string
  zoneId: string
  sensors?: { sensorId: string; sensorTypeId?: string; sensorStatus?: boolean }[]
}

export type CreateZonePayload = {
  zoneId: string
  sensorIds: string[]
}
