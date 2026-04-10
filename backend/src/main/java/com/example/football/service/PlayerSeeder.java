package com.example.football.service;

import com.example.football.entity.*;
import com.example.football.repository.PlayerTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PlayerSeeder {

    private final PlayerTemplateRepository repository;
    private final Random random = new Random();

    private static class RealPlayer {
        String name;
        String nationality;
        String club;
        Position pos;

        RealPlayer(String n, String nat, String c, Position p) {
            this.name = n; this.nationality = nat; this.club = c; this.pos = p;
        }
    }

    private static final List<RealPlayer> ELITE_PLAYERS = Arrays.asList(
        // Legends
        new RealPlayer("Pelé", "Brazil", "Santos", Position.CF),
        new RealPlayer("Diego Maradona", "Argentina", "Napoli", Position.CAM),
        new RealPlayer("Johan Cruyff", "Netherlands", "FC Barcelona", Position.CF),
        new RealPlayer("Ronaldinho", "Brazil", "FC Barcelona", Position.LW),
        new RealPlayer("Zinedine Zidane", "France", "Real Madrid", Position.CAM),
        new RealPlayer("Paolo Maldini", "Italy", "AC Milan", Position.CB),
        new RealPlayer("Lev Yashin", "Russia", "Dynamo Moscow", Position.GK),
        new RealPlayer("Thierry Henry", "France", "Arsenal", Position.ST),
        new RealPlayer("Ruud Gullit", "Netherlands", "AC Milan", Position.CM),

        // Modern Superstars
        new RealPlayer("Lionel Messi", "Argentina", "Inter Miami", Position.RW),
        new RealPlayer("Cristiano Ronaldo", "Portugal", "Al Nassr", Position.ST),
        new RealPlayer("Kylian Mbappé", "France", "Real Madrid", Position.ST),
        new RealPlayer("Erling Haaland", "Norway", "Man City", Position.ST),
        new RealPlayer("Kevin De Bruyne", "Belgium", "Man City", Position.CAM),
        new RealPlayer("Vinícius Júnior", "Brazil", "Real Madrid", Position.LW),
        new RealPlayer("Jude Bellingham", "England", "Real Madrid", Position.CAM),
        new RealPlayer("Mohamed Salah", "Egypt", "Liverpool", Position.RW),
        new RealPlayer("Virgil van Dijk", "Netherlands", "Liverpool", Position.CB),
        new RealPlayer("Harry Kane", "England", "Bayern Munich", Position.ST),
        
        // Elite Tier 1
        new RealPlayer("Luka Modrić", "Croatia", "Real Madrid", Position.CM),
        new RealPlayer("Robert Lewandowski", "Poland", "FC Barcelona", Position.ST),
        new RealPlayer("Thibaut Courtois", "Belgium", "Real Madrid", Position.GK),
        new RealPlayer("Rodri", "Spain", "Man City", Position.CDM),
        new RealPlayer("Phil Foden", "England", "Man City", Position.RW),
        new RealPlayer("Bukayo Saka", "England", "Arsenal", Position.RW),
        new RealPlayer("Son Heung-min", "Korea", "Tottenham", Position.LW),
        new RealPlayer("Antoine Griezmann", "France", "Atletico Madrid", Position.ST),
        new RealPlayer("Bernardo Silva", "Portugal", "Man City", Position.CM),
        new RealPlayer("Joshua Kimmich", "Germany", "Bayern Munich", Position.CDM),
        new RealPlayer("Jan Oblak", "Slovenia", "Atletico Madrid", Position.GK),
        new RealPlayer("Alisson Becker", "Brazil", "Liverpool", Position.GK),
        new RealPlayer("David Alaba", "Austria", "Real Madrid", Position.CB),
        new RealPlayer("Bruno Fernandes", "Portugal", "Man Utd", Position.CAM),
        new RealPlayer("Rafael Leão", "Portugal", "AC Milan", Position.LW),
        new RealPlayer("Lautaro Martínez", "Argentina", "Inter Milan", Position.ST),
        new RealPlayer("Pedri", "Spain", "FC Barcelona", Position.CM),
        new RealPlayer("Gavi", "Spain", "FC Barcelona", Position.CM),

        // Elite Tier 2
        new RealPlayer("Frenkie de Jong", "Netherlands", "FC Barcelona", Position.CM),
        new RealPlayer("Marcus Rashford", "England", "Man Utd", Position.LW),
        new RealPlayer("Manuel Neuer", "Germany", "Bayern Munich", Position.GK),
        new RealPlayer("Declan Rice", "England", "Arsenal", Position.CDM),
        new RealPlayer("Martin Ødegaard", "Norway", "Arsenal", Position.CAM),
        new RealPlayer("Rúben Dias", "Portugal", "Man City", Position.CB),
        new RealPlayer("Jamal Musiala", "Germany", "Bayern Munich", Position.CAM),
        new RealPlayer("Khvicha Kvaratskhelia", "Georgia", "Napoli", Position.LW),
        new RealPlayer("Victor Osimhen", "Nigeria", "Napoli", Position.ST),
        new RealPlayer("Achraf Hakimi", "Morocco", "PSG", Position.RB),
        new RealPlayer("Theo Hernández", "France", "AC Milan", Position.LB),
        new RealPlayer("Marquinhos", "Brazil", "PSG", Position.CB),
        new RealPlayer("Trent Alexander-Arnold", "England", "Liverpool", Position.RB),
        new RealPlayer("Ederson", "Brazil", "Man City", Position.GK),
        new RealPlayer("Federico Valverde", "Uruguay", "Real Madrid", Position.CM),
        new RealPlayer("Aurélien Tchouaméni", "France", "Real Madrid", Position.CDM),
        new RealPlayer("Eduardo Camavinga", "France", "Real Madrid", Position.CM),
        new RealPlayer("Leroy Sané", "Germany", "Bayern Munich", Position.RW),
        new RealPlayer("João Cancelo", "Portugal", "FC Barcelona", Position.RB),
        new RealPlayer("Ronald Araújo", "Uruguay", "FC Barcelona", Position.CB),
        new RealPlayer("Marc-André ter Stegen", "Germany", "FC Barcelona", Position.GK),
        new RealPlayer("Ousmane Dembélé", "France", "PSG", Position.RW),
        
        // Massive Expansion
        new RealPlayer("Gianluigi Donnarumma", "Italy", "PSG", Position.GK),
        new RealPlayer("Alessandro Bastoni", "Italy", "Inter Milan", Position.CB),
        new RealPlayer("Nicolò Barella", "Italy", "Inter Milan", Position.CM),
        new RealPlayer("Federico Chiesa", "Italy", "Juventus", Position.LW),
        new RealPlayer("Dusan Vlahovic", "Serbia", "Juventus", Position.ST),
        new RealPlayer("Bremer", "Brazil", "Juventus", Position.CB),
        new RealPlayer("Wojciech Szczęsny", "Poland", "Juventus", Position.GK),
        new RealPlayer("Adrien Rabiot", "France", "Juventus", Position.CM),
        new RealPlayer("Hakan Çalhanoğlu", "Turkey", "Inter Milan", Position.CDM),
        new RealPlayer("Marcus Thuram", "France", "Inter Milan", Position.ST),
        new RealPlayer("Benjamin Pavard", "France", "Inter Milan", Position.CB),
        new RealPlayer("Federico Dimarco", "Italy", "Inter Milan", Position.LWB),
        new RealPlayer("Olivier Giroud", "France", "AC Milan", Position.ST),
        new RealPlayer("Christian Pulisic", "USA", "AC Milan", Position.RW),
        new RealPlayer("Fikayo Tomori", "England", "AC Milan", Position.CB),
        new RealPlayer("Mike Maignan", "France", "AC Milan", Position.GK),
        new RealPlayer("Victor Boniface", "Nigeria", "Bayer Leverkusen", Position.ST),
        new RealPlayer("Florian Wirtz", "Germany", "Bayer Leverkusen", Position.CAM),
        new RealPlayer("Jeremie Frimpong", "Netherlands", "Bayer Leverkusen", Position.RWB),
        new RealPlayer("Alejandro Grimaldo", "Spain", "Bayer Leverkusen", Position.LWB),
        new RealPlayer("Granit Xhaka", "Switzerland", "Bayer Leverkusen", Position.CM),
        new RealPlayer("Jonathan Tah", "Germany", "Bayer Leverkusen", Position.CB),
        new RealPlayer("Serhou Guirassy", "Guinea", "VfB Stuttgart", Position.ST),
        new RealPlayer("Xavi Simons", "Netherlands", "RB Leipzig", Position.CAM),
        new RealPlayer("Loïs Openda", "Belgium", "RB Leipzig", Position.ST),
        new RealPlayer("Dani Olmo", "Spain", "RB Leipzig", Position.CAM),
        new RealPlayer("Alphonso Davies", "Canada", "Bayern Munich", Position.LB),
        new RealPlayer("Leon Goretzka", "Germany", "Bayern Munich", Position.CM),
        new RealPlayer("Dayot Upamecano", "France", "Bayern Munich", Position.CB),
        new RealPlayer("Kim Min-jae", "Korea", "Bayern Munich", Position.CB),
        new RealPlayer("Thomas Müller", "Germany", "Bayern Munich", Position.CAM),
        new RealPlayer("Kingsley Coman", "France", "Bayern Munich", Position.LW),
        new RealPlayer("Matthijs de Ligt", "Netherlands", "Bayern Munich", Position.CB),
        new RealPlayer("Julian Brandt", "Germany", "Dortmund", Position.CAM),
        new RealPlayer("Gregor Kobel", "Switzerland", "Dortmund", Position.GK),
        new RealPlayer("Nico Schlotterbeck", "Germany", "Dortmund", Position.CB),
        new RealPlayer("Mats Hummels", "Germany", "Dortmund", Position.CB),
        new RealPlayer("Marcel Sabitzer", "Austria", "Dortmund", Position.CM),
        new RealPlayer("Donyell Malen", "Netherlands", "Dortmund", Position.RW),
        new RealPlayer("Jadon Sancho", "England", "Dortmund", Position.LW),
        new RealPlayer("Darwin Núñez", "Uruguay", "Liverpool", Position.ST),
        new RealPlayer("Luis Díaz", "Colombia", "Liverpool", Position.LW),
        new RealPlayer("Diogo Jota", "Portugal", "Liverpool", Position.ST),
        new RealPlayer("Cody Gakpo", "Netherlands", "Liverpool", Position.LW),
        new RealPlayer("Dominik Szoboszlai", "Hungary", "Liverpool", Position.CM),
        new RealPlayer("Alexis Mac Allister", "Argentina", "Liverpool", Position.CM),
        new RealPlayer("Andrew Robertson", "Scotland", "Liverpool", Position.LB),
        new RealPlayer("Ibrahima Konaté", "France", "Liverpool", Position.CB),
        new RealPlayer("Gabriel Martinelli", "Brazil", "Arsenal", Position.LW),
        new RealPlayer("Leandro Trossard", "Belgium", "Arsenal", Position.LW),
        new RealPlayer("Gabriel Jesus", "Brazil", "Arsenal", Position.ST),
        new RealPlayer("Kai Havertz", "Germany", "Arsenal", Position.CAM),
        new RealPlayer("William Saliba", "France", "Arsenal", Position.CB),
        new RealPlayer("Gabriel Magalhães", "Brazil", "Arsenal", Position.CB),
        new RealPlayer("Ben White", "England", "Arsenal", Position.RB),
        new RealPlayer("David Raya", "Spain", "Arsenal", Position.GK),
        new RealPlayer("Jack Grealish", "England", "Man City", Position.LW),
        new RealPlayer("Jérémy Doku", "Belgium", "Man City", Position.LW),
        new RealPlayer("Julián Álvarez", "Argentina", "Man City", Position.ST),
        new RealPlayer("Mateo Kovačić", "Croatia", "Man City", Position.CM),
        new RealPlayer("John Stones", "England", "Man City", Position.CB),
        new RealPlayer("Kyle Walker", "England", "Man City", Position.RB),
        new RealPlayer("Manuel Akanji", "Switzerland", "Man City", Position.CB),
        new RealPlayer("Nathan Aké", "Netherlands", "Man City", Position.CB),
        new RealPlayer("Josko Gvardiol", "Croatia", "Man City", Position.LB),
        new RealPlayer("Alejandro Garnacho", "Argentina", "Man Utd", Position.LW),
        new RealPlayer("Rasmus Højlund", "Denmark", "Man Utd", Position.ST),
        new RealPlayer("Kobbie Mainoo", "England", "Man Utd", Position.CM),
        new RealPlayer("Lisandro Martínez", "Argentina", "Man Utd", Position.CB),
        new RealPlayer("Diogo Dalot", "Portugal", "Man Utd", Position.RB),
        new RealPlayer("André Onana", "Cameroon", "Man Utd", Position.GK),
        new RealPlayer("Cole Palmer", "England", "Chelsea", Position.RW),
        new RealPlayer("Enzo Fernández", "Argentina", "Chelsea", Position.CM),
        new RealPlayer("Moisés Caicedo", "Ecuador", "Chelsea", Position.CDM),
        new RealPlayer("Conor Gallagher", "England", "Chelsea", Position.CM),
        new RealPlayer("Reece James", "England", "Chelsea", Position.RB),
        new RealPlayer("Thiago Silva", "Brazil", "Chelsea", Position.CB),
        new RealPlayer("Alexander Isak", "Sweden", "Newcastle", Position.ST),
        new RealPlayer("Anthony Gordon", "England", "Newcastle", Position.LW),
        new RealPlayer("Bruno Guimarães", "Brazil", "Newcastle", Position.CM),
        new RealPlayer("Kieran Trippier", "England", "Newcastle", Position.RB),
        new RealPlayer("Sven Botman", "Netherlands", "Newcastle", Position.CB),
        new RealPlayer("James Maddison", "England", "Tottenham", Position.CAM),
        new RealPlayer("Cristian Romero", "Argentina", "Tottenham", Position.CB),
        new RealPlayer("Micky van de Ven", "Netherlands", "Tottenham", Position.CB),
        new RealPlayer("Pedro Porro", "Spain", "Tottenham", Position.RB),
        new RealPlayer("Guglielmo Vicario", "Italy", "Tottenham", Position.GK),
        new RealPlayer("Dejan Kulusevski", "Sweden", "Tottenham", Position.RW),
        new RealPlayer("Ollie Watkins", "England", "Aston Villa", Position.ST),
        new RealPlayer("Douglas Luiz", "Brazil", "Aston Villa", Position.CDM),
        new RealPlayer("Emiliano Martínez", "Argentina", "Aston Villa", Position.GK),
        new RealPlayer("Pau Torres", "Spain", "Aston Villa", Position.CB),
        new RealPlayer("Leon Bailey", "Jamaica", "Aston Villa", Position.RW),
        new RealPlayer("Joško Gvardiol", "Croatia", "Man City", Position.LB),
        new RealPlayer("Rodrygo", "Brazil", "Real Madrid", Position.RW),
        new RealPlayer("Brahim Díaz", "Morocco", "Real Madrid", Position.CAM),
        new RealPlayer("Éder Militão", "Brazil", "Real Madrid", Position.CB),
        new RealPlayer("Dani Carvajal", "Spain", "Real Madrid", Position.RB),
        new RealPlayer("Ferland Mendy", "France", "Real Madrid", Position.LB),
        new RealPlayer("Andriy Lunin", "Ukraine", "Real Madrid", Position.GK),
        new RealPlayer("Lamine Yamal", "Spain", "FC Barcelona", Position.RW),
        new RealPlayer("Raphinha", "Brazil", "FC Barcelona", Position.LW),
        new RealPlayer("João Félix", "Portugal", "FC Barcelona", Position.ST),
        new RealPlayer("İlkay Gündoğan", "Germany", "FC Barcelona", Position.CM),
        new RealPlayer("Jules Koundé", "France", "FC Barcelona", Position.RB),
        new RealPlayer("Andreas Christensen", "Denmark", "FC Barcelona", Position.CB),
        new RealPlayer("Pau Cubarsí", "Spain", "FC Barcelona", Position.CB),
        new RealPlayer("Alejandro Balde", "Spain", "FC Barcelona", Position.LB),
        new RealPlayer("Vitinha", "Portugal", "PSG", Position.CM),
        new RealPlayer("Warren Zaïre-Emery", "France", "PSG", Position.CM),
        new RealPlayer("Bradley Barcola", "France", "PSG", Position.LW),
        new RealPlayer("Gonçalo Ramos", "Portugal", "PSG", Position.ST),
        new RealPlayer("Lucas Hernández", "France", "PSG", Position.CB),
        new RealPlayer("Nuno Mendes", "Portugal", "PSG", Position.LB),
        new RealPlayer("Milan Škriniar", "Slovakia", "PSG", Position.CB),
        
        // Legends Expansion
        new RealPlayer("David Beckham", "England", "Man Utd", Position.RM),
        new RealPlayer("Wayne Rooney", "England", "Man Utd", Position.CF),
        new RealPlayer("Paul Scholes", "England", "Man Utd", Position.CM),
        new RealPlayer("Ryan Giggs", "Wales", "Man Utd", Position.LM),
        new RealPlayer("Roy Keane", "Ireland", "Man Utd", Position.CDM),
        new RealPlayer("Rio Ferdinand", "England", "Man Utd", Position.CB),
        new RealPlayer("Nemanja Vidić", "Serbia", "Man Utd", Position.CB),
        new RealPlayer("Edwin van der Sar", "Netherlands", "Man Utd", Position.GK),
        new RealPlayer("Patrick Vieira", "France", "Arsenal", Position.CM),
        new RealPlayer("Dennis Bergkamp", "Netherlands", "Arsenal", Position.CF),
        new RealPlayer("Robert Pirès", "France", "Arsenal", Position.LM),
        new RealPlayer("Sol Campbell", "England", "Arsenal", Position.CB),
        new RealPlayer("Frank Lampard", "England", "Chelsea", Position.CM),
        new RealPlayer("Didier Drogba", "Ivory Coast", "Chelsea", Position.ST),
        new RealPlayer("Ashley Cole", "England", "Chelsea", Position.LB),
        new RealPlayer("Steven Gerrard", "England", "Liverpool", Position.CM),
        new RealPlayer("Xabi Alonso", "Spain", "Liverpool", Position.CDM),
        new RealPlayer("Fernando Torres", "Spain", "Liverpool", Position.ST),
        new RealPlayer("Alan Shearer", "England", "Newcastle", Position.ST),
        new RealPlayer("Kaká", "Brazil", "AC Milan", Position.CAM),
        new RealPlayer("Andrea Pirlo", "Italy", "Juventus", Position.CM),
        new RealPlayer("Alessandro Del Piero", "Italy", "Juventus", Position.CF),
        new RealPlayer("Gianluigi Buffon", "Italy", "Juventus", Position.GK),
        new RealPlayer("Javier Zanetti", "Argentina", "Inter Milan", Position.RB),
        new RealPlayer("Rivaldo", "Brazil", "FC Barcelona", Position.LW),
        new RealPlayer("Carles Puyol", "Spain", "FC Barcelona", Position.CB),
        new RealPlayer("Xavi", "Spain", "FC Barcelona", Position.CM),
        new RealPlayer("Andrés Iniesta", "Spain", "FC Barcelona", Position.CM),
        new RealPlayer("Roberto Carlos", "Brazil", "Real Madrid", Position.LB),
        new RealPlayer("Iker Casillas", "Spain", "Real Madrid", Position.GK),
        new RealPlayer("Luís Figo", "Portugal", "Real Madrid", Position.RW),
        new RealPlayer("Raúl", "Spain", "Real Madrid", Position.ST),
        new RealPlayer("Franz Beckenbauer", "Germany", "Bayern Munich", Position.CB),
        new RealPlayer("Gerd Müller", "Germany", "Bayern Munich", Position.ST),
        new RealPlayer("Lothar Matthäus", "Germany", "Bayern Munich", Position.CM),
        new RealPlayer("Philipp Lahm", "Germany", "Bayern Munich", Position.RB),
        new RealPlayer("Kaka", "Brazil", "Orlando City", Position.CAM)
    );

    private static final String[] GENERIC_FIRST = {"James", "Lucas", "Tom", "Oliver", "Noah", "Liam", "Ethan", "Mason", "Jack", "William", "Ben", "Daniel", "Matthew", "John", "Paul"};
    private static final String[] GENERIC_LAST = {"Adams", "Clark", "Wright", "Mitchell", "Carter", "Phillips", "Campbell", "Parker", "Turner", "Collins", "Edwards", "Stewart", "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera", "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez"};
    private static final String[] COUNTRIES = {"Brazil", "France", "England", "Germany", "Spain", "Italy", "Argentina", "Portugal", "Netherlands", "Belgium", "USA", "Japan", "Vietnam"};
    private static final String[] CLUBS_LIST = {"Real Madrid", "Man City", "Liverpool", "Barcelona", "Bayern Munich", "PSG", "Arsenal", "Inter Milan", "AC Milan", "Man Utd", "Chelsea", "Dortmund", "Ajax"};

    public void seedOneThousandPlayers() {
        if (repository.count() > 300) return; 

        List<PlayerTemplate> players = new ArrayList<>();
        
        // 1. Seed Elite/Icon Players first
        for (RealPlayer rp : ELITE_PLAYERS) {
            int ovr = 85 + random.nextInt(10);
            if (rp.name.equals("Pelé") || rp.name.equals("Maradona") || rp.name.equals("Zidane") || rp.name.equals("Lionel Messi") || rp.name.equals("Ronaldo")) {
                ovr = 105 + random.nextInt(6); // 105-110
            } else if (ovr > 100) {
                ovr = 100;
            }
            players.add(createPlayer(rp.name, rp.pos, rp.nationality, rp.club, ovr));
        }

        // 2. Fill the rest to reach 1000
        int remaining = 1000 - players.size();
        for (int i = 0; i < remaining; i++) {
            int ovr = generateOvr();
            if (ovr > 100) ovr = 95 + random.nextInt(5);
            
            String name = GENERIC_FIRST[random.nextInt(GENERIC_FIRST.length)] + " " + GENERIC_LAST[random.nextInt(GENERIC_LAST.length)];
            Position pos = Position.values()[random.nextInt(Position.values().length)];
            String nat = COUNTRIES[random.nextInt(COUNTRIES.length)];
            String selectedClub = CLUBS_LIST[random.nextInt(CLUBS_LIST.length)];
            
            players.add(createPlayer(name, pos, nat, selectedClub, ovr));

            if (players.size() >= 100) {
                repository.saveAll(players);
                players.clear();
            }
        }
        
        if (!players.isEmpty()) {
            repository.saveAll(players);
        }
    }

    private PlayerTemplate createPlayer(String name, Position pos, String nat, String club, int ovr) {
        Season season = determineSeason(ovr);
        
        // Face stats
        int pace = clamp(ovr - 5 + random.nextInt(15));
        int sho = clamp(ovr - 10 + random.nextInt(20));
        int pas = clamp(ovr - 5 + random.nextInt(15));
        int dri = clamp(ovr - 5 + random.nextInt(15));
        int def = clamp(ovr - 15 + random.nextInt(25));
        int phy = clamp(ovr - 10 + random.nextInt(20));

        PlayerTemplate player = PlayerTemplate.builder()
                .name(name)
                .position(pos)
                .age(18 + random.nextInt(20))
                .height(170 + random.nextInt(30))
                .weight(65 + random.nextInt(25))
                .bodyType(BodyType.values()[random.nextInt(BodyType.values().length)])
                .nationality(nat)
                .club(club)
                .season(season)
                .ovr(ovr)
                .pace(pace)
                .shooting(sho)
                .passing(pas)
                .dribbling(dri)
                .defending(def)
                .physical(phy)
                
                // PAC Components
                .acceleration(clamp(pace + random.nextInt(10) - 5))
                .sprintSpeed(clamp(pace + random.nextInt(10) - 5))
                
                // SHO Components
                .finishing(clamp(sho + random.nextInt(10) - 5))
                .shotPower(clamp(sho + random.nextInt(10) - 5))
                .longShot(clamp(sho + random.nextInt(10) - 5))
                .positioning(clamp(sho + random.nextInt(10) - 5))
                .volleys(clamp(sho + random.nextInt(10) - 5))
                
                // PAS Components
                .shortPassing(clamp(pas + random.nextInt(10) - 5))
                .longPassing(clamp(pas + random.nextInt(10) - 5))
                .vision(clamp(pas + random.nextInt(10) - 5))
                .crossing(clamp(pas + random.nextInt(10) - 5))
                .curve(clamp(pas + random.nextInt(10) - 5))
                
                // DRI Components
                .dribblingStat(clamp(dri + random.nextInt(10) - 5))
                .ballControl(clamp(dri + random.nextInt(10) - 5))
                .agility(clamp(dri + random.nextInt(10) - 5))
                .balance(clamp(dri + random.nextInt(10) - 5))
                .reactions(clamp(dri + random.nextInt(10) - 5))
                
                // DEF Components
                .interceptions(clamp(def + random.nextInt(10) - 5))
                .marking(clamp(def + random.nextInt(10) - 5))
                .standingTackle(clamp(def + random.nextInt(10) - 5))
                .slidingTackle(clamp(def + random.nextInt(10) - 5))
                .heading(clamp(def + random.nextInt(20) - 10))
                
                // PHY Components
                .strength(clamp(phy + random.nextInt(10) - 5))
                .aggression(clamp(phy + random.nextInt(10) - 5))
                .stamina(clamp(phy + random.nextInt(10) - 5))
                .jumping(clamp(phy + random.nextInt(10) - 5))
                
                .attackingWorkRate(WorkRate.values()[random.nextInt(WorkRate.values().length)])
                .defensiveWorkRate(WorkRate.values()[random.nextInt(WorkRate.values().length)])
                .build();

        if (pos == Position.GK) {
            player.setDiving(clamp(ovr + random.nextInt(10) - 5));
            player.setReflexes(clamp(ovr + random.nextInt(10) - 5));
            player.setHandling(clamp(ovr + random.nextInt(10) - 5));
            player.setGkPositioning(clamp(ovr + random.nextInt(10) - 5));
            player.setKicking(clamp(ovr + random.nextInt(10) - 5));
        }
        return player;
    }

    private int generateOvr() {
        double roll = random.nextDouble();
        if (roll < 0.05) return 85 + random.nextInt(10);
        if (roll < 0.20) return 75 + random.nextInt(10);
        return 60 + random.nextInt(15);
    }

    private Season determineSeason(int ovr) {
        if (ovr >= 100) return Season.ICON;
        if (ovr >= 95) return Season.TOTY;
        if (ovr >= 85) return Season.LIVE;
        return Season.BASE;
    }

    private int clamp(int val) {
        return Math.max(1, Math.min(130, val));
    }
}
