package com.example.football.controller;

import com.example.football.entity.PlayerTemplate;
import com.example.football.service.PlayerTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlayerController {

    private final PlayerTemplateService playerTemplateService;

    @GetMapping
    public List<PlayerTemplate> getAllTemplates() {
        return playerTemplateService.getAllTemplates();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerTemplate> getTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(playerTemplateService.getTemplateById(id));
    }

    @PostMapping
    public PlayerTemplate createTemplate(@RequestBody PlayerTemplate template) {
        return playerTemplateService.saveTemplate(template);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        playerTemplateService.deleteTemplate(id);
        return ResponseEntity.ok().build();
    }
}
