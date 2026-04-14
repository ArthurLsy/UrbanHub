package caensup.eadl.urbanhub.controller;

import static org.hamcrest.Matchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import caensup.eadl.urbanhub.dto.MeasureDto;
import caensup.eadl.urbanhub.entity.Sensor;
import caensup.eadl.urbanhub.entity.SensorType;
import caensup.eadl.urbanhub.repository.MeasureRepository;
import caensup.eadl.urbanhub.repository.SensorRepository;
import caensup.eadl.urbanhub.repository.SensorTypeRepository;
import caensup.eadl.urbanhub.service.MeasureQueryService;
import caensup.eadl.urbanhub.ingest.api.IngestMeasureController;
import caensup.eadl.urbanhub.ingest.service.MeasureIngestServiceImpl;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class IngestControllerTest {

    @Mock
    private MeasureRepository measureRepository;
    private SensorRepository sensorRepository;
    private SensorTypeRepository sensorTypeRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new IngestMeasureController(new MeasureIngestServiceImpl(measureRepository, sensorRepository, sensorTypeRepository)))
                .build();
    }

    @Test
    void ingestMeasure_sensorNotFound_createsNewSensor() {
        SensorType sensorType = new SensorType();
        sensorType.setSensorTypeId("WEATHER");

        Sensor createdSensor = new Sensor();
        createdSensor.setSensorId("sensor-999");
        createdSensor.setSensorType(sensorType);

        when(sensorRepository.findBySensorId("sensor-999"))
                .thenReturn(Optional.empty());

        when(sensorTypeRepository.findBySensorTypeId("WEATHER"))
                .thenReturn(Optional.of(sensorType));

        when(sensorRepository.save(any(Sensor.class))
                .thenReturn(createdSensor));



        verify(sensorRepository).save(any(Sensor.class));
    }

}

