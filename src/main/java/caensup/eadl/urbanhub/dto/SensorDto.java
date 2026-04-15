package caensup.eadl.urbanhub.dto;

import java.util.UUID;

public record SensorDto(
    UUID uuid,
    String sensorId,
    String sensorTypeId,
    Boolean status
) {}