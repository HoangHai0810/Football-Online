package com.example.football.service;

import com.example.football.entity.PlayerTemplate;
import com.example.football.entity.Season;
import com.example.football.repository.PlayerTemplateRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlayerTemplateService {

    private final PlayerTemplateRepository playerTemplateRepository;

    public List<PlayerTemplate> getAllTemplates() {
        return playerTemplateRepository.findAll();
    }

    public Page<PlayerTemplate> getTemplatesPaged(String search, String season, String pos, Integer minOvr, Integer maxOvr, Pageable pageable) {
        Specification<PlayerTemplate> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isEmpty()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), likePattern),
                        cb.like(cb.lower(root.get("nationality")), likePattern)
                ));
            }

            if (season != null && !season.equals("ALL")) {
                try {
                    predicates.add(cb.equal(root.get("season"), Season.valueOf(season)));
                } catch (Exception ignored) {}
            }

            if (pos != null && !pos.equals("ALL")) {
                predicates.add(cb.equal(root.get("position"), pos));
            }

            if (minOvr != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("ovr"), minOvr));
            }

            if (maxOvr != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("ovr"), maxOvr));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return playerTemplateRepository.findAll(spec, pageable);
    }

    public PlayerTemplate saveTemplate(PlayerTemplate template) {
        ensureNoNullStats(template);
        calculateFaceStats(template);
        calculateOvr(template);
        return playerTemplateRepository.save(template);
    }

    private void ensureNoNullStats(PlayerTemplate p) {
        if (p.getAcceleration() == null) p.setAcceleration(0);
        if (p.getSprintSpeed() == null) p.setSprintSpeed(0);
        if (p.getFinishing() == null) p.setFinishing(0);
        if (p.getShotPower() == null) p.setShotPower(0);
        if (p.getLongShot() == null) p.setLongShot(0);
        if (p.getPositioning() == null) p.setPositioning(0);
        if (p.getVolleys() == null) p.setVolleys(0);
        if (p.getShortPassing() == null) p.setShortPassing(0);
        if (p.getLongPassing() == null) p.setLongPassing(0);
        if (p.getVision() == null) p.setVision(0);
        if (p.getCrossing() == null) p.setCrossing(0);
        if (p.getCurve() == null) p.setCurve(0);
        if (p.getDribblingStat() == null) p.setDribblingStat(0);
        if (p.getBallControl() == null) p.setBallControl(0);
        if (p.getAgility() == null) p.setAgility(0);
        if (p.getBalance() == null) p.setBalance(0);
        if (p.getReactions() == null) p.setReactions(0);
        if (p.getInterceptions() == null) p.setInterceptions(0);
        if (p.getMarking() == null) p.setMarking(0);
        if (p.getStandingTackle() == null) p.setStandingTackle(0);
        if (p.getSlidingTackle() == null) p.setSlidingTackle(0);
        if (p.getStrength() == null) p.setStrength(0);
        if (p.getAggression() == null) p.setAggression(0);
        if (p.getStamina() == null) p.setStamina(0);
        if (p.getJumping() == null) p.setJumping(0);
        if (p.getHeading() == null) p.setHeading(0);
        if (p.getDiving() == null) p.setDiving(0);
        if (p.getReflexes() == null) p.setReflexes(0);
        if (p.getHandling() == null) p.setHandling(0);
        if (p.getGkPositioning() == null) p.setGkPositioning(0);
        if (p.getKicking() == null) p.setKicking(0);
    }

    private void calculateFaceStats(PlayerTemplate p) {
        p.setPace((p.getAcceleration() + p.getSprintSpeed()) / 2);
        p.setShooting((p.getFinishing() + p.getShotPower() + p.getLongShot() + p.getPositioning() + p.getVolleys()) / 5);
        p.setPassing((p.getShortPassing() + p.getLongPassing() + p.getVision() + p.getCrossing() + p.getCurve()) / 5);
        p.setDribbling((p.getDribblingStat() + p.getBallControl() + p.getAgility() + p.getBalance() + p.getReactions()) / 5);
        p.setDefending((p.getInterceptions() + p.getMarking() + p.getStandingTackle() + p.getSlidingTackle()) / 4);
        p.setPhysical((p.getStrength() + p.getAggression() + p.getStamina() + p.getJumping() + p.getHeading()) / 5);
    }

    private void calculateOvr(PlayerTemplate p) {
        int coreStatsSum = p.getPace() + p.getShooting() + p.getPassing() + p.getDribbling() + p.getDefending() + p.getPhysical();
        p.setOvr(coreStatsSum / 6);
    }

    public PlayerTemplate getTemplateById(Long id) {
        return playerTemplateRepository.findById(id).orElseThrow(() -> new RuntimeException("Template not found"));
    }

    public void deleteTemplate(Long id) {
        playerTemplateRepository.deleteById(id);
    }
}
