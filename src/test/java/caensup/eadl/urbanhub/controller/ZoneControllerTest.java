package caensup.eadl.urbanhub.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import caensup.eadl.urbanhub.dto.ZoneDto;
import caensup.eadl.urbanhub.ingest.exception.GlobalExceptionHandler;
import caensup.eadl.urbanhub.ingest.exception.ZoneNotFoundException;
import caensup.eadl.urbanhub.service.ZoneService;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class ZoneControllerTest {

    @Mock
    private ZoneService zoneService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ZoneController(zoneService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/zones retourne toutes les zones")
    void getAllShouldReturnZoneList() throws Exception {
        when(zoneService.getAll()).thenReturn(List.of(buildDto("CENTRE"), buildDto("NORD")));

        mockMvc.perform(get("/api/zones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].zoneId").value("CENTRE"))
                .andExpect(jsonPath("$[1].zoneId").value("NORD"));

        verify(zoneService).getAll();
    }

    @Test
    @DisplayName("GET /api/zones/count retourne le nombre de zones")
    void getCountShouldReturnCount() throws Exception {
        when(zoneService.getCount()).thenReturn(5L);

        mockMvc.perform(get("/api/zones/count"))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));

        verify(zoneService).getCount();
    }

    @Test
    @DisplayName("GET /api/zones/by-id retourne la zone correspondante")
    void getByIdShouldReturnZone() throws Exception {
        when(zoneService.getById("CENTRE")).thenReturn(buildDto("CENTRE"));

        mockMvc.perform(get("/api/zones/by-id").param("zone_id", "CENTRE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.zoneId").value("CENTRE"));

        verify(zoneService).getById("CENTRE");
    }

    @Test
    @DisplayName("GET /api/zones/by-id retourne 404 si la zone est introuvable")
    void getByIdShouldReturn404WhenZoneNotFound() throws Exception {
        when(zoneService.getById("UNKNOWN")).thenThrow(new ZoneNotFoundException("UNKNOWN"));

        mockMvc.perform(get("/api/zones/by-id").param("zone_id", "UNKNOWN"))
                .andExpect(status().isNotFound());

        verify(zoneService).getById("UNKNOWN");
    }

    private ZoneDto buildDto(String zoneId) {
        return new ZoneDto(UUID.randomUUID(), zoneId);
    }
}
