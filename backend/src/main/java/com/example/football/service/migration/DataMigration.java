package com.example.football.service.migration;

public interface DataMigration {
    default int getSeconds() { return getVersion(); }
    int getVersion();
    String getDescription();
    void execute();
}
