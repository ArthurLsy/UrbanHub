package caensup.eadl.urbanhub.service;

import caensup.eadl.urbanhub.dto.MeasureDto;
import caensup.eadl.urbanhub.entity.Measure;
import caensup.eadl.urbanhub.entity.Sensor;
import caensup.eadl.urbanhub.repository.MeasureRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic for measure consultation.
 */
@Service
public class MeasureQueryService {

    private final MeasureRepository measureRepository;

    public MeasureQueryService(MeasureRepository measureRepository) {
        this.measureRepository = measureRepository;
    }

    /**
     * Retrieves measures with optional filtering by sensor functional identifier.
     */
    @Transactional(readOnly = true)
    public long getCount() {
        return measureRepository.count();
    }

    @Transactional(readOnly = true)
    public List<MeasureDto> getMeasures(String sensorId) {
        List<Measure> measures = sensorId == null || sensorId.isBlank()
                ? measureRepository.findAll()
                : measureRepository.findBySensor_SensorId(sensorId);

        return measures.stream()
                .map(this::toDto)
                .toList();
    }

    private MeasureDto toDto(Measure measure) {
        Sensor sensor = measure.getSensor();
        String zoneId = sensor.getZone() != null ? sensor.getZone().getZoneId() : null;

        return new MeasureDto(
                measure.getId().getTimestamp() != null ? UUID.randomUUID() : null,
                null,
                measure.getId().getTimestamp(),
                measure.getValue(),
                measure.getUnit(),
                sensor.getSensorId(),
                sensor.getLatitude(),
                sensor.getLongitude(),
                sensor.getStatus(),
                zoneId,
                sensor.getSensorType().getSensorTypeId()
        );
    }
}
