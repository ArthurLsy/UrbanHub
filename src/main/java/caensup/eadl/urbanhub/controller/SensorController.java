package caensup.eadl.urbanhub.controller;

import caensup.eadl.urbanhub.dto.SensorDto;
import caensup.eadl.urbanhub.service.SensorService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sensors")
public class SensorController {

    private final SensorService sensorService;

    public SensorController(SensorService sensorService) {
        this.sensorService = sensorService;
    }

    @GetMapping("/status")
    public List<SensorDto> getByStatus(@RequestParam(name = "alive", defaultValue = "true") boolean alive) {
        return sensorService.getByStatus(alive);
    }

    @GetMapping("/status/count")
    public long getByStatusCount(@RequestParam(name = "alive", defaultValue = "true") boolean alive) {
        return sensorService.getByStatusCount(alive);
    }

    @GetMapping("/status/ratio")
    public double getByStatusRatio(@RequestParam(name = "alive", defaultValue = "true") boolean alive) {
        long total = sensorService.getCount();
        if (total == 0) {
            return 0.0;
        }
        return sensorService.getByStatusCount(alive) / (double) total;
    }
}
