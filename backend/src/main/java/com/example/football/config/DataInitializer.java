package com.example.football.config;
import com.example.football.repository.PlayerTemplateRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.football.entity.AiClub;
import com.example.football.repository.AiClubRepository;

@Configuration
@RequiredArgsConstructor
@Order(Ordered.LOWEST_PRECEDENCE)
public class DataInitializer implements CommandLineRunner {

    private final PlayerTemplateRepository repository;
    private final AiClubRepository aiClubRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            System.out.println("DataInitializer: Player templates will be seeded by Migrations.");
        }
        
        if (aiClubRepository.count() == 0) {
            System.out.println("DataInitializer: Initial seed for AI Clubs...");
            seedAiClubs();
        }
    }

    private void seedAiClubs() {
        List<AiClub> newClubs = new ArrayList<>();
        
        Map<String, AiClub> existingClubsMap = aiClubRepository.findAll().stream()
                .collect(Collectors.toMap(AiClub::getName, club -> club));
        
        // Tier 1: Elite Clubs (95-105 OVR)
        addOrUpdateClub(newClubs, existingClubsMap, "Real Madrid", 1, 105, "Vini Jr, K. Mbappé, J. Bellingham");
        addOrUpdateClub(newClubs, existingClubsMap, "Manchester City", 1, 104, "E. Haaland, K. De Bruyne, Phil Foden");
        addOrUpdateClub(newClubs, existingClubsMap, "Liverpool", 1, 103, "Mohamed Salah, Luis Díaz, V. van Dijk");
        addOrUpdateClub(newClubs, existingClubsMap, "Bayern Munchen", 1, 102, "Harry Kane, Leroy Sané, Jamal Musiala");
        addOrUpdateClub(newClubs, existingClubsMap, "Inter Milan", 1, 101, "Lautaro Martínez, Marcus Thuram, H. Calhanoglu");
        addOrUpdateClub(newClubs, existingClubsMap, "Paris SG", 1, 100, "O. Dembélé, Randal Kolo Muani, Vitinha");
        addOrUpdateClub(newClubs, existingClubsMap, "Arsenal", 1, 99, "Bukayo Saka, Martin Ødegaard, Kai Havertz");
        addOrUpdateClub(newClubs, existingClubsMap, "Barcelona", 1, 98, "Robert Lewandowski, Lamine Yamal, Raphinha");
        addOrUpdateClub(newClubs, existingClubsMap, "Atletico", 1, 97, "Antoine Griezmann, Álvaro Morata, Rodrigo De Paul");
        addOrUpdateClub(newClubs, existingClubsMap, "Bayer Leverkusen", 1, 96, "Florian Wirtz, Victor Boniface, Jeremie Frimpong");
        addOrUpdateClub(newClubs, existingClubsMap, "Stuttgart", 1, 95, "Serhou Guirassy, Deniz Undav, Chris Führich");
        addOrUpdateClub(newClubs, existingClubsMap, "Aston Villa", 1, 95, "Ollie Watkins, Leon Bailey, Douglas Luiz");
        addOrUpdateClub(newClubs, existingClubsMap, "AC Milan", 1, 96, "Rafael Leão, Olivier Giroud, Christian Pulisic");
        addOrUpdateClub(newClubs, existingClubsMap, "Juventus", 1, 97, "Dušan Vlahović, Federico Chiesa, Adrien Rabiot");
        addOrUpdateClub(newClubs, existingClubsMap, "Dortmund", 1, 98, "Niclas Füllkrug, Julian Brandt, Jadon Sancho");
        addOrUpdateClub(newClubs, existingClubsMap, "RB Leipzig", 1, 96, "Loïs Openda, Xavi Simons, Benjamin Šeško");
        addOrUpdateClub(newClubs, existingClubsMap, "Tottenham", 1, 95, "Heung-min Son, James Maddison, Richarlison");
        addOrUpdateClub(newClubs, existingClubsMap, "Man United", 1, 96, "Bruno Fernandes, Rasmus Højlund, A. Garnacho");
        addOrUpdateClub(newClubs, existingClubsMap, "Newcastle", 1, 95, "Alexander Isak, Anthony Gordon, Bruno Guimarães");
        addOrUpdateClub(newClubs, existingClubsMap, "Napoli", 1, 96, "Victor Osimhen, K. Kvaratskhelia, Matteo Politano");

        // Tier 2: Mid-tier Clubs (80-94 OVR)
        addOrUpdateClub(newClubs, existingClubsMap, "Leicester City", 2, 88, "Jamie Vardy, Stephy Mavididi, Kiernan Dewsbury-Hall");
        addOrUpdateClub(newClubs, existingClubsMap, "Southampton", 2, 85, "Adam Armstrong, Ché Adams, Kyle Walker-Peters");
        addOrUpdateClub(newClubs, existingClubsMap, "Ipswich Town", 2, 82, "Conor Chaplin, Nathan Broadhead, Leif Davis");
        addOrUpdateClub(newClubs, existingClubsMap, "Burnley", 2, 86, "Lyle Foster, Zeki Amdouni, Josh Brownhill");
        addOrUpdateClub(newClubs, existingClubsMap, "Luton Town", 2, 83, "Elijah Adebayo, Ross Barkley, Carlton Morris");
        addOrUpdateClub(newClubs, existingClubsMap, "Sheffield Utd", 2, 82, "Ben Brereton Díaz, Cameron Archer, Gustavo Hamer");
        addOrUpdateClub(newClubs, existingClubsMap, "Leeds United", 2, 87, "Crysencio Summerville, Georginio Rutter, Dan James");
        addOrUpdateClub(newClubs, existingClubsMap, "West Brom", 2, 84, "Brandon Thomas-Asante, John Swift, Grady Diangana");
        addOrUpdateClub(newClubs, existingClubsMap, "Norwich City", 2, 84, "Josh Sargent, Gabriel Sara, Jonathan Rowe");
        addOrUpdateClub(newClubs, existingClubsMap, "Hull City", 2, 81, "Jaden Philogene, Fábio Carvalho, Ozan Tufan");
        addOrUpdateClub(newClubs, existingClubsMap, "Middlesbrough", 2, 83, "Emmanuel Latte Lath, Finn Azaz, Isaiah Jones");
        addOrUpdateClub(newClubs, existingClubsMap, "Coventry City", 2, 82, "Haji Wright, Ellis Simms, Callum O'Hare");
        addOrUpdateClub(newClubs, existingClubsMap, "Preston", 2, 80, "Will Keane, Mads Frökjaer-Jensen, Emil Riis");
        addOrUpdateClub(newClubs, existingClubsMap, "Bristol City", 2, 80, "Tommy Conway, Anis Mehmeti, Nahki Wells");
        addOrUpdateClub(newClubs, existingClubsMap, "Cardiff City", 2, 81, "Karlan Grant, Perry Ng, Rubin Colwill");
        addOrUpdateClub(newClubs, existingClubsMap, "Swansea City", 2, 82, "Jerry Yates, Jamie Paterson, Matt Grimes");
        addOrUpdateClub(newClubs, existingClubsMap, "Watford", 2, 83, "Mileta Rajovic, Ken Sema, Yáser Asprilla");
        addOrUpdateClub(newClubs, existingClubsMap, "Sunderland", 2, 84, "Jack Clarke, Jobe Bellingham, Dan Neil");
        addOrUpdateClub(newClubs, existingClubsMap, "Plymouth Argyle", 2, 80, "Morgan Whittaker, Ryan Hardie, Adam Randell");
        addOrUpdateClub(newClubs, existingClubsMap, "QPR", 2, 81, "Ilias Chair, Lyndon Dykes, Chris Willock");

        // Tier 3: Lower-tier Clubs (70-79 OVR)
        addOrUpdateClub(newClubs, existingClubsMap, "Ha Noi FC", 3, 79, "Nguyễn Văn Quyết, Phạm Tuấn Hải, Đỗ Hùng Dũng");
        addOrUpdateClub(newClubs, existingClubsMap, "Viettel FC", 3, 78, "Nguyễn Hoàng Đức, Bùi Tiến Dũng, Nhâm Mạnh Dũng");
        addOrUpdateClub(newClubs, existingClubsMap, "CAHN FC", 3, 79, "Nguyễn Quang Hải, Vũ Văn Thanh, Đoàn Văn Hậu");
        addOrUpdateClub(newClubs, existingClubsMap, "Thep Xanh Nam Dinh", 3, 77, "Rafaelson, Hendrio Araujo, Nguyễn Văn Toàn");
        addOrUpdateClub(newClubs, existingClubsMap, "LPBank HAGL", 3, 72, "Châu Ngọc Quang, Trần Minh Vương, Quốc Việt");
        addOrUpdateClub(newClubs, existingClubsMap, "Becamex Binh Duong", 3, 75, "Nguyễn Tiến Linh, Quế Ngọc Hải, Vĩ Hào");
        addOrUpdateClub(newClubs, existingClubsMap, "Hai Phong FC", 3, 74, "Joseph Mpande, Lương Xuân Trường, Lucao");
        addOrUpdateClub(newClubs, existingClubsMap, "Dong A Thanh Hoa", 3, 74, "Rimario Gordon, Luiz Antonio, Trịnh Văn Lợi");
        addOrUpdateClub(newClubs, existingClubsMap, "Song Lam Nghe An", 3, 73, "Đinh Xuân Tiến, Olaha, Phan Đình Duy");
        addOrUpdateClub(newClubs, existingClubsMap, "TP.HCM FC", 3, 72, "Ngô Tùng Quốc, Patrik Lê Giang, Timite");
        addOrUpdateClub(newClubs, existingClubsMap, "Hong Linh Ha Tinh", 3, 71, "Trần Phi Sơn, Diallo, Vũ Quang Nam");
        addOrUpdateClub(newClubs, existingClubsMap, "Quang Nam FC", 3, 70, "Hoàng Vũ Samson, Đình Bắc, Paulo Conrado");
        addOrUpdateClub(newClubs, existingClubsMap, "Khanh Hoa FC", 3, 70, "Le Duy Thanh, Guirassy, Douglas");
        addOrUpdateClub(newClubs, existingClubsMap, "MerryLand Quy Nhon", 3, 73, "Alan Grafite, Leo Artur, Đặng Văn Lâm");
        addOrUpdateClub(newClubs, existingClubsMap, "Da Nang FC", 3, 71, "Phạm Đình Duy, Minh Quang, Lương Duy Cương");
        addOrUpdateClub(newClubs, existingClubsMap, "PVF-CAND", 3, 70, "Lê Minh Bình, Thanh Nhàn, Công Đến");
        addOrUpdateClub(newClubs, existingClubsMap, "Wrexham AFC", 3, 72, "Paul Mullin, Steven Fletcher, Elliot Lee");
        addOrUpdateClub(newClubs, existingClubsMap, "Stockport County", 3, 71, "Isaac Olaofe, Paddy Madden, Louis Barry");
        addOrUpdateClub(newClubs, existingClubsMap, "Mansfield Town", 3, 70, "Lucas Akins, Davis Keillor-Dunn, Will Swan");
        addOrUpdateClub(newClubs, existingClubsMap, "MK Dons", 3, 70, "Max Dean, Alex Gilbey, Joe Tomlinson");

        aiClubRepository.saveAll(newClubs);
        System.out.println("DataInitializer: Synced 60 AI Clubs (Upsert).");
    }

    private void addOrUpdateClub(List<AiClub> list, Map<String, AiClub> map, String name, int tier, int ovr, String stars) {
        AiClub club = map.getOrDefault(name, new AiClub());
        club.setName(name);
        club.setLeagueTier(tier);
        club.setBaseOvr(ovr);
        club.setStarPlayers(stars);
        list.add(club);
    }
}
