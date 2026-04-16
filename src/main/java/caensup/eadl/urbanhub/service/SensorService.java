package caensup.eadl.urbanhub.service;

import caensup.eadl.urbanhub.dto.SensorDto;
import caensup.eadl.urbanhub.entity.Sensor;
import caensup.eadl.urbanhub.repository.SensorRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SensorService {

    private static final Duration SENSOR_ALIVE_WINDOW = Duration.ofHours(1);

    private final SensorRepository sensorRepository;

    public SensorService(SensorRepository sensorRepository) {
        this.sensorRepository = sensorRepository;
    }

    /**
     * @param alive {@code true} : capteurs avec {@code last_update} dans la fenêtre récente ;
     *              {@code false} : capteurs sans activité depuis plus d'une heure.
     */
    @Transactional(readOnly = true)
    public List<SensorDto> getByStatus(boolean alive) {
        Instant cutoff = Instant.now().minus(SENSOR_ALIVE_WINDOW);
        List<Sensor> sensors = alive
                ? sensorRepository.findByLastUpdateGreaterThanEqual(cutoff)
                : sensorRepository.findByLastUpdateLessThan(cutoff);
        return sensors.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public long getByStatusCount(boolean alive) {
        Instant cutoff = Instant.now().minus(SENSOR_ALIVE_WINDOW);
        List<Sensor> sensors = alive
                ? sensorRepository.findByLastUpdateGreaterThanEqual(cutoff)
                : sensorRepository.findByLastUpdateLessThan(cutoff);
        return sensors.size();
    }

    @Transactional(readOnly = true)
    public long getCount() {
        return sensorRepository.count();
    }

    private SensorDto toDto(Sensor s) {
        return new SensorDto(
                s.getUuid(),
                s.getSensorId(),
                s.getSensorType().getSensorTypeId(),
                s.getStatus());
    }
}
