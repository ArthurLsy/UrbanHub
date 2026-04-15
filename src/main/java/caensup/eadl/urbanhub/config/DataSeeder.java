package caensup.eadl.urbanhub.config;

import caensup.eadl.urbanhub.entity.Measure;
import caensup.eadl.urbanhub.entity.MeasureId;
import caensup.eadl.urbanhub.entity.Sensor;
import caensup.eadl.urbanhub.entity.SensorType;
import caensup.eadl.urbanhub.entity.Zone;
import caensup.eadl.urbanhub.repository.MeasureRepository;
import caensup.eadl.urbanhub.repository.SensorRepository;
import caensup.eadl.urbanhub.repository.SensorTypeRepository;
import caensup.eadl.urbanhub.repository.ZoneRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedData(ZoneRepository zoneRepository,
                                      SensorTypeRepository sensorTypeRepository,
                                      SensorRepository sensorRepository,
                                      MeasureRepository measureRepository) {
        return args -> {
            if (!zoneRepository.findAll().isEmpty()) {
                // don't seed if DB not empty
                return;
            }

            // create sensor types
            SensorType air = new SensorType();
            air.setSensorTypeId("AIR");
            SensorType noise = new SensorType();
            noise.setSensorTypeId("NOISE");
            sensorTypeRepository.saveAll(List.of(air, noise));

            // create zones
            Zone z1 = new Zone(); z1.setZoneId("CENTRE");
            Zone z2 = new Zone(); z2.setZoneId("NORTH");
            zoneRepository.saveAll(List.of(z1, z2));

            // create sensors
            Sensor s1 = new Sensor(); s1.setSensorId("sensor-centre-1"); s1.setLatitude(45.0); s1.setLongitude(3.0); s1.setStatus(true); s1.setZone(z1); s1.setSensorType(air);
            Sensor s2 = new Sensor(); s2.setSensorId("sensor-centre-2"); s2.setLatitude(45.1); s2.setLongitude(3.1); s2.setStatus(true); s2.setZone(z1); s2.setSensorType(noise);
            Sensor s3 = new Sensor(); s3.setSensorId("sensor-north-1"); s3.setLatitude(45.5); s3.setLongitude(3.5); s3.setStatus(true); s3.setZone(z2); s3.setSensorType(air);

            sensorRepository.saveAll(List.of(s1, s2, s3));

            // create measures for sensors (several timestamps including ~24h apart)
            OffsetDateTime now = OffsetDateTime.now();

            Measure m1 = new Measure();
            m1.setId(new MeasureId(now.minusHours(1), UUID.randomUUID()));
            m1.setValue(10.0f); m1.setUnit("ug/m3"); m1.setSensor(s1);

            Measure m2 = new Measure();
            m2.setId(new MeasureId(now.minusHours(2), UUID.randomUUID()));
            m2.setValue(8.0f); m2.setUnit("ug/m3"); m2.setSensor(s1);

            Measure m3 = new Measure();
            m3.setId(new MeasureId(now.minusHours(24).plusMinutes(10), UUID.randomUUID()));
            m3.setValue(6.0f); m3.setUnit("ug/m3"); m3.setSensor(s1);

            Measure m4 = new Measure();
            m4.setId(new MeasureId(now.minusHours(1), UUID.randomUUID()));
            m4.setValue(70.0f); m4.setUnit("dB"); m4.setSensor(s2);

            Measure m5 = new Measure();
            m5.setId(new MeasureId(now.minusHours(25), UUID.randomUUID()));
            m5.setValue(65.0f); m5.setUnit("dB"); m5.setSensor(s2);

            Measure m6 = new Measure();
            m6.setId(new MeasureId(now.minusHours(1), UUID.randomUUID()));
            m6.setValue(12.0f); m6.setUnit("ug/m3"); m6.setSensor(s3);

            measureRepository.saveAll(List.of(m1,m2,m3,m4,m5,m6));

        };
    }
}

