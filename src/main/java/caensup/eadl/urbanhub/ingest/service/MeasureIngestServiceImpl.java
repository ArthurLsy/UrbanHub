package caensup.eadl.urbanhub.ingest.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import caensup.eadl.urbanhub.entity.Measure;
import caensup.eadl.urbanhub.entity.MeasureId;
import caensup.eadl.urbanhub.entity.Sensor;
import caensup.eadl.urbanhub.entity.SensorType;
import caensup.eadl.urbanhub.ingest.api.dto.IngestMeasureJson;
import caensup.eadl.urbanhub.repository.MeasureRepository;
import caensup.eadl.urbanhub.repository.SensorRepository;
import caensup.eadl.urbanhub.repository.SensorTypeRepository;
import caensup.eadl.urbanhub.types.measures.MeasureBase;
import caensup.eadl.urbanhub.types.measures.MeasureFactory;

import java.time.OffsetDateTime;

@Service
@Validated
public class MeasureIngestServiceImpl implements MeasureIngestService {

    private final MeasureRepository measureRepository;
    private final SensorRepository sensorRepository;
    private final SensorTypeRepository sensorTypeRepository;

    public MeasureIngestServiceImpl(MeasureRepository measureRepository, SensorRepository sensorRepository,
            SensorTypeRepository sensorTypeRepository) {
        this.measureRepository = measureRepository;
        this.sensorRepository = sensorRepository;
        this.sensorTypeRepository = sensorTypeRepository;
    }

    @Transactional
    public void ingestMeasure(IngestMeasureJson json) {

        MeasureBase measure = MeasureFactory.from(json);
        measure.validate();

        Sensor sensor = sensorRepository.findBySensorId(json.sensorId())
                .orElseGet(() -> {
                    String typeStr = json.type().toUpperCase();
                    SensorType sensorType = sensorTypeRepository.findBySensorTypeId(typeStr)
                            .orElseGet(() -> {
                                SensorType newType = new SensorType();
                                newType.setSensorTypeId(typeStr);
                                return sensorTypeRepository.save(newType);
                            });

                    double lat = 0.0;
                    double lon = 0.0;
                    if (json.location() != null && json.location().contains(";")) {
                        try {
                            String[] parts = json.location().split(";");
                            lat = Double.parseDouble(parts[0].trim());
                            lon = Double.parseDouble(parts[1].trim());
                        } catch (NumberFormatException ignored) {
                            // Malformed coordinates — keep defaults (0.0, 0.0)
                        }
                    }

                    Sensor newSensor = new Sensor();
                    newSensor.setSensorId(json.sensorId());
                    newSensor.setSensorType(sensorType);
                    newSensor.setStatus(true);
                    newSensor.setLatitude(lat);
                    newSensor.setLongitude(lon);
                    newSensor.setZone(null);

                    return sensorRepository.save(newSensor);
                });

        OffsetDateTime timestamp = OffsetDateTime.ofInstant(measure.timestamp(), java.time.ZoneOffset.UTC);
        MeasureId measureId = new MeasureId(timestamp, sensor.getUuid());

        Measure measureEntity = new Measure();
        measureEntity.setId(measureId);
        measureEntity.setSensor(sensor);
        measureEntity.setValue(json.value().floatValue());
        measureEntity.setUnit(json.unit());

        measureRepository.save(measureEntity);
    }
}
