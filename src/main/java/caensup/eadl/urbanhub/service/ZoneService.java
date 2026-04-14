package caensup.eadl.urbanhub.service;

import caensup.eadl.urbanhub.dto.CreateZoneDto;
import caensup.eadl.urbanhub.dto.SensorDto;
import caensup.eadl.urbanhub.dto.UpdateZoneDto;
import caensup.eadl.urbanhub.dto.ZoneDto;
import caensup.eadl.urbanhub.entity.Sensor;
import caensup.eadl.urbanhub.entity.Zone;
import caensup.eadl.urbanhub.ingest.exception.ZoneAlreadyExistsException;
import caensup.eadl.urbanhub.ingest.exception.ZoneNotFoundException;
import caensup.eadl.urbanhub.repository.SensorRepository;
import caensup.eadl.urbanhub.repository.ZoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final SensorRepository sensorRepository;

    public ZoneService(ZoneRepository zoneRepository, SensorRepository sensorRepository) {
        this.zoneRepository = zoneRepository;
        this.sensorRepository = sensorRepository;
    }

    @Transactional(readOnly = true)
    public List<ZoneDto> getAll() {
        return zoneRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ZoneDto getById(String zoneId) {
        return zoneRepository.findByZoneId(zoneId)
                .map(this::toDto)
                .orElseThrow(() -> new ZoneNotFoundException(zoneId));
    }

    @Transactional(readOnly = true)
    public long getCount() {
        return zoneRepository.count();
    }

    @Transactional
    public ZoneDto create(CreateZoneDto dto) {
        if (zoneRepository.existsByZoneId(dto.zoneId())) {
            throw new ZoneAlreadyExistsException(dto.zoneId());
        }
        Zone zone = new Zone();
        zone.setZoneId(dto.zoneId());
        Zone saved = zoneRepository.save(zone);

        if (dto.sensorIds() != null && !dto.sensorIds().isEmpty()) {
            for (String sensorId : dto.sensorIds()) {
                sensorRepository.findBySensorId(sensorId).ifPresent(sensor -> {
                    // Remove from previous zone if any (prevents orphanRemoval issues)
                    if (sensor.getZone() != null) {
                        sensor.getZone().getSensors().remove(sensor);
                    }
                    sensor.setZone(saved);
                    sensorRepository.save(sensor);
                });
            }
        }
        return toDto(zoneRepository.findById(saved.getUuid()).orElseThrow());
    }

    @Transactional
    public ZoneDto update(String zoneId, UpdateZoneDto dto) {
        Zone zone = zoneRepository.findByZoneId(zoneId)
                .orElseThrow(() -> new ZoneNotFoundException(zoneId));

        if (dto.zoneId() != null && !dto.zoneId().isBlank() && !dto.zoneId().equals(zoneId)) {
            if (zoneRepository.existsByZoneId(dto.zoneId())) {
                throw new ZoneAlreadyExistsException(dto.zoneId());
            }
            zone.setZoneId(dto.zoneId());
        }

        if (dto.sensorIds() != null) {
            // Clear existing associations
            if (zone.getSensors() != null) {
                for (Sensor sensor : zone.getSensors()) {
                    sensor.setZone(null);
                    sensorRepository.save(sensor);
                }
            }
            // Assign new sensors (remove from their old zone first)
            for (String sensorId : dto.sensorIds()) {
                sensorRepository.findBySensorId(sensorId).ifPresent(sensor -> {
                    if (sensor.getZone() != null) {
                        sensor.getZone().getSensors().remove(sensor);
                    }
                    sensor.setZone(zone);
                    sensorRepository.save(sensor);
                });
            }
        }

        Zone saved = zoneRepository.save(zone);
        return toDto(zoneRepository.findById(saved.getUuid()).orElseThrow());
    }

    @Transactional
    public void delete(String zoneId) {
        Zone zone = zoneRepository.findByZoneId(zoneId)
                .orElseThrow(() -> new ZoneNotFoundException(zoneId));
        // Clear sensor associations
        if (zone.getSensors() != null) {
            for (Sensor sensor : zone.getSensors()) {
                sensor.setZone(null);
                sensorRepository.save(sensor);
            }
        }
        zoneRepository.delete(zone);
    }

    private ZoneDto toDto(Zone zone) {
        List<SensorDto> sensorDtos = zone.getSensors() == null ? List.of() :
            zone.getSensors().stream()
                .map(s -> new SensorDto(s.getUuid(), s.getSensorId(), s.getSensorType().getSensorTypeId(), s.getStatus()))
                .toList();
        return new ZoneDto(zone.getUuid(), zone.getZoneId(), sensorDtos);
    }
}
