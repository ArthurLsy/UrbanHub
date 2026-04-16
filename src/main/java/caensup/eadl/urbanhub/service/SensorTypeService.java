package caensup.eadl.urbanhub.service;

import caensup.eadl.urbanhub.dto.SensorTypeDto;
import caensup.eadl.urbanhub.entity.SensorType;
import caensup.eadl.urbanhub.ingest.exception.SensorTypeNotFoundException;
import caensup.eadl.urbanhub.repository.SensorTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class SensorTypeService {

    private static final Duration SENSOR_ALIVE_WINDOW = Duration.ofHours(1);

    private final SensorTypeRepository sensorTypeRepository;

    public SensorTypeService(SensorTypeRepository sensorTypeRepository) {
        this.sensorTypeRepository = sensorTypeRepository;
    }

    @Transactional(readOnly = true)
    public List<SensorTypeDto> getAll() {
        return sensorTypeRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public SensorTypeDto getById(String sensorTypeId) {
        return sensorTypeRepository.findBySensorTypeId(sensorTypeId)
                .map(this::toDto)
                .orElseThrow(() -> new SensorTypeNotFoundException(sensorTypeId));
    }

    @Transactional(readOnly = true)
    public long getCount() {
        return sensorTypeRepository.count();
    }

    /**
     * @param alive {@code true} pour les types ayant au moins un capteur « vivant » (récent) ;
     *              {@code false} pour ceux ayant au moins un capteur sans activité depuis plus d'une heure.
     */
    @Transactional(readOnly = true)
    public List<SensorTypeDto> getByStatus(boolean alive) {
        Instant cutoff = Instant.now().minus(SENSOR_ALIVE_WINDOW);
        List<SensorType> types = alive
                ? sensorTypeRepository.findDistinctWithSensorActivityOnOrAfter(cutoff)
                : sensorTypeRepository.findDistinctWithSensorActivityBeforeOrNull(cutoff);
        return types.stream().map(this::toDto).toList();
    }

    /**
     * Nombre de types de capteurs correspondant au filtre {@code alive} (même logique que {@link #getByStatus(boolean)}).
     */
    @Transactional(readOnly = true)
    public long getByStatusCount(boolean alive) {
        Instant cutoff = Instant.now().minus(SENSOR_ALIVE_WINDOW);
        List<SensorType> types = alive
                ? sensorTypeRepository.findDistinctWithSensorActivityOnOrAfter(cutoff)
                : sensorTypeRepository.findDistinctWithSensorActivityBeforeOrNull(cutoff);
        return types.size();
    }

    private SensorTypeDto toDto(SensorType sensorType) {
        return new SensorTypeDto(sensorType.getUuid(), sensorType.getSensorTypeId());
    }
}
