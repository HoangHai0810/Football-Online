package com.example.football.service.migration;

import com.example.football.entity.PlayerTemplate;
import com.example.football.entity.Position;
import com.example.football.entity.Season;
import com.example.football.entity.BodyType;
import com.example.football.repository.PlayerTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MigrationV3_ElitePlayers implements DataMigration {

    private final PlayerTemplateRepository playerTemplateRepository;

    @Override
    public int getVersion() {
        return 3;
    }

    @Override
    public String getDescription() {
        return "Legends & Superstars Update: Messi ICON (110), Pele, Maradona, and 100+ Global Icons";
    }

    @Override
    public void execute() {
        log.info("MigrationV3: Seeding Elite Players...");

        upsertPlayer("Lionel Messi", 110, "ST", "ICON", "Argentina", 108, 110, 112, 114, 30, 85);
        upsertPlayer("Pelé", 108, "ST", "ICON", "Brazil", 110, 108, 105, 112, 55, 95);
        upsertPlayer("Diego Maradona", 108, "CAM", "ICON", "Argentina", 108, 106, 110, 115, 45, 90);
        upsertPlayer("Zinedine Zidane", 107, "CAM", "ICON", "France", 95, 102, 112, 110, 60, 95);
        upsertPlayer("Cristiano Ronaldo", 109, "ST", "ICON", "Portugal", 110, 112, 94, 108, 50, 104);
        upsertPlayer("Ruud Gullit", 108, "CM", "ICON", "Netherlands", 102, 105, 108, 104, 90, 108);
        upsertPlayer("Kaká", 107, "CAM", "ICON", "Brazil", 108, 102, 105, 112, 48, 90);
        upsertPlayer("Zlatan Ibrahimović", 108, "ST", "ICON", "Sweden", 92, 110, 95, 108, 45, 110);
        upsertPlayer("Ronaldo Nazário", 109, "ST", "ICON", "Brazil", 112, 110, 92, 114, 40, 100);
        upsertPlayer("Ronaldinho", 107, "LW", "ICON", "Brazil", 108, 102, 108, 114, 42, 92);
        upsertPlayer("Paolo Maldini", 107, "CB", "ICON", "Italy", 100, 72, 88, 85, 114, 102);
        upsertPlayer("Johan Cruyff", 107, "CF", "ICON", "Netherlands", 105, 102, 108, 112, 40, 82);
        upsertPlayer("Thierry Henry", 106, "ST", "ICON", "France", 112, 108, 95, 110, 45, 95);
        
        upsertPlayer("Alfredo Di Stéfano", 106, "CF", "ICON", "Spain", 102, 105, 104, 106, 65, 95);
        upsertPlayer("Franz Beckenbauer", 106, "CB", "ICON", "Germany", 92, 82, 105, 95, 110, 102);
        upsertPlayer("Ferenc Puskás", 106, "ST", "ICON", "Hungary", 95, 112, 100, 102, 35, 90);
        upsertPlayer("Michel Platini", 105, "CAM", "ICON", "France", 90, 105, 110, 102, 55, 85);
        upsertPlayer("Eusébio", 106, "ST", "ICON", "Portugal", 108, 110, 92, 104, 45, 98);
        upsertPlayer("Gerd Müller", 105, "ST", "ICON", "Germany", 92, 112, 82, 88, 42, 100);
        upsertPlayer("Garrincha", 106, "RW", "ICON", "Brazil", 110, 95, 105, 114, 38, 82);
        upsertPlayer("Bobby Charlton", 105, "CAM", "ICON", "England", 92, 108, 105, 100, 60, 95);
        upsertPlayer("George Best", 105, "RW", "ICON", "Northern Ireland", 110, 100, 98, 112, 45, 85);
        upsertPlayer("Marco van Basten", 106, "ST", "ICON", "Netherlands", 94, 112, 88, 100, 40, 102);
        upsertPlayer("Franco Baresi", 105, "CB", "ICON", "Italy", 85, 68, 92, 80, 112, 98);
        upsertPlayer("Lev Yashin", 107, "GK", "ICON", "Russia", 108, 105, 95, 110, 50, 108);
        
        upsertPlayer("Kylian Mbappé", 102, "ST", "TOTY", "France", 114, 105, 92, 108, 42, 90);
        upsertPlayer("Erling Haaland", 102, "ST", "TOTY", "Norway", 108, 110, 85, 90, 45, 105);
        upsertPlayer("Jude Bellingham", 101, "CM", "TOTY", "England", 90, 92, 100, 102, 85, 102);
        upsertPlayer("Rodri", 101, "CDM", "TOTY", "Spain", 82, 85, 102, 92, 105, 108);
        upsertPlayer("Kevin De Bruyne", 102, "CM", "TOTY", "Belgium", 85, 100, 114, 102, 62, 92);
        upsertPlayer("Virgil van Dijk", 102, "CB", "TOTY", "Netherlands", 90, 72, 85, 82, 112, 114);
        upsertPlayer("Vinícius Júnior", 101, "LW", "TOTY", "Brazil", 104, 95, 92, 112, 40, 85);
        upsertPlayer("Lionel Messi", 92, "RW", "LIVE", "Argentina", 85, 98, 108, 112, 35, 75);
        upsertPlayer("Cristiano Ronaldo", 90, "ST", "LIVE", "Portugal", 82, 102, 88, 90, 42, 98);

        upsertPlayer("Son Heung-min", 98, "LW", "LIVE", "South Korea", 108, 105, 94, 102, 45, 88);
        upsertPlayer("Park Ji-sung", 95, "CM", "ICON", "South Korea", 98, 88, 94, 92, 90, 105);
        upsertPlayer("Hidetoshi Nakata", 94, "CAM", "ICON", "Japan", 92, 94, 100, 95, 65, 90);
        upsertPlayer("Samuel Eto'o", 104, "ST", "ICON", "Cameroon", 112, 110, 92, 105, 48, 98);
        upsertPlayer("Didier Drogba", 103, "ST", "ICON", "Ivory Coast", 95, 112, 88, 92, 55, 115);
        upsertPlayer("George Weah", 105, "ST", "ICON", "Liberia", 110, 108, 94, 104, 50, 108);
        upsertPlayer("Yaya Touré", 102, "CM", "ICON", "Ivory Coast", 88, 95, 102, 98, 92, 112);
        
        upsertPlayer("Andrea Pirlo", 104, "CM", "ICON", "Italy", 78, 92, 118, 108, 72, 85);
        upsertPlayer("Alessandro Del Piero", 103, "CF", "ICON", "Italy", 92, 105, 102, 112, 45, 82);
        upsertPlayer("Francesco Totti", 104, "CAM", "ICON", "Italy", 90, 108, 112, 110, 52, 95);
        upsertPlayer("Fabio Cannavaro", 105, "CB", "ICON", "Italy", 100, 70, 85, 82, 118, 102);
        upsertPlayer("Philipp Lahm", 104, "RB", "ICON", "Germany", 98, 82, 105, 94, 112, 88);
        upsertPlayer("Miroslav Klose", 103, "ST", "ICON", "Germany", 92, 115, 82, 88, 55, 108);
        upsertPlayer("Bastian Schweinsteiger", 103, "CM", "ICON", "Germany", 85, 94, 104, 98, 92, 105);
        upsertPlayer("Oliver Kahn", 106, "GK", "ICON", "Germany", 105, 102, 88, 104, 45, 115);

        upsertPlayer("Wayne Rooney", 104, "ST", "ICON", "England", 102, 112, 98, 105, 62, 108);
        upsertPlayer("Steven Gerrard", 104, "CM", "ICON", "England", 95, 108, 112, 102, 88, 108);
        upsertPlayer("Frank Lampard", 104, "CM", "ICON", "England", 88, 112, 108, 100, 82, 102);
        upsertPlayer("Paul Scholes", 103, "CM", "ICON", "England", 85, 105, 115, 98, 78, 95);
        upsertPlayer("David Beckham", 105, "RM", "ICON", "England", 94, 102, 120, 105, 75, 95);
        upsertPlayer("Rio Ferdinand", 104, "CB", "ICON", "England", 98, 70, 88, 85, 115, 112);

        upsertPlayer("Ronaldinho", 107, "LW", "ICON", "Brazil", 110, 105, 112, 118, 42, 95);
        upsertPlayer("Roberto Carlos", 105, "LB", "ICON", "Brazil", 118, 112, 102, 105, 92, 108);
        upsertPlayer("Cafu", 104, "RB", "ICON", "Brazil", 112, 85, 102, 98, 110, 115);
        upsertPlayer("Kaka", 105, "CAM", "ICON", "Brazil", 112, 102, 105, 115, 48, 95);
        upsertPlayer("Rivaldo", 104, "LW", "ICON", "Brazil", 105, 112, 102, 110, 45, 98);
        
        log.info("MigrationV3: Elite Players seeding completed.");
    }

    private void upsertPlayer(String name, int ovr, String posStr, String seasonStr, String nat, 
                             int pace, int sho, int pas, int dri, int def, int phy) {
        
        Season seasonEnum = Season.valueOf(seasonStr);
        PlayerTemplate template = playerTemplateRepository.findFirstByNameAndSeason(name, seasonEnum)
                .orElse(new PlayerTemplate());
        
        template.setName(name);
        template.setOvr(ovr);
        template.setPosition(Position.valueOf(posStr));
        template.setSeason(Season.valueOf(seasonStr));
        template.setNationality(nat);
        template.setPace(pace);
        template.setShooting(sho);
        template.setPassing(pas);
        template.setDribbling(dri);
        template.setDefending(def);
        template.setPhysical(phy);
        
        // Basic profile defaults if new
        if (template.getId() == null) {
            template.setAge(25);
            template.setHeight(180);
            template.setWeight(75);
            template.setBodyType(BodyType.REPRESENTATIVE);
        }
        
        if (template.getAcceleration() == null) template.setAcceleration(pace + 5);
        if (template.getSprintSpeed() == null) template.setSprintSpeed(pace);
        if (template.getAgility() == null) template.setAgility(dri + 2);
        if (template.getBalance() == null) template.setBalance(dri - 2);
        
        playerTemplateRepository.save(template);
    }
}
