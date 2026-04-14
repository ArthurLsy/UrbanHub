package caensup.eadl.urbanhub.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import caensup.eadl.urbanhub.dto.MeasureDto;
import caensup.eadl.urbanhub.entity.Measure;
import caensup.eadl.urbanhub.entity.MeasureId;
import caensup.eadl.urbanhub.entity.Sensor;
import caensup.eadl.urbanhub.entity.SensorType;
import caensup.eadl.urbanhub.entity.Zone;
import caensup.eadl.urbanhub.repository.MeasureRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MeasureQueryServiceTest {

    @Mock
    private MeasureRepository measureRepository;

    private MeasureQueryService measureQueryService;

    @BeforeEach
    void setUp() {
        measureQueryService = new MeasureQueryService(measureRepository);
    }

    @Test
    void getMeasuresShouldReturnAllMeasuresWhenNoFilterIsProvided() {
        Measure measure = buildMeasure();
        when(measureRepository.findAll()).thenReturn(List.of(measure));

        List<MeasureDto> result = measureQueryService.getMeasures(null);

        assertEquals(1, result.size());
        verify(measureRepository).findAll();
    }

    @Test
    void getMeasuresShouldFilterBySensorId() {
        Measure measure = buildMeasure();
        when(measureRepository.findBySensor_SensorId("CAP-001")).thenReturn(List.of(measure));

        List<MeasureDto> result = measureQueryService.getMeasures("CAP-001");

        assertEquals(1, result.size());
        verify(measureRepository).findBySensor_SensorId("CAP-001");
    }

    private Measure buildMeasure() {
        Zone zone = new Zone();
        zone.setUuid(UUID.randomUUID());
        zone.setZoneId("ZONE-001");

        SensorType sensorType = new SensorType();
        sensorType.setUuid(UUID.randomUUID());
        sensorType.setSensorTypeId("TYPE-001");

        Sensor sensor = new Sensor();
        sensor.setUuid(UUID.randomUUID());
        sensor.setSensorId("CAP-001");
        sensor.setLatitude(49.1829);
        sensor.setLongitude(-0.3707);
        sensor.setStatus(true);
        sensor.setZone(zone);
        sensor.setSensorType(sensorType);

        Measure measure = new Measure();
        MeasureId id = new MeasureId(OffsetDateTime.parse("2026-04-13T10:15:30+02:00"), sensor.getUuid());
        measure.setId(id);
        measure.setValue(42.5f);
        measure.setUnit("ppm");
        measure.setSensor(sensor);
        return measure;
    }
}
