package com.example.football.controller;

import com.example.football.entity.PlayerTemplate;
import com.example.football.service.PlayerTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerTemplateService playerTemplateService;

    @GetMapping
    public Page<PlayerTemplate> getAllTemplates(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String season,
            @RequestParam(required = false) String pos,
            @RequestParam(required = false) Integer minOvr,
            @RequestParam(required = false) Integer maxOvr,
            Pageable pageable) {
        return playerTemplateService.getTemplatesPaged(search, season, pos, minOvr, maxOvr, pageable);
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
