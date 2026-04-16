package caensup.eadl.urbanhub.controller;

import caensup.eadl.urbanhub.dto.SensorDto;
import caensup.eadl.urbanhub.service.SensorService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sensors")
public class SensorController {

    private final SensorService sensorService;

    public SensorController(SensorService sensorService) {
        this.sensorService = sensorService;
    }

    @GetMapping
    public List<SensorDto> getAll(
            @RequestParam(name = "type", required = false) String sensorTypeId) {
        if (sensorTypeId != null && !sensorTypeId.isBlank()) {
            return sensorService.getByType(sensorTypeId);
        }
        return sensorService.getAll();
    }

    @GetMapping("/count")
    public long getCount() {
        return sensorService.getCount();
    }

    @GetMapping("/by-id")
    public SensorDto getById(@RequestParam(name = "sensor_id") String sensorId) {
        return sensorService.getById(sensorId);
    }
}