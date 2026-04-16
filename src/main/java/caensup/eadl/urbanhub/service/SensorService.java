package caensup.eadl.urbanhub.service;

import caensup.eadl.urbanhub.dto.SensorDto;
import caensup.eadl.urbanhub.entity.Sensor;
import caensup.eadl.urbanhub.ingest.exception.SensorNotFoundException;
import caensup.eadl.urbanhub.repository.SensorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SensorService {

    private final SensorRepository sensorRepository;

    public SensorService(SensorRepository sensorRepository) {
        this.sensorRepository = sensorRepository;
    }

    @Transactional(readOnly = true)
    public List<SensorDto> getAll() {
        return sensorRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SensorDto> getByType(String sensorTypeId) {
        return sensorRepository.findBySensorType_SensorTypeId(sensorTypeId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getCount() {
        return sensorRepository.count();
    }

    @Transactional(readOnly = true)
    public SensorDto getById(String sensorId) {
        return sensorRepository.findBySensorId(sensorId)
                .map(this::toDto)
                .orElseThrow(() -> new SensorNotFoundException(sensorId));
    }

    private SensorDto toDto(Sensor sensor) {
        String zoneId = sensor.getZones().stream()
                .findFirst()
                .map(z -> z.getZoneId())
                .orElse(null);
        return new SensorDto(
                sensor.getUuid(),
                sensor.getSensorId(),
                sensor.getSensorType().getSensorTypeId(),
                sensor.getLatitude(),
                sensor.getLongitude(),
                sensor.getStatus(),
                zoneId
        );
    }
}