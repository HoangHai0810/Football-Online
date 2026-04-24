package com.example.football.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import io.sentry.Sentry;

@RestController
public class SentryTestController {

    @GetMapping("/sentry-test")
    public String triggerException() {
        try {
            throw new Exception("This is a test sentry exception.");
        } catch (Exception e) {
            Sentry.captureException(e);
            return "Exception captured by Sentry!";
        }
    }
}
