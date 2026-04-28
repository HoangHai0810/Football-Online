package com.example.football.client;

import java.util.List;

public interface FootballDataClient {
    List<ExternalPlayerDto> fetchPlayersByTeam(String teamName);

    class ExternalPlayerDto {
        public String idPlayer;
        public String strPlayer;
        public String strNationality;
        public String strTeam;
        public String strPosition;
        public String dateBorn;
        public String strHeight;
        public String strWeight;
        public String strThumb;
        public String strCutout;
    }
}
